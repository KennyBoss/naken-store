import { prisma } from '../src/lib/db'

async function main() {
  console.log('🎯 Добавляем трекинг-пиксель Яндекс.Метрики...')
  
  // Добавляем пиксель Яндекс.Метрики с ID из скриншота
  const yandexPixel = await prisma.trackingPixel.upsert({
    where: { 
      // Уникальность по комбинации типа и ID
      id: 'yandex-metrika-main'
    },
    update: {},
    create: {
      id: 'yandex-metrika-main',
      name: 'Яндекс.Метрика основной',
      type: 'YANDEX_METRIKA',
      pixelId: '3663988',
      isActive: true,
      placement: 'HEAD',
      description: 'Основной счетчик для отслеживания посетителей и конверсий'
    }
  })

  console.log('✅ Добавлен пиксель:', yandexPixel)

  // Добавляем пример Facebook Pixel для демонстрации
  const facebookPixel = await prisma.trackingPixel.upsert({
    where: { 
      id: 'facebook-pixel-main'
    },
    update: {},
    create: {
      id: 'facebook-pixel-main',
      name: 'Facebook Pixel',
      type: 'FACEBOOK_PIXEL',
      pixelId: '123456789',
      isActive: false, // отключен по умолчанию
      placement: 'HEAD',
      description: 'Пиксель для рекламы в Facebook и Instagram'
    }
  })

  console.log('✅ Добавлен пиксель Facebook (отключен):', facebookPixel)

  // Добавляем пример произвольного кода
  const customPixel = await prisma.trackingPixel.upsert({
    where: { 
      id: 'custom-hotjar'
    },
    update: {},
    create: {
      id: 'custom-hotjar',
      name: 'Hotjar Analytics',
      type: 'CUSTOM_HTML',
      pixelId: '',
      code: `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:3000000,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `,
      isActive: false,
      placement: 'HEAD',
      description: 'Тепловые карты и записи сессий пользователей'
    }
  })

  console.log('✅ Добавлен пример Hotjar (отключен):', customPixel)
  console.log('🎉 Трекинг-пиксели готовы к использованию!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 