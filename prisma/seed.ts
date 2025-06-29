import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// --- Вспомогательные функции для генерации slug ---

function transliterate(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
}

function createProductSlug(name: string, sizes?: string[], colors?: string[]): string {
  let baseSlug = transliterate(name)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (sizes && sizes.length > 0) {
    const sizeSlug = transliterate(sizes[0]).replace(/[^a-z0-9]/g, '')
    if (sizeSlug) {
      baseSlug += '-' + sizeSlug
    }
  }

  if (colors && colors.length > 0) {
    const colorSlug = transliterate(colors[0]).replace(/[^a-z0-9]/g, '')
    if (colorSlug) {
      baseSlug += '-' + colorSlug
    }
  }

  return baseSlug
}

// --- Конец вспомогательных функций ---

// Список реальных изображений
const images = [
  '/images/men-jacket.jpg',
  '/images/women-dress.jpg',
  '/images/sport-tshirt.jpg',
  '/images/women-shirt.jpg',
  '/images/men-jeans.jpg',
]

// Функция для получения случайного набора изображений
const getRandomImages = () => {
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 3) + 1 // от 1 до 3 изображений
  return JSON.stringify(shuffled.slice(0, count))
}

async function main() {
  console.log(`Start seeding ...`)

  // Используем захардкоженные данные со страницы админки
  const phone = '+79999999999' 
  const password = 'admin123'    
  
  // Ищем существующего админа по номеру телефона
  const existingAdmin = await prisma.user.findUnique({
    where: { phone },
  });
  
  // Если админ с таким телефоном существует, удаляем его для чистоты
  if (existingAdmin) {
    await prisma.user.delete({
        where: { id: existingAdmin.id }
    });
    console.log(`Deleted existing user with phone: ${phone}`);
  }

  // Хешируем пароль
  const hashedPassword = await hash(password, 12)

  // Создаем нового пользователя-администратора
  const admin = await prisma.user.create({
    data: {
      phone,
      password: hashedPassword,
      name: 'Admin',
      role: Role.ADMIN,
      phoneVerified: new Date(), // Считаем, что телефон подтвержден
    },
  })

  console.log(`Admin user for phone ${admin.phone} created successfully.`)
  console.log(`Seeding finished.`)

  // 2. Очистка старых товаров для чистого сидинга
  await prisma.product.deleteMany({})
  console.log('Старые товары удалены.')

  // 3. Создание новых товаров
  const productsData = [
    // Мужские
    { name: 'Майка в стиле Old Money', price: 3200, salePrice: 2560, stock: 15 },
    { name: 'Классические брюки', price: 4500, stock: 20 },
    { name: 'Льняная рубашка', price: 3800, salePrice: 3000, stock: 18 },
    { name: 'Джинсовая куртка', price: 7200, stock: 10 },
    { name: 'Базовое худи', price: 4100, stock: 25 },
    
    // Женские
    { name: 'Женская рубашка', price: 2400, stock: 22 },
    { name: 'Летнее платье', price: 2800, stock: 12 },
    { name: 'Шелковая блуза', price: 4600, salePrice: 3900, stock: 14 },
    { name: 'Юбка-миди плиссе', price: 3500, stock: 19 },
    { name: 'Тренч классический', price: 9500, stock: 8 },

    // Спортивные
    { name: 'Спортивная футболка', price: 1200, stock: 30 },
    { name: 'Леггинсы для фитнеса', price: 2900, stock: 28 },
    { name: 'Спортивный топ', price: 2100, salePrice: 1800, stock: 24 },
    { name: 'Тренировочные шорты', price: 2300, stock: 35 },
    { name: 'Олимпийка на молнии', price: 4800, stock: 16 },
  ]

  // Создаем цвет по умолчанию
  let defaultColor = await prisma.color.findFirst({
    where: { name: 'Без цвета' }
  })
  
  if (!defaultColor) {
    defaultColor = await prisma.color.create({
      data: {
        name: 'Без цвета',
        hexCode: '#808080'
      }
    })
  }

  let i = 1;
  for (const p of productsData) {
    const slug = createProductSlug(p.name, [], [])
    
    // SEO-оптимизированное описание для каждого товара
    const seoDescription = `${p.name} в интернет-магазине NAKEN Store. Стильная одежда высокого качества по цене ${p.price.toLocaleString('ru-RU')} руб. Быстрая доставка по России, возврат 14 дней, примерка при получении.`
    
    await prisma.product.create({
      data: {
        ...p,
        slug: `${slug}-${i}`,
        sku: `NAKEN-${2024 + i++}`,
        description: seoDescription,
        images: getRandomImages(),
        published: true,
        colorId: defaultColor.id,
      },
    })
  }

  console.log(`✅ База данных успешно заполнена. Создано ${productsData.length} товаров.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('An error occurred during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 