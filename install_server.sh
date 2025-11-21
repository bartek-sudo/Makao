#!/bin/bash

# Skrypt instalacyjny dla Ubuntu 18.04
# Konfiguruje nginx i uruchamia stronę z już sklonowanego repozytorium

set -e  # Zatrzymaj skrypt przy błędzie

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcja do wyświetlania komunikatów
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Sprawdź czy skrypt jest uruchomiony jako root
if [ "$EUID" -ne 0 ]; then 
    log_error "Proszę uruchomić skrypt jako root (sudo)"
    exit 1
fi

# Katalog źródłowy (gdzie użytkownik sklonował repo)
# Można przekazać jako argument, domyślnie bieżący katalog
SOURCE_DIR="${1:-$(pwd)}"

# Sprawdź czy katalog źródłowy istnieje
if [ ! -d "$SOURCE_DIR" ]; then
    log_error "Katalog źródłowy nie istnieje: $SOURCE_DIR"
    exit 1
fi

# Sprawdź czy w katalogu źródłowym jest index.html
if [ ! -f "$SOURCE_DIR/index.html" ]; then
    log_error "Nie znaleziono pliku index.html w katalogu: $SOURCE_DIR"
    log_info "Upewnij się, że sklonowałeś repozytorium i jesteś w odpowiednim katalogu"
    log_info "Użycie: sudo ./install_server.sh [KATALOG_Z_REPO]"
    log_info "Przykład: sudo ./install_server.sh /home/uzytkownik/makao"
    exit 1
fi

# Katalog docelowy dla aplikacji
APP_DIR="/var/www/makao"
NGINX_SITE="makao"

log_info "Rozpoczynam instalację serwera dla aplikacji Makao..."
log_info "Katalog źródłowy: $SOURCE_DIR"

# Aktualizacja systemu
log_info "Aktualizuję listę pakietów..."
apt-get update -qq

# Instalacja wymaganych pakietów
log_info "Instaluję wymagane pakiety (nginx, curl)..."
apt-get install -y nginx curl > /dev/null 2>&1

# Sprawdź czy nginx został zainstalowany
if ! command -v nginx &> /dev/null; then
    log_error "Instalacja nginx nie powiodła się!"
    exit 1
fi

log_info "Nginx został zainstalowany pomyślnie"

# Tworzenie katalogu dla aplikacji
log_info "Tworzę katalog dla aplikacji: $APP_DIR"
mkdir -p "$APP_DIR"

# Kopiowanie plików z katalogu źródłowego
log_info "Kopiuję pliki aplikacji z $SOURCE_DIR do $APP_DIR..."
cp -r "$SOURCE_DIR"/* "$APP_DIR/" 2>/dev/null || {
    log_error "Nie udało się skopiować plików!"
    exit 1
}

# Sprawdź czy pliki zostały skopiowane
if [ ! -f "$APP_DIR/index.html" ]; then
    log_error "Nie znaleziono pliku index.html w katalogu docelowym!"
    exit 1
fi

log_info "Pliki aplikacji zostały skopiowane"

# Ustawienie uprawnień
log_info "Ustawiam uprawnienia do plików..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Konfiguracja nginx
log_info "Konfiguruję nginx..."

# Tworzenie konfiguracji nginx
# Używamy portu 8080, ponieważ port 80 jest zajęty przez Apache2 (OpenStack Horizon)
cat > "/etc/nginx/sites-available/$NGINX_SITE" <<EOF
server {
    listen 8080;
    listen [::]:8080;
    
    server_name _;
    
    root $APP_DIR;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    # Obsługa plików statycznych
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logi
    access_log /var/log/nginx/makao_access.log;
    error_log /var/log/nginx/makao_error.log;
}
EOF

# Usunięcie domyślnej konfiguracji nginx (opcjonalne)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    log_info "Usuwam domyślną konfigurację nginx..."
    rm /etc/nginx/sites-enabled/default
fi

# Aktywacja konfiguracji
if [ ! -L "/etc/nginx/sites-enabled/$NGINX_SITE" ]; then
    ln -s "/etc/nginx/sites-available/$NGINX_SITE" "/etc/nginx/sites-enabled/$NGINX_SITE"
fi

# Test konfiguracji nginx
log_info "Sprawdzam konfigurację nginx..."
if nginx -t > /dev/null 2>&1; then
    log_info "Konfiguracja nginx jest poprawna"
else
    log_error "Błąd w konfiguracji nginx!"
    nginx -t
    exit 1
fi

# Restart nginx
log_info "Uruchamiam nginx..."
systemctl restart nginx
systemctl enable nginx > /dev/null 2>&1

# Sprawdź status nginx
if systemctl is-active --quiet nginx; then
    log_info "Nginx działa poprawnie"
else
    log_error "Nginx nie działa!"
    systemctl status nginx
    exit 1
fi

# Wyświetlenie informacji o zakończeniu
log_info "========================================="
log_info "Instalacja zakończona pomyślnie!"
log_info "========================================="

# Pobierz adres IP
IP_ADDRESS=$(hostname -I | awk '{print $1}')

log_info "Aplikacja jest dostępna pod adresem:"
log_info "  http://$IP_ADDRESS:8080"
log_info "  http://localhost:8080"
log_info ""
log_info "UWAGA: Port 80 jest zajęty przez Apache2 (OpenStack Horizon)"
log_info "Aplikacja działa na porcie 8080"
log_info ""
log_info "Aby wyświetlić stronę:"
log_info "  1. Z maszyny wirtualnej: otwórz przeglądarkę i wejdź na http://localhost:8080"
log_info "  2. Z innego komputera w sieci lokalnej: http://$IP_ADDRESS:8080"
log_info ""
log_info "Aby sprawdzić adres IP maszyny:"
log_info "  hostname -I"
log_info "  lub"
log_info "  ip addr show"
log_info ""
log_info "Katalog aplikacji: $APP_DIR"
log_info "Konfiguracja nginx: /etc/nginx/sites-available/$NGINX_SITE"
log_info ""
log_info "Przydatne polecenia:"
log_info "  Sprawdź status nginx:    sudo systemctl status nginx"
log_info "  Zrestartuj nginx:        sudo systemctl restart nginx"
log_info "  Sprawdź logi nginx:      sudo tail -f /var/log/nginx/makao_error.log"
log_info "  Sprawdź logi dostępu:    sudo tail -f /var/log/nginx/makao_access.log"
log_info ""
log_info "Aby zaktualizować aplikację (po zmianach w repo):"
log_info "  1. cd $SOURCE_DIR"
log_info "  2. git pull"
log_info "  3. sudo cp -r $SOURCE_DIR/* $APP_DIR/"
log_info "  4. sudo systemctl reload nginx"
log_info "========================================="
