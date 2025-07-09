#!/bin/bash

# Скрипт для добавления Telegram переменных в ecosystem.config.js

ECOSYSTEM_FILE="ecosystem.config.js"
TELEGRAM_TOKEN="8113073818:AAHsAts1kDWlapEmUqDVR9CJpPDibLq4Q0U"
TELEGRAM_CHAT_ID="1119678963"

echo "🚀 Обновляем ecosystem.config.js с Telegram переменными..."

# Проверяем есть ли уже Telegram переменные
if grep -q "TELEGRAM_BOT_TOKEN" "$ECOSYSTEM_FILE"; then
    echo "✅ Telegram переменные уже добавлены в $ECOSYSTEM_FILE"
    exit 0
fi

# Создаем резервную копию
cp "$ECOSYSTEM_FILE" "${ECOSYSTEM_FILE}.backup"

# Добавляем Telegram переменные
sed -i "s|UPLOADS_PATH: '/root/naken-store/public/uploads'|UPLOADS_PATH: '/root/naken-store/public/uploads',\n        // 🚀 Telegram Bot Configuration\n        TELEGRAM_BOT_TOKEN: '$TELEGRAM_TOKEN',\n        TELEGRAM_CHAT_ID: '$TELEGRAM_CHAT_ID'|g" "$ECOSYSTEM_FILE"

echo "✅ Telegram переменные добавлены в $ECOSYSTEM_FILE"
echo "📋 Резервная копия сохранена как ${ECOSYSTEM_FILE}.backup"

# Перезапускаем PM2 если он запущен
if command -v pm2 >/dev/null 2>&1; then
    echo "🔄 Перезапускаем PM2..."
    pm2 restart naken-store
    echo "✅ PM2 перезапущен"
else
    echo "⚠️  PM2 не найден, перезапустите вручную"
fi

echo "🎉 Готово! Telegram уведомления настроены" 