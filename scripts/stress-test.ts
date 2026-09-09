// 并发压测:模拟 N 个客户端连 ws-server 发消息,测延迟
// 前置:先启动 ws-server (node --import tsx serverless/ws-server.ts)
// 运行: npx tsx scripts/stress-test.ts

import WebSocket from 'ws'

const URL = process.env.WS_URL || 'ws://localhost:8787'
const CLIENTS = parseInt(process.env.CLIENTS || '50', 10)
const MSG_PER_CLIENT = 5
const ROOM = 'stress-test'

async function main() {
  const clients: WebSocket[] = []
  const latencies: number[] = []
  let received = 0
  const expected = CLIENTS * MSG_PER_CLIENT * (CLIENTS - 1) // 每条广播给除自己外的成员

  for (let i = 0; i < CLIENTS; i++) {
    const ws = new WebSocket(URL)
    await new Promise<void>((resolve) => ws.on('open', resolve))
    ws.send(JSON.stringify({ type: 'join', roomId: ROOM }))
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString())
      if (msg.type === 'msg' && msg.ts) {
        latencies.push(Date.now() - msg.ts)
        received++
        if (received >= expected * 0.9) finish()
      }
    })
    clients.push(ws)
  }
  console.log(`${CLIENTS} 客户端已连接,开始发消息`)

  let seq = 0
  for (let round = 0; round < MSG_PER_CLIENT; round++) {
    for (const ws of clients) {
      ws.send(JSON.stringify({
        type: 'msg', roomId: ROOM, senderId: seq++,
        ciphertext: 'test', nonce: 'n', ts: Date.now()
      }))
    }
  }

  let done = false
  function finish() {
    if (done) return
    done = true
    latencies.sort((a, b) => a - b)
    const p50 = latencies[Math.floor(latencies.length * 0.5)]
    const p95 = latencies[Math.floor(latencies.length * 0.95)]
    const p99 = latencies[Math.floor(latencies.length * 0.99)]
    console.log(`收到 ${received}/${expected}`)
    console.log(`延迟 p50=${p50}ms p95=${p95}ms p99=${p99}ms`)
    console.log(p95 < 2000 ? '✓ 通过(50 并发 < 2s)' : '✗ 未通过')
    for (const ws of clients) ws.close()
    process.exit(0)
  }

  setTimeout(finish, 15000)
}

main().catch(console.error)
