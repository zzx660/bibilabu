// 独立 WebSocket 服务器(部署到国内轻量云,加速实时聊天)
// 只转发密文,不解密(E2EE 兼容)
// 启动: node --import tsx serverless/ws-server.ts
// 或编译后 node dist/ws-server.js
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
const PORT = parseInt(process.env.WS_PORT || '8787', 10);
const server = createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, connections: rooms.size }));
        return;
    }
    res.writeHead(404);
    res.end();
});
const wss = new WebSocketServer({ server });
// roomId → Set<WebSocket>
const rooms = new Map();
function joinRoom(roomId, ws) {
    let set = rooms.get(roomId);
    if (!set) {
        set = new Set();
        rooms.set(roomId, set);
    }
    set.add(ws);
    ws.roomId = roomId;
}
function leaveRoom(ws) {
    const roomId = ws.roomId;
    if (!roomId)
        return;
    const set = rooms.get(roomId);
    if (set) {
        set.delete(ws);
        if (set.size === 0)
            rooms.delete(roomId);
    }
}
wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        }
        catch {
            return;
        }
        // 客户端发 {type:'join', roomId} 加入
        if (msg.type === 'join' && msg.roomId) {
            joinRoom(msg.roomId, ws);
            return;
        }
        // 客户端发 {type:'msg', roomId, ciphertext, nonce} 广播密文
        if (msg.type === 'msg' && msg.roomId && msg.ciphertext) {
            const set = rooms.get(msg.roomId);
            if (!set)
                return;
            const payload = JSON.stringify({
                type: 'msg',
                roomId: msg.roomId,
                senderId: msg.senderId,
                ciphertext: msg.ciphertext,
                nonce: msg.nonce,
                ts: Date.now()
            });
            for (const peer of set) {
                if (peer !== ws && peer.readyState === WebSocket.OPEN) {
                    peer.send(payload);
                }
            }
        }
    });
    ws.on('close', () => leaveRoom(ws));
});
server.listen(PORT, () => {
    console.log(`ws-server on :${PORT}`);
});
