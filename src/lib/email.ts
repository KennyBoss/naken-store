import nodemailer from 'nodemailer'
import { createEmailCode, verifyEmailCodeDB } from '@/lib/auth-db'

// Создание транспорта для отправки email
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail'
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_PASSWORD
  
  if (!emailUser || !emailPassword) {
    throw new Error('EMAIL_USER и EMAIL_PASSWORD должны быть настроены в .env')
  }

  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  })
}

// Отправка кода подтверждения на email
export const sendEmailCode = async (email: string): Promise<string> => {
  // Создаем код в БД
  const code = await createEmailCode(email)

  // Если нет настроек email, показываем код в консоли
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_PASSWORD
  
  if (!emailUser || !emailPassword) {
    console.log(`\n📧 EMAIL КОД ДЛЯ ${email}: ${code}\n`)
    console.log('⚠️  Для продакшена добавьте EMAIL_USER и EMAIL_PASSWORD в .env')
    return code
  }

  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Naken Store" <${emailUser}>`,
      to: email,
      subject: 'Код подтверждения для входа',
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
              font-size: 36px; 
              font-weight: 300; 
              margin: 0; 
              letter-spacing: 3px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting {
              font-size: 20px;
              color: #1f2937;
              margin-bottom: 16px;
              font-weight: 500;
            }
            .description {
              color: #6b7280;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 32px;
              font-weight: 300;
            }
            .code-container {
              background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
              border: 3px solid #14b8a6;
              border-radius: 20px;
              padding: 32px;
              text-align: center;
              margin: 32px 0;
              box-shadow: 0 8px 20px rgba(20, 184, 166, 0.2);
            }
            .code {
              font-size: 48px;
              font-weight: 600;
              color: #0d9488;
              letter-spacing: 6px;
              font-family: 'Courier New', monospace;
              text-shadow: 0 2px 4px rgba(13, 148, 136, 0.3);
            }
            .code-title {
              font-size: 18px;
              color: #0f766e;
              font-weight: 500;
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .info-box {
              background: #f8fafc;
              border-radius: 16px;
              padding: 24px;
              margin: 32px 0;
              border-left: 4px solid #14b8a6;
            }
            .info-box p {
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
              margin: 8px 0;
              font-weight: 300;
            }
            .security-note {
              background: linear-gradient(135deg, #fef3c7, #fde68a);
              border: 2px solid #f59e0b;
              border-radius: 16px;
              padding: 20px;
              margin: 24px 0;
              text-align: center;
              box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            }
            .security-note p {
              color: #92400e;
              font-size: 14px;
              font-weight: 400;
              margin: 0;
            }
            .footer { 
              background: #1f2937; 
              color: white; 
              padding: 30px; 
              text-align: center;
              font-weight: 300;
            }
            .footer p {
              margin: 4px 0;
              opacity: 0.9;
            }
            .footer .copyright {
              font-size: 12px;
              opacity: 0.7;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NAKEN</h1>
            </div>
            
            <div class="content">
              <div class="greeting">Код подтверждения</div>
              
              <p class="description">
                Для завершения входа в ваш аккаунт введите следующий код на сайте:
              </p>
              
              <div class="code-container">
                <div class="code-title">Ваш код</div>
                <div class="code">${code}</div>
              </div>
              
              <div class="info-box">
                <p><strong>ℹ️ Информация:</strong></p>
                <p>• Код действителен в течение 15 минут</p>
                <p>• Используйте его только на официальном сайте naken.store</p>
                <p>• Не передавайте код третьим лицам</p>
              </div>
              
              <div class="security-note">
                <p>🔒 Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>NAKEN Store</p>
              <p>naken.store</p>
              <p>Поддержка: +7 (920) 994-07-07</p>
              <p class="copyright">© 2024 Naken Store. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email отправлен на ${email}`)
    return code
  } catch (error) {
    console.error('Ошибка отправки email:', error)
    // В случае ошибки, показываем код в консоли
    console.log(`\n📧 EMAIL КОД ДЛЯ ${email}: ${code} (fallback)\n`)
    return code
  }
}

// Проверка email кода
export const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
  return await verifyEmailCodeDB(email, code)
}

// Общая функция отправки email
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const emailUser = process.env.EMAIL_USER
  if (!emailUser) return

  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Naken Store" <${emailUser}>`,
      to,
      subject,
      html
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email отправлен на ${to}`)
  } catch (error) {
    console.error('Ошибка отправки email:', error)
  }
}

// Отправка приветственного email
export const sendWelcomeEmail = async (email: string, name?: string): Promise<void> => {
  const emailUser = process.env.EMAIL_USER
  if (!emailUser) return

  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Naken Store" <${emailUser}>`,
      to: email,
      subject: 'Добро пожаловать в Naken Store!',
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
              font-size: 36px; 
              font-weight: 300; 
              margin-bottom: 12px; 
              letter-spacing: 3px;
            }
            .header p {
              font-size: 20px;
              font-weight: 300;
              opacity: 0.9;
            }
            .content { 
              padding: 40px 30px; 
            }
            .welcome-message {
              text-align: center;
              margin-bottom: 32px;
            }
            .welcome-message h2 {
              color: #1f2937;
              font-size: 28px;
              font-weight: 500;
              margin-bottom: 16px;
            }
            .welcome-message p {
              color: #6b7280;
              font-size: 16px;
              line-height: 1.6;
              font-weight: 300;
            }
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin: 32px 0;
            }
            .feature-card {
              background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              border: 1px solid #5eead4;
              box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
            }
            .feature-card .icon {
              font-size: 32px;
              margin-bottom: 12px;
            }
            .feature-card h3 {
              color: #0f766e;
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
            }
            .feature-card p {
              color: #134e4a;
              font-size: 14px;
              font-weight: 300;
              line-height: 1.4;
            }
            .cta-section {
              background: #f8fafc;
              border-radius: 20px;
              padding: 32px;
              text-align: center;
              margin: 32px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #14b8a6, #0891b2);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 500;
              font-size: 18px;
              margin: 16px 0;
              box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
              transition: all 0.3s ease;
            }
            .contact-info {
              background: linear-gradient(135deg, #fef3c7, #fde68a);
              border-radius: 16px;
              padding: 20px;
              margin: 24px 0;
              text-align: center;
              border: 2px solid #f59e0b;
              box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            }
            .contact-info h4 {
              color: #92400e;
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
            }
            .contact-info p {
              color: #78350f;
              font-size: 14px;
              font-weight: 400;
              margin: 4px 0;
            }
            .footer { 
              background: #1f2937; 
              color: white; 
              padding: 30px; 
              text-align: center;
              font-weight: 300;
            }
            .footer p {
              margin: 4px 0;
              opacity: 0.9;
            }
            .footer .copyright {
              font-size: 12px;
              opacity: 0.7;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NAKEN</h1>
              <p>Добро пожаловать!</p>
            </div>
            
            <div class="content">
              <div class="welcome-message">
                <h2>Привет${name ? `, ${name}` : ''}! 👋</h2>
                <p>Спасибо за регистрацию в Naken Store! Мы рады видеть вас в нашем сообществе модных людей.</p>
              </div>
              
              <div class="features-grid">
                <div class="feature-card">
                  <div class="icon">🛍️</div>
                  <h3>Каталог товаров</h3>
                  <p>Изучайте наши эксклюзивные коллекции одежды</p>
                </div>
                
                <div class="feature-card">
                  <div class="icon">❤️</div>
                  <h3>Избранное</h3>
                  <p>Сохраняйте понравившиеся товары в избранное</p>
                </div>
                
                <div class="feature-card">
                  <div class="icon">🚀</div>
                  <h3>Быстрые заказы</h3>
                  <p>Оформляйте покупки быстро и удобно</p>
                </div>
                
                <div class="feature-card">
                  <div class="icon">📦</div>
                  <h3>Отслеживание</h3>
                  <p>Следите за статусом ваших заказов</p>
                </div>
              </div>
              
              <div class="cta-section">
                <h3 style="color: #1f2937; font-size: 20px; font-weight: 500; margin-bottom: 16px;">
                  Готовы начать покупки?
                </h3>
                <p style="color: #6b7280; font-weight: 300; margin-bottom: 24px;">
                  Откройте для себя мир стильной одежды в нашем каталоге
                </p>
                <a href="${process.env.NEXTAUTH_URL || 'https://naken.store'}" class="cta-button">
                  Перейти в каталог
                </a>
              </div>
              
              <div class="contact-info">
                <h4>🎯 Эксклюзивные предложения</h4>
                <p>Скидки до 50% для зарегистрированных пользователей</p>
                <p>Бесплатная доставка от 3000₽</p>
              </div>
            </div>
            
            <div class="footer">
              <p>NAKEN Store</p>
              <p>naken.store</p>
              <p>Поддержка: +7 (920) 994-07-07</p>
              <p>Email: support@naken.store</p>
              <p class="copyright">© 2024 Naken Store. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Приветственный email отправлен на ${email}`)
  } catch (error) {
    console.error('Ошибка отправки приветственного email:', error)
  }
} 