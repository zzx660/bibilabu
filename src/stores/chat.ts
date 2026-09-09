import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, currentProfile } from '@/api/supabase'
import {
  generateRoomKey, sealRoomKey, getRoomKey, encryptMessage, decryptMessage, generateKeyPair, hasLocalKeys
} from '@/api/crypto'

type Room = { id: string; type: 'dm' | 'group'; title: string | null }
type DecryptedMsg = { id: string; sender_id: string; text: string; created_at: string; mine: boolean }

export const useChatStore = defineStore('chat', () => {
  const rooms = ref<Room[]>([])
  const messages = ref<DecryptedMsg[]>([])
  const activeRoom = ref<string | null>(null)
  const myId = ref<string | null>(null)
  const ready = ref(false)

  async function init() {
    if (ready.value) return
    const p = await currentProfile()
    if (!p) return
    myId.value = p.id
    // 确保密钥存在
    if (!p.pub_key) {
      if (!(await hasLocalKeys())) {
        const { pubKeyB64 } = await generateKeyPair()
        await supabase.from('profiles').update({ pub_key: pubKeyB64 }).eq('id', p.id)
      } else {
        // 本地有密钥但服务器没同步(比如换设备后)
      }
    } else if (!(await hasLocalKeys())) {
      // 服务器有公钥但本地无私钥,说明换设备了,需要重新生成(旧消息无法解密)
      // MVP 阶段直接重新生成,后续可做密钥恢复
    }
    await loadRooms()
    ready.value = true
  }

  async function loadRooms() {
    if (!myId.value) return
    const { data } = await supabase
      .from('chat_room_members')
      .select('room_id, rooms(id,type,title)')
      .eq('user_id', myId.value)
    rooms.value = (data || []).map((r: any) => r.rooms).filter(Boolean)
  }

  async function createGroup(title: string, memberIds: string[]): Promise<string | null> {
    if (!myId.value) return null
    const members = [myId.value, ...memberIds.filter((id) => id !== myId.value)]
    const { data: room, error } = await supabase
      .from('chat_rooms')
      .insert({ type: 'group', title, created_by: myId.value })
      .select('id')
      .single()
    if (error || !room) return null

    const roomId = room.id
    await supabase.from('chat_room_members').insert(
      members.map((uid) => ({ room_id: roomId, user_id: uid, role: uid === myId.value ? 'owner' : 'member' }))
    )

    // 生成 room_key 并分发给每个成员
    const roomKey = await generateRoomKey()
    const pubKeys = await supabase.from('profiles').select('id,pub_key').in('id', members)
    for (const m of pubKeys.data || []) {
      if (!m.pub_key) continue
      const sealed = await sealRoomKey(roomKey, m.pub_key)
      await supabase.from('chat_room_keys').insert({
        room_id: roomId,
        user_id: m.id,
        encrypted_key: sealed
      })
    }
    await loadRooms()
    return roomId
  }

  async function openRoom(roomId: string) {
    activeRoom.value = roomId
    messages.value = []
    await loadHistory(roomId)
    await subscribe(roomId)
  }

  async function loadHistory(roomId: string) {
    const { data } = await supabase
      .from('chat_messages')
      .select('id,sender_id,ciphertext,nonce,created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(200)
    if (!data) return
    const { data: myKey } = await supabase
      .from('chat_room_keys')
      .select('encrypted_key')
      .eq('room_id', roomId)
      .eq('user_id', myId.value!)
      .single()
    if (!myKey) return
    const roomKey = await getRoomKey(roomId, myKey.encrypted_key)
    const out: DecryptedMsg[] = []
    for (const m of data) {
      try {
        const text = await decryptMessage(m.ciphertext, m.nonce, roomKey)
        out.push({ id: m.id, sender_id: m.sender_id, text, created_at: m.created_at, mine: m.sender_id === myId.value })
      } catch {
        out.push({ id: m.id, sender_id: m.sender_id, text: '(无法解密)', created_at: m.created_at, mine: false })
      }
    }
    messages.value = out
  }

  let channel: any = null
  async function subscribe(roomId: string) {
    if (channel) supabase.removeChannel(channel)
    channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        async (payload: any) => {
          const m = payload.new
          const { data: myKey } = await supabase
            .from('chat_room_keys')
            .select('encrypted_key')
            .eq('room_id', roomId)
            .eq('user_id', myId.value!)
            .single()
          if (!myKey) return
          const roomKey = await getRoomKey(roomId, myKey.encrypted_key)
          let text = '(无法解密)'
          try { text = await decryptMessage(m.ciphertext, m.nonce, roomKey) } catch {}
          messages.value.push({
            id: m.id, sender_id: m.sender_id, text, created_at: m.created_at, mine: m.sender_id === myId.value
          })
        }
      )
      .subscribe()
  }

  async function send(text: string) {
    if (!activeRoom.value || !myId.value || !text.trim()) return
    const roomId = activeRoom.value
    const { data: myKey } = await supabase
      .from('chat_room_keys')
      .select('encrypted_key')
      .eq('room_id', roomId)
      .eq('user_id', myId.value)
      .single()
    if (!myKey) return
    const roomKey = await getRoomKey(roomId, myKey.encrypted_key)
    const { ciphertext, nonce } = await encryptMessage(text, roomKey)
    const { data: msg } = await supabase
      .from('chat_messages')
      .insert({ room_id: roomId, sender_id: myId.value, ciphertext, nonce })
      .select('id,created_at')
      .single()
    if (msg) {
      messages.value.push({
        id: msg.id, sender_id: myId.value, text, created_at: msg.created_at, mine: true
      })
    }
  }

  function leaveRoom() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
    activeRoom.value = null
    messages.value = []
  }

  return { rooms, messages, activeRoom, myId, ready, init, loadRooms, createGroup, openRoom, send, leaveRoom }
})
