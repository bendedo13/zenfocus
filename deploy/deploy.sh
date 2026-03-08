#!/bin/bash
# ============================================================================
# ZenFocus - VPS Deployment Script
# ============================================================================
# Kullanım: bash deploy.sh [VPS_IP] [SSH_USER]
# Örnek:    bash deploy.sh 46.4.123.77 root
# ============================================================================

set -e

VPS_IP=${1:-"46.4.123.77"}
SSH_USER=${2:-root}
REMOTE_DIR="/var/www/zenfocus"
NGINX_CONF="/etc/nginx/sites-available/zenfocus"

echo "=========================================="
echo " ZenFocus VPS Deploy"
echo "=========================================="
echo "VPS: $SSH_USER@$VPS_IP"
echo "Hedef: $REMOTE_DIR"
echo ""

# 1. Web build oluştur
echo "[1/5] Web build oluşturuluyor..."
npx expo export --platform web
echo "✓ Build tamamlandı"

# 2. VPS'de dizin oluştur
echo "[2/5] VPS'de dizin hazırlanıyor..."
ssh $SSH_USER@$VPS_IP "mkdir -p $REMOTE_DIR"
echo "✓ Dizin hazır"

# 3. Dosyaları VPS'ye kopyala
echo "[3/5] Dosyalar VPS'ye kopyalanıyor..."
scp -r dist/* $SSH_USER@$VPS_IP:$REMOTE_DIR/
echo "✓ Dosyalar kopyalandı"

# 4. Nginx config kopyala
echo "[4/5] Nginx yapılandırılıyor..."
scp deploy/nginx.conf $SSH_USER@$VPS_IP:$NGINX_CONF
ssh $SSH_USER@$VPS_IP "
    # Nginx yoksa kur
    if ! command -v nginx &> /dev/null; then
        apt update && apt install -y nginx
    fi
    
    # Site'ı aktifleştir
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/zenfocus
    
    # Default site'ı kaldır (opsiyonel)
    rm -f /etc/nginx/sites-enabled/default
    
    # Nginx config test
    nginx -t
    
    # Nginx'i yeniden başlat
    systemctl restart nginx
"
echo "✓ Nginx yapılandırıldı"

# 5. Kontrol
echo "[5/5] Kontrol ediliyor..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$VPS_IP)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Site erişilebilir!"
    echo ""
    echo "=========================================="
    echo " ✓ Deploy tamamlandı!"
    echo " URL: http://$VPS_IP"
    echo "=========================================="
else
    echo "⚠ HTTP $HTTP_CODE - Lütfen VPS'yi kontrol edin"
fi
