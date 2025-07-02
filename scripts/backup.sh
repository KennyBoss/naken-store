#!/bin/bash

# 🗄️ Полный бэкап сайта Naken Store
# Этот скрипт создает полный бэкап: код + база данных + файлы

set -e  # Остановиться при любой ошибке

# ==================== НАСТРОЙКИ ====================

# Основные пути
PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"  # Корень проекта
BACKUP_BASE_DIR="/backups"  # Основная папка для бэкапов
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_BASE_DIR}/naken_backup_${TIMESTAMP}"

# Настройки базы данных (из .env или переменных окружения)
DB_NAME="${DB_NAME:-naken_store}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Файлы и папки для исключения из бэкапа
EXCLUDE_PATTERNS=(
    "node_modules"
    ".next"
    ".git"
    "*.log"
    "backups"
    "tmp"
    "temp"
)

# ==================== ФУНКЦИИ ====================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[ERROR] $1" >&2
    exit 1
}

check_dependencies() {
    log "Проверяем зависимости..."
    
    # Проверяем PostgreSQL
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump не найден. Установите PostgreSQL клиент."
    fi
    
    # Проверяем tar
    if ! command -v tar &> /dev/null; then
        error "tar не найден."
    fi
    
    log "✅ Все зависимости найдены"
}

create_backup_dirs() {
    log "Создаем директории для бэкапа..."
    
    # Создаем основную папку бэкапов
    sudo mkdir -p "$BACKUP_BASE_DIR"
    
    # Создаем папку для текущего бэкапа
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/code"
    
    log "✅ Директории созданы: $BACKUP_DIR"
}

backup_database() {
    log "Создаем бэкап базы данных..."
    
    # Создаем дамп базы данных
    local db_backup_file="$BACKUP_DIR/database/naken_${TIMESTAMP}.sql"
    
    # Экспортируем пароль из переменной окружения для pg_dump
    export PGPASSWORD="$DB_PASSWORD"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --no-owner \
        --no-privileges \
        --format=custom \
        --file="$db_backup_file.custom"; then
        
        # Также создаем текстовую версию для читаемости
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            --no-owner \
            --no-privileges \
            --format=plain \
            --file="$db_backup_file"
            
        log "✅ Бэкап БД создан: $(du -h "$db_backup_file" | cut -f1)"
    else
        error "Ошибка создания бэкапа базы данных"
    fi
    
    unset PGPASSWORD
}

backup_files() {
    log "Создаем бэкап файлов..."
    
    # Бэкапим загруженные файлы
    if [ -d "$PROJECT_DIR/public/uploads" ]; then
        cp -r "$PROJECT_DIR/public/uploads" "$BACKUP_DIR/files/"
        log "✅ Загруженные файлы скопированы"
    else
        log "⚠️  Папка uploads не найдена"
    fi
    
    # Бэкапим медиа-файлы
    if [ -d "$PROJECT_DIR/public/media" ]; then
        cp -r "$PROJECT_DIR/public/media" "$BACKUP_DIR/files/"
        log "✅ Медиа-файлы скопированы"
    else
        log "⚠️  Папка media не найдена"
    fi
}

backup_code() {
    log "Создаем бэкап кода..."
    
    # Создаем список исключений для tar
    local exclude_args=""
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        exclude_args="$exclude_args --exclude=$pattern"
    done
    
    # Копируем весь код проекта, исключая ненужные файлы
    tar $exclude_args -cf "$BACKUP_DIR/code/project_code.tar" -C "$(dirname "$PROJECT_DIR")" "$(basename "$PROJECT_DIR")"
    
    # Также копируем важные конфигурационные файлы
    if [ -f "$PROJECT_DIR/.env" ]; then
        cp "$PROJECT_DIR/.env" "$BACKUP_DIR/code/.env.backup"
        log "✅ .env файл скопирован"
    fi
    
    if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
        cp "$PROJECT_DIR/ecosystem.config.js" "$BACKUP_DIR/code/"
        log "✅ PM2 конфиг скопирован"
    fi
    
    log "✅ Код проекта заархивирован"
}

create_info_file() {
    log "Создаем информационный файл..."
    
    local info_file="$BACKUP_DIR/backup_info.txt"
    
    cat > "$info_file" << EOF
=== BACKUP INFO ===
Дата создания: $(date)
Версия проекта: $(cd "$PROJECT_DIR" && git rev-parse HEAD 2>/dev/null || echo "N/A")
Ветка Git: $(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "N/A")
Сервер: $(hostname)
Пользователь: $(whoami)
Размер бэкапа: $(du -sh "$BACKUP_DIR" | cut -f1)

=== СТРУКТУРА ===
$(tree "$BACKUP_DIR" 2>/dev/null || ls -la "$BACKUP_DIR")

=== НАСТРОЙКИ БД ===
Host: $DB_HOST
Port: $DB_PORT
Database: $DB_NAME
User: $DB_USER

=== ВОССТАНОВЛЕНИЕ ===
1. Распаковать код: tar -xf code/project_code.tar
2. Установить зависимости: npm install
3. Восстановить БД: pg_restore -d новая_база database/naken_*.sql.custom
4. Скопировать файлы из files/ в public/
5. Настроить .env и запустить проект

EOF

    log "✅ Информационный файл создан"
}

create_final_archive() {
    log "Создаем финальный архив..."
    
    local archive_name="naken_full_backup_${TIMESTAMP}.tar.gz"
    local archive_path="${BACKUP_BASE_DIR}/${archive_name}"
    
    # Создаем сжатый архив
    tar -czf "$archive_path" -C "$BACKUP_BASE_DIR" "naken_backup_${TIMESTAMP}"
    
    # Удаляем временную папку
    rm -rf "$BACKUP_DIR"
    
    local archive_size=$(du -h "$archive_path" | cut -f1)
    log "✅ Финальный архив создан: $archive_path ($archive_size)"
    
    # Устанавливаем права доступа
    chmod 600 "$archive_path"
    
    return 0
}

cleanup_old_backups() {
    log "Очищаем старые бэкапы (старше 30 дней)..."
    
    # Удаляем архивы старше 30 дней
    find "$BACKUP_BASE_DIR" -name "naken_full_backup_*.tar.gz" -type f -mtime +30 -delete 2>/dev/null || true
    
    log "✅ Старые бэкапы очищены"
}

# ==================== ОСНОВНАЯ ЛОГИКА ====================

main() {
    log "🚀 Начинаем полный бэкап Naken Store..."
    log "Проект: $PROJECT_DIR"
    log "Бэкап: $BACKUP_DIR"
    
    # Проверяем, что мы в правильной директории
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        error "Не найден package.json. Убедитесь, что скрипт запущен из корня проекта."
    fi
    
    # Выполняем все шаги
    check_dependencies
    create_backup_dirs
    backup_database
    backup_files
    backup_code
    create_info_file
    create_final_archive
    cleanup_old_backups
    
    log "🎉 Бэкап успешно завершен!"
    log "Архив: ${BACKUP_BASE_DIR}/naken_full_backup_${TIMESTAMP}.tar.gz"
    log "Для восстановления смотрите backup_info.txt внутри архива"
}

# Запускаем только если скрипт вызван напрямую
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 