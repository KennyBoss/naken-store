const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('🌱 Создание категорий...')

  const categories = [
    {
      name: 'Мужская одежда',
      slug: 'men-clothing',
      image: null
    },
    {
      name: 'Женская одежда',
      slug: 'women-clothing',
      image: null
    },
    {
      name: 'Спортивная одежда',
      slug: 'sport-clothing',
      image: null
    },
    {
      name: 'Обувь',
      slug: 'shoes',
      image: null
    },
    {
      name: 'Аксессуары',
      slug: 'accessories',
      image: null
    }
  ]

  for (const category of categories) {
    // Проверяем, не существует ли уже такая категория
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    })

    if (!existing) {
      await prisma.category.create({
        data: category
      })
      console.log(`✅ Создана категория: ${category.name}`)
    } else {
      console.log(`⏭️  Категория уже существует: ${category.name}`)
    }
  }

  console.log('🎉 Категории созданы!')
}

seedCategories()
  .catch((e) => {
    console.error('❌ Ошибка при создании категорий:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 