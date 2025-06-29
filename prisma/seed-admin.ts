import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Создаем тестового админа
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { phone: '+79999999999' },
    update: {},
    create: {
      name: 'Администратор NAKEN',
      phone: '+79999999999',
      phoneVerified: new Date(),
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 