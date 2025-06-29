import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/db";
import { createProductSlug } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: {
          include: {
            size: true
          }
        },
        color: true
      }
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to retrieve product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const data = await req.json();

    let newSlug = data.slug;
    if (data.name) {
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });
      if (existingProduct && existingProduct.name !== data.name) {
        // Получаем названия размеров и цветов для slug'а
        const selectedSizes = data.sizeIds ? await prisma.size.findMany({
          where: { id: { in: data.sizeIds } },
          select: { name: true }
        }) : []
        
        const selectedColor = data.colorId ? await prisma.color.findUnique({
          where: { id: data.colorId },
          select: { name: true }
        }) : null
        
        newSlug = createProductSlug(data.name, {
          sizes: selectedSizes.map(s => s.name),
          colors: selectedColor ? [selectedColor.name] : [],
          category: 'одежда',
          brand: 'NAKEN',
          sku: data.sku
        });
      }
    }

    // Обновляем основную информацию о товаре
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: newSlug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        sku: data.sku,
        stock: data.stock,
        images: JSON.stringify(data.images || []),
        colorId: data.colorId,
        published: data.published,
      },
    });

    // Обновляем размеры - удаляем старые и создаем новые
    if (data.sizeIds) {
      await prisma.productSize.deleteMany({
        where: { productId: id }
      });
      
      await prisma.productSize.createMany({
        data: data.sizeIds.map((sizeId: string) => ({
          productId: id,
          sizeId: sizeId,
          stock: data.stock || 0
        }))
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    // Проверка авторизации
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const { id } = await params;
    // Проверяем есть ли товар в заказах
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id }
    });
    
    if (orderItems) {
      // Если товар есть в заказах, не удаляем его полностью, а скрываем
      await prisma.product.update({
        where: { id },
        data: { published: false }
      });
      
      return NextResponse.json(
        { 
          message: "Товар скрыт из каталога, так как присутствует в заказах. Для полного удаления обратитесь к администратору.",
          soft_deleted: true 
        },
        { status: 200 }
      );
    }
    
    // Если товара нет в заказах, удаляем полностью
    // Связанные записи в корзинах, избранном и отзывах удалятся автоматически (Cascade)
    await prisma.product.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete product:", error);
    
    // Проверяем тип ошибки
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: "Невозможно удалить товар: он связан с другими записями в системе" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 