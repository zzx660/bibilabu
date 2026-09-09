// 端到端加密核心(libsodium)
// 私钥存 IndexedDB(Phase 7 会加 KEK 包裹)
// 流程:
//   注册 → 生成 X25519 密钥对 → 公钥存 profiles.pub_key,私钥存 IndexedDB
//   建 room → 生成 room_key(随机 32B) → 用每个成员公钥加密存 chat_room_keys
//   发消息 → secretbox_easy(plaintext, nonce, room_key) → 存 ciphertext+nonce
//   收消息 → box_seal_open(encrypted_room_key) → 得 room_key → secretbox_open_easy

import _sodium from 'libsodium-wrappers'

let ready = false
async function ensure() {
  if (!ready) {
    await _sodium.ready
    ready = true
  }
  return _sodium
}

function b64(buf: Uint8Array): string {
  let s = ''
  for (const b of buf) s += String.fromCharCode(b)
  return btoa(s)
}
function unb64(s: string): Uint8Array {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// ---- IndexedDB(只存私钥)----
const DB_NAME = 'scripture-keystore'
const STORE = 'keys'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbSet(key: string, val: string) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(val, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
async function idbGet(key: string): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}
async function idbDel(key: string) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const PRIV_KEY = 'private_key'
const PUB_KEY = 'public_key'

// ---- 公开 API ----
export async function generateKeyPair(): Promise<{ pubKeyB64: string; privKeyB64: string }> {
  const s = await ensure()
  const kp = s.crypto_box_keypair()
  const pub = b64(kp.publicKey)
  const priv = b64(kp.privateKey)
  await idbSet(PRIV_KEY, priv)
  await idbSet(PUB_KEY, pub)
  return { pubKeyB64: pub, privKeyB64: priv }
}

export async function hasLocalKeys(): Promise<boolean> {
  return (await idbGet(PRIV_KEY)) !== null
}

export async function loadPrivateKey(): Promise<Uint8Array> {
  const v = await idbGet(PRIV_KEY)
  if (!v) throw new Error('私钥未找到,请重新生成密钥')
  return unb64(v)
}

export async function loadPublicKey(): Promise<Uint8Array | null> {
  const v = await idbGet(PUB_KEY)
  return v ? unb64(v) : null
}

export async function wipeKeys() {
  await idbDel(PRIV_KEY)
  await idbDel(PUB_KEY)
}

// room_key:随机 32 字节对称密钥
export async function generateRoomKey(): Promise<string> {
  const s = await ensure()
  return b64(s.randombytes_buf(32))
}

// 用成员公钥加密 room_key(对方公钥 → 密文)
export async function sealRoomKey(roomKeyB64: string, memberPubKeyB64: string): Promise<string> {
  const s = await ensure()
  const sealed = s.crypto_box_seal(
    new TextEncoder().encode(roomKeyB64),
    unb64(memberPubKeyB64)
  )
  return b64(sealed)
}

// 用自己公钥+私钥解密拿到 room_key
export async function openSealedRoomKey(sealedB64: string): Promise<string> {
  const s = await ensure()
  const pub = await loadPublicKey()
  const priv = await loadPrivateKey()
  const opened = s.crypto_box_seal_open(unb64(sealedB64), pub!, priv)
  return new TextDecoder().decode(opened)
}

// 对称加密消息 → { ciphertext, nonce }
export async function encryptMessage(plaintext: string, roomKeyB64: string): Promise<{ ciphertext: string; nonce: string }> {
  const s = await ensure()
  const key = unb64(roomKeyB64)
  const nonce = s.randombytes_buf(s.crypto_secretbox_NONCEBYTES)
  const ct = s.crypto_secretbox_easy(new TextEncoder().encode(plaintext), nonce, key)
  return { ciphertext: b64(ct), nonce: b64(nonce) }
}

// 对称解密
export async function decryptMessage(ciphertextB64: string, nonceB64: string, roomKeyB64: string): Promise<string> {
  const s = await ensure()
  const key = unb64(roomKeyB64)
  const opened = s.crypto_secretbox_open_easy(unb64(ciphertextB64), unb64(nonceB64), key)
  return new TextDecoder().decode(opened)
}

// 缓存已解密的 room_key,避免每条消息都做 box_seal_open
const roomKeyCache = new Map<string, string>()
export async function getRoomKey(roomId: string, sealedB64: string): Promise<string> {
  const cached = roomKeyCache.get(roomId)
  if (cached) return cached
  const key = await openSealedRoomKey(sealedB64)
  roomKeyCache.set(roomId, key)
  return key
}
export function clearRoomKeyCache(roomId?: string) {
  if (roomId) roomKeyCache.delete(roomId)
  else roomKeyCache.clear()
}
