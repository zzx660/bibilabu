#!/bin/bash
# 圣经 PWA 一键部署脚本 - 国内轻量云(Ubuntu/Debian)
# 用法: 在项目根目录执行 bash deploy/setup.sh
# 前置: 有 root 权限,域名已解析到服务器 IP

set -e

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "用法: bash deploy/setup.sh 你的域名"
  echo "例如: bash deploy/setup.sh bible.example.com"
  exit 1
fi

echo "=== 部署域名: $DOMAIN ==="

# 1. 装 Node.js 20+
if ! command -v node &>/dev/null; then
  echo "安装 Node.js 20 ..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v

# 2. 装 nginx + certbot
if ! command -v nginx &>/dev/null; then
  echo "安装 nginx + certbot ..."
  sudo apt-get update
  sudo apt-get install -y nginx certbot python3-certbot-nginx
fi

# 3. 装 PM2
if ! command -v pm2 &>/dev/null; then
  echo "安装 PM2 ..."
  sudo npm install -g pm2
fi

# 4. 装项目依赖
echo "安装项目依赖 ..."
npm install --omit=dev --no-audit --no-fund

# 5. 构建
echo "构建前端 ..."
npm run build

# 6. 部署静态文件
echo "部署静态文件 ..."
sudo mkdir -p /var/www/scripture
sudo rsync -av --delete dist/ /var/www/scripture/dist/

# 7. 启动后端
echo "启动后端进程 ..."
pm2 delete bible-api 2>/dev/null || true
pm2 delete bible-ws 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root

# 8. 配 nginx
echo "配置 nginx ..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/scripture
sudo sed -i "s/bible.example.com/$DOMAIN/g" /etc/nginx/sites-available/scripture
sudo ln -sf /etc/nginx/sites-available/scripture /etc/nginx/sites-enabled/scripture
sudo nginx -t && sudo systemctl reload nginx

# 9. 申请 HTTPS 证书
echo "申请 HTTPS 证书 ..."
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN --redirect

# 10. 重启后端让 nginx 生效
pm2 restart all

echo ""
echo "=== 部署完成 ==="
echo "访问: https://$DOMAIN"
echo "日志: pm2 logs"
echo "状态: pm2 status"
