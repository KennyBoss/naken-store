import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/user/addresses/[id] - Обновить адрес
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    // Используем транзакцию для безопасного обновления
    const updatedAddress = await prisma.$transaction(async (tx) => {
      // Проверяем, что адрес принадлежит пользователю
      const address = await tx.address.findUnique({
        where: { id, userId: session.user.id }
      })
      if (!address) {
        throw new Error('Адрес не найден или доступ запрещен')
      }

      // Если новый адрес устанавливается по умолчанию, снимаем флаг с других
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, NOT: { id } },
          data: { isDefault: false }
        })
      }

      // Обновляем сам адрес
      return await tx.address.update({
        where: { id },
        data: data
      })
    })

    return NextResponse.json(updatedAddress)
  } catch (error: any) {
    console.error('Ошибка обновления адреса:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// DELETE /api/user/addresses/[id] - Удалить адрес
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { id } = params

    // Используем транзакцию для проверки и удаления
    await prisma.$transaction(async (tx) => {
        // Проверяем, что адрес принадлежит пользователю
        const address = await tx.address.findUnique({
            where: { id, userId: session.user.id }
        });

        if (!address) {
            throw new Error('Адрес не найден или доступ запрещен');
        }

        // Если адрес по умолчанию, назначаем другой адрес по умолчанию
        if (address.isDefault) {
            const nextDefault = await tx.address.findFirst({
                where: { userId: session.user.id, NOT: { id } },
                orderBy: { createdAt: 'asc' }
            });

            if (nextDefault) {
                await tx.address.update({
                    where: { id: nextDefault.id },
                    data: { isDefault: true }
                });
            }
        }
        
        // Удаляем сам адрес
        await tx.address.delete({
            where: { id }
        });
    });

    return NextResponse.json({ message: 'Адрес успешно удален' })
  } catch (error: any) {
    console.error('Ошибка удаления адреса:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
} 