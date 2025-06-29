// HTML шаблоны для email уведомлений

export const emailTemplates = {
  // Подтверждение заказа
  orderConfirmation: (data: {
    orderNumber: string
    customerName: string
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    shippingAddress: string
    paymentMethod: string
  }) => ({
    subject: `🛍️ Заказ #${data.orderNumber} подтвержден!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            background-color: #ffffff;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 24px; 
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #14b8a6, #0891b2); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 300; 
            margin-bottom: 8px; 
            letter-spacing: 2px;
          }
          .header p { 
            font-size: 18px; 
            font-weight: 300; 
            opacity: 0.9;
          }
          .content { 
            padding: 40px 30px; 
          }
          .order-info {
            background: #f8fafc;
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          .order-number {
            background: linear-gradient(135deg, #14b8a6, #0891b2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 24px;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 500;
            color: #1f2937;
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .item { 
            background: white;
            border-radius: 12px;
            padding: 16px; 
            margin: 12px 0;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .item-name {
            font-size: 16px;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .item-details {
            font-size: 14px;
            color: #6b7280;
            font-weight: 300;
          }
          .total { 
            background: linear-gradient(135deg, #14b8a6, #0891b2);
            color: white;
            padding: 20px;
            border-radius: 16px;
            text-align: center;
            font-weight: 500; 
            font-size: 20px; 
            margin: 24px 0; 
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
          }
          .info-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
            border-left: 4px solid #14b8a6;
          }
          .info-card h4 {
            font-size: 16px;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .info-card p {
            font-size: 14px;
            color: #6b7280;
            font-weight: 300;
          }
          .footer { 
            background: #1f2937; 
            color: white; 
            padding: 30px; 
            text-align: center;
            font-weight: 300;
          }
          .footer p {
            opacity: 0.8;
          }
          .status-badge {
            display: inline-block;
            background: #dcfdf7;
            color: #0d9488;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin: 16px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NAKEN</h1>
            <p>Спасибо за ваш заказ!</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <div class="order-number">Заказ #${data.orderNumber}</div>
              <p>Здравствуйте, ${data.customerName}!</p>
              <span class="status-badge">✅ Подтвержден</span>
              <p style="margin-top: 16px; font-weight: 300;">Ваш заказ успешно подтвержден и принят в обработку. Мы свяжемся с вами для уточнения деталей доставки.</p>
            </div>
            
            <h3 class="section-title">Состав заказа</h3>
            ${data.items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">Количество: ${item.quantity} шт. × ${item.price}₽ = ${item.quantity * item.price}₽</div>
              </div>
            `).join('')}
            
            <div class="total">
              Итого к оплате: ${data.total}₽
            </div>
            
            <h3 class="section-title">Детали заказа</h3>
            
            <div class="info-card">
              <h4>📍 Адрес доставки</h4>
              <p>${data.shippingAddress}</p>
            </div>
            
            <div class="info-card">
              <h4>💳 Способ оплаты</h4>
              <p>${data.paymentMethod}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>NAKEN Store | naken.store</p>
            <p style="font-size: 12px; margin-top: 8px;">Поддержка: +7 (920) 994-07-07</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Заказ #${data.orderNumber} подтвержден!

Здравствуйте, ${data.customerName}!
Ваш заказ принят в обработку.

Состав заказа:
${data.items.map(item => `${item.name} - ${item.quantity} шт. × ${item.price}₽`).join('\n')}

Итого: ${data.total}₽
Доставка: ${data.shippingAddress}
Оплата: ${data.paymentMethod}

NAKEN Store
    `
  }),

  // Смена статуса заказа
  orderStatusUpdate: (data: {
    orderNumber: string
    customerName: string
    status: string
    statusMessage: string
  }) => ({
    subject: `📦 Обновление по заказу #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            background-color: #ffffff;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 24px; 
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #14b8a6, #0891b2); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 300; 
            margin-bottom: 8px; 
            letter-spacing: 2px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .status-card { 
            background: linear-gradient(135deg, #ecfdf5, #d1fae5); 
            border: 2px solid #10b981; 
            padding: 24px; 
            margin: 24px 0; 
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }
          .status-card h3 {
            color: #047857;
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 12px;
          }
          .status-card .status {
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 16px;
            display: inline-block;
            margin: 12px 0;
          }
          .status-card p {
            color: #065f46;
            font-weight: 400;
            margin-top: 12px;
          }
          .footer { 
            background: #1f2937; 
            color: white; 
            padding: 30px; 
            text-align: center;
            font-weight: 300;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
            font-weight: 400;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NAKEN</h1>
            <p style="font-weight: 300; font-size: 18px;">Обновление статуса заказа</p>
          </div>
          
          <div class="content">
            <p class="greeting">Здравствуйте, ${data.customerName}!</p>
            
            <div class="status-card">
              <h3>Заказ #${data.orderNumber}</h3>
              <div class="status">${data.status}</div>
              <p>${data.statusMessage}</p>
            </div>
            
            <p style="color: #6b7280; font-weight: 300; text-align: center; margin-top: 24px;">
              Следите за обновлениями в личном кабинете или свяжитесь с нашей поддержкой.
            </p>
          </div>
          
          <div class="footer">
            <p>NAKEN Store | naken.store</p>
            <p style="font-size: 12px; margin-top: 8px;">Поддержка: +7 (920) 994-07-07</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Обновление по заказу #${data.orderNumber}

Здравствуйте, ${data.customerName}!

Новый статус: ${data.status}
${data.statusMessage}

NAKEN Store
    `
  }),

  // Регистрация нового пользователя
  welcomeEmail: (data: {
    userName: string
    email: string
  }) => ({
    subject: '🎉 Добро пожаловать в NAKEN Store!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            background-color: #ffffff;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 24px; 
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #14b8a6, #0891b2); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 300; 
            margin-bottom: 8px; 
            letter-spacing: 2px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .welcome-card { 
            background: linear-gradient(135deg, #fef3c7, #fde68a); 
            border: 2px solid #f59e0b; 
            padding: 24px; 
            border-radius: 16px;
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          }
          .welcome-card h2 {
            color: #92400e;
            font-size: 24px;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .welcome-card p {
            color: #78350f;
            font-weight: 400;
            margin-bottom: 16px;
          }
          .features {
            background: #f8fafc;
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
          }
          .features h3 {
            color: #1f2937;
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            color: #4b5563;
            font-weight: 400;
            margin: 12px 0;
            padding-left: 28px;
            position: relative;
          }
          .features li:before {
            content: '✅';
            position: absolute;
            left: 0;
            top: 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #14b8a6, #0891b2);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
            transition: all 0.3s ease;
          }
          .footer { 
            background: #1f2937; 
            color: white; 
            padding: 30px; 
            text-align: center;
            font-weight: 300;
          }
          .email-info {
            color: #6b7280;
            font-size: 14px;
            font-weight: 300;
            margin-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NAKEN</h1>
            <p style="font-weight: 300; font-size: 18px;">Добро пожаловать!</p>
          </div>
          
          <div class="content">
            <div class="welcome-card">
              <h2>Привет, ${data.userName}! 👋</h2>
              <p>Спасибо за регистрацию в NAKEN Store! Мы рады видеть вас в нашем сообществе.</p>
            </div>
            
            <div class="features">
              <h3>Что вас ждет:</h3>
              <ul>
                <li>Эксклюзивные коллекции одежды</li>
                <li>Скидки до 50% для зарегистрированных пользователей</li>
                <li>Быстрая доставка по всей России</li>
                <li>Персональные рекомендации</li>
                <li>Отслеживание статуса заказов</li>
                <li>Сохранение любимых товаров</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="https://naken.store" class="cta-button">
                Перейти в каталог
              </a>
            </div>
            
            <div class="email-info">
              <p>Ваш email: ${data.email}</p>
              <p>Есть вопросы? Пишите: support@naken.store</p>
            </div>
          </div>
          
          <div class="footer">
            <p>NAKEN Store | naken.store</p>
            <p style="font-size: 12px; margin-top: 8px;">Поддержка: +7 (920) 994-07-07</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Добро пожаловать в NAKEN Store, ${data.userName}!

Спасибо за регистрацию! Мы рады видеть вас в нашем сообществе.

Что вас ждет:
- Эксклюзивные коллекции одежды
- Скидки до 50% для зарегистрированных пользователей
- Быстрая доставка по всей России
- Персональные рекомендации

Перейти в каталог: https://naken.store/catalog

Вопросы? Пишите: support@naken.store
    `
  }),

  // Сброс пароля
  resetPassword: (data: {
    userName: string
    resetLink: string
    expiresIn: string
  }) => ({
    subject: '🔑 Восстановление пароля NAKEN',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            background-color: #ffffff;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 24px; 
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #14b8a6, #0891b2); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 300; 
            margin-bottom: 8px; 
            letter-spacing: 2px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .reset-card {
            background: #f8fafc;
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
          }
          .reset-card h2 {
            color: #1f2937;
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #14b8a6, #0891b2);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
          }
          .warning { 
            background: linear-gradient(135deg, #fef2f2, #fee2e2); 
            border: 2px solid #f87171; 
            padding: 20px; 
            border-radius: 16px; 
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(248, 113, 113, 0.2);
          }
          .warning h4 {
            color: #dc2626;
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 12px;
          }
          .warning p {
            color: #7f1d1d;
            font-weight: 400;
            margin: 8px 0;
          }
          .footer { 
            background: #1f2937; 
            color: white; 
            padding: 30px; 
            text-align: center;
            font-weight: 300;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
            font-weight: 400;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NAKEN</h1>
            <p style="font-weight: 300; font-size: 18px;">Восстановление пароля</p>
          </div>
          
          <div class="content">
            <p class="greeting">Здравствуйте, ${data.userName}!</p>
            
            <div class="reset-card">
              <h2>Восстановление доступа</h2>
              <p style="color: #6b7280; font-weight: 300; margin-bottom: 24px;">
                Вы запросили восстановление пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль.
              </p>
              
              <a href="${data.resetLink}" class="cta-button">
                Восстановить пароль
              </a>
            </div>
            
            <div class="warning">
              <h4>⚠️ Важная информация:</h4>
              <p>• Ссылка действительна ${data.expiresIn}</p>
              <p>• Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо</p>
              <p>• Ссылка может быть использована только один раз</p>
            </div>
          </div>
          
          <div class="footer">
            <p>NAKEN Store | naken.store</p>
            <p style="font-size: 12px; margin-top: 8px;">Поддержка: +7 (920) 994-07-07</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Восстановление пароля NAKEN

Здравствуйте, ${data.userName}!

Вы запросили восстановление пароля.
Ссылка для восстановления: ${data.resetLink}

Ссылка действительна ${data.expiresIn}

NAKEN Store
    `
  })
} 