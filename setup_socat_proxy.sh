#!/bin/bash

# Skrypt do konfiguracji socat jako proxy dla VirtualBox port forwarding
# Użycie: sudo ./setup_socat_proxy.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ "$EUID" -ne 0 ]; then 
    log_error "Proszę uruchomić skrypt jako root (sudo)"
    exit 1
fi

log_info "Konfiguruję socat jako proxy dla VirtualBox..."

# Instalacja socat
if ! command -v socat &> /dev/null; then
    log_info "Instaluję socat..."
    apt-get update -qq
    apt-get install -y socat > /dev/null 2>&1
fi

# Porty (można zmienić)
SOCAT_PORT=8888
NGINX_PORT=8080

# Zatrzymaj istniejące procesy socat
log_info "Zatrzymuję istniejące procesy socat na porcie $SOCAT_PORT..."
pkill -f "socat.*$SOCAT_PORT" 2>/dev/null || log_warn "Brak istniejących procesów socat"

# Sprawdź czy nginx działa na porcie 8080
if ! netstat -tln 2>/dev/null | grep -q ":$NGINX_PORT " && ! ss -tln 2>/dev/null | grep -q ":$NGINX_PORT "; then
    log_error "Nginx nie działa na porcie $NGINX_PORT!"
    log_info "Upewnij się, że nginx jest uruchomiony: sudo systemctl start nginx"
    exit 1
fi

# Uruchom socat jako proxy
log_info "Uruchamiam socat proxy: port $SOCAT_PORT -> localhost:$NGINX_PORT"
nohup socat TCP-LISTEN:$SOCAT_PORT,fork,reuseaddr TCP:localhost:$NGINX_PORT > /dev/null 2>&1 &

sleep 1

# Sprawdź czy socat działa
if pgrep -f "socat.*$SOCAT_PORT" > /dev/null; then
    log_info "========================================="
    log_info "Socat proxy uruchomiony pomyślnie!"
    log_info "========================================="
    log_info "Konfiguracja VirtualBox Port Forwarding:"
    log_info "  Name: HTTP-Makao-Proxy"
    log_info "  Protocol: TCP"
    log_info "  Host IP: (puste)"
    log_info "  Host Port: 9999"
    log_info "  Guest IP: (puste)"
    log_info "  Guest Port: $SOCAT_PORT"
    log_info ""
    log_info "Następnie otwórz w przeglądarce na Windows:"
    log_info "  http://localhost:9999"
    log_info ""
    log_info "Aby zatrzymać socat:"
    log_info "  sudo pkill -f 'socat.*$SOCAT_PORT'"
    log_info "========================================="
else
    log_error "Nie udało się uruchomić socat!"
    exit 1
fi

