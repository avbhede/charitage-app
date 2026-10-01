#!/usr/bin/env bash
# ==============================================================================
# Charitage Foundation - AWS EC2 One-Time Automated Setup Script
# Run this on a clean Ubuntu 22.04 / 24.04 LTS EC2 Instance:
#   chmod +x ec2_setup.sh && sudo ./ec2_setup.sh
# ==============================================================================

set -e

echo "=== 1. Updating System Packages ==="
apt-get update && apt-get upgrade -y
apt-get install -y python3 python3-pip python3-venv nginx git curl ufw

echo "=== 2. Configuring 1GB Swap (Recommended for t3.micro/t3.small) ==="
if [ ! -f /swapfile ]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "=== 3. Setting Up Web Directory ==="
mkdir -p /var/www/charitage
chown -R ubuntu:ubuntu /var/www/charitage
chmod -R 755 /var/www/charitage

echo "=== 4. Setting Up Nginx Configuration ==="
cat << 'EOF' > /etc/nginx/sites-available/charitage
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/charitage;
    index index.html;

    client_max_body_size 25M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/charitage /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "=== 5. Setting Up Systemd Backend Service ==="
cat << 'EOF' > /etc/systemd/system/charitage.service
[Unit]
Description=Charitage FastAPI Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/charitage/backend
ExecStart=/home/ubuntu/charitage/backend/venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
EnvironmentFile=-/home/ubuntu/charitage/backend/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo "=============================================================================="
echo "Setup Complete!"
echo "Next Steps:"
echo "1. Clone your repo: git clone <REPO_URL> /home/ubuntu/charitage"
echo "2. Setup python venv: cd /home/ubuntu/charitage/backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt"
echo "3. Create backend .env: nano /home/ubuntu/charitage/backend/.env"
echo "4. Start backend service: sudo systemctl enable --now charitage"
echo "5. Add GitHub Secrets (EC2_HOST, EC2_USER, EC2_SSH_KEY) for automatic CI/CD!"
echo "=============================================================================="
