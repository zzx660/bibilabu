// PM2 进程配置 - 国内轻量云上跑后端 + WebSocket
// 用法: pm2 start deploy/ecosystem.config.cjs
// 日志: pm2 logs
// 重启: pm2 restart all
// 状态: pm2 status

module.exports = {
  apps: [
    {
      name: 'bible-api',
      script: 'serverless/hono/index.ts',
      interpreter: 'node_modules/.bin/tsx',
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 8787,
        WS_ORIGIN: 'https://你的域名'
        // 其他变量从 .env 读,或在这里直接填
      }
    },
    {
      name: 'bible-ws',
      script: 'serverless/ws-server.ts',
      interpreter: 'node_modules/.bin/tsx',
      instances: 1,
      autorestart: true,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production',
        WS_PORT: 8788
      }
    }
  ]
}
