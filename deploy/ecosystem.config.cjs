// PM2 进程配置 - 国内轻量云上跑后端 + WebSocket
// 用法: pm2 start deploy/ecosystem.config.cjs
// 日志: pm2 logs
// 重启: pm2 restart all
// 状态: pm2 status

const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) {
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[m[1]] = val
    }
  }
}

module.exports = {
  apps: [
    {
      name: 'bible-api',
      script: 'serverless/hono/index.ts',
      interpreter: '/usr/bin/node',
      node_args: '--import tsx',
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 8787,
        WS_ORIGIN: 'https://jhsj5511.top',
        SUPABASE_URL: 'https://ejbfxzyjczkdafotfvpb.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYmZ4enlqY3prZGFmb3RmdnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkzNzM1NCwiZXhwIjoyMTA0NTEzMzU0fQ.UDAZX7UghBH5ofFujKRohQY6AEUUISS2uXE9yMZh2DU',
        GLM_API_KEY: 'b575f8b408554d4482880d4252bae395.bxdumaDeMelMPT6M'
      }
    },
    {
      name: 'bible-ws',
      script: 'serverless/ws-server.ts',
      interpreter: '/usr/bin/node',
      node_args: '--import tsx',
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
