#!/bin/bash

# 🕐 Настройка автоматических бэкапов через cron
# Этот скрипт добавляет задание в crontab для ежедневных бэкапов

set -e

PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[ERROR] $1" >&2
    exit 1
}

setup_cron() {
    log "Настраиваем автоматические бэкапы..."
    
    # Проверяем, что скрипт бэкапа существует
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        error "Скрипт бэкапа не найден: $BACKUP_SCRIPT"
    fi
    
    # Делаем скрипт исполняемым
    chmod +x "$BACKUP_SCRIPT"
    
    # Создаем временный файл с новым cron заданием
    local temp_cron=$(mktemp)
    
    # Сохраняем существующий crontab
    crontab -l 2>/dev/null > "$temp_cron" || true
    
    # Проверяем, нет ли уже задания для бэкапа
    if grep -q "$BACKUP_SCRIPT" "$temp_cron" 2>/dev/null; then
        log "⚠️  Задание для бэкапа уже существует в crontab"
        log "Для просмотра: crontab -l"
        rm "$temp_cron"
        return 0
    fi
    
    # Добавляем новое задание (каждый день в 2:00 утра)
    cat >> "$temp_cron" << EOF

# Автоматический бэкап Naken Store (каждый день в 2:00)
0 2 * * * cd "$PROJECT_DIR" && "$BACKUP_SCRIPT" >> /var/log/naken-backup.log 2>&1
EOF
    
    # Устанавливаем новый crontab
    crontab "$temp_cron"
    rm "$temp_cron"
    
    # Создаем лог файл с правильными правами
    sudo touch /var/log/naken-backup.log
    sudo chmod 666 /var/log/naken-backup.log
    
    log "✅ Автоматический бэкап настроен!"
    log "📅 Расписание: каждый день в 2:00 утра"
    log "📄 Логи: /var/log/naken-backup.log"
    
    return 0
}

show_info() {
    cat << EOF

=== ИНФОРМАЦИЯ О БЭКАПАХ ===

✅ Автоматические бэкапы настроены
🕐 Время запуска: каждый день в 2:00 утра
📁 Папка бэкапов: /backups/
📄 Логи: /var/log/naken-backup.log

=== ПОЛЕЗНЫЕ КОМАНДЫ ===

📋 Посмотреть расписание cron:
   crontab -l

🗑️  Удалить автоматические бэкапы:
   crontab -e
   (удалите строку с backup.sh)

📊 Посмотреть логи бэкапов:
   tail -f /var/log/naken-backup.log

🚀 Запустить бэкап вручную:
   cd "$PROJECT_DIR" && ./scripts/backup.sh

📦 Посмотреть существующие бэкапы:
   ls -la /backups/

=== ВАЖНО ===
🔐 Бэкапы создаются с правами 600 (только владелец)
🗂️  Старые бэкапы (>30 дней) удаляются автоматически
💾 Убедитесь, что на диске достаточно места для бэкапов

EOF
}

main() {
    log "🚀 Настройка автоматических бэкапов Naken Store..."
    
    # Проверяем права
    if [[ $EUID -eq 0 ]]; then
        log "⚠️  Не запускайте этот скрипт от root. Используйте обычного пользователя."
        log "sudo будет вызван автоматически, когда потребуется."
    fi
    
    setup_cron
    show_info
    
    log "🎉 Настройка завершена!"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 