#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Функция для сокращения описания
function truncateDescription(description, maxLength = 200) {
  if (!description) return '';
  const cleaned = description.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Функция для создания slug
function createSlug(name, wbId) {
  const slug = name.toLowerCase()
    .replace(/[а-я]/g, (char) => {
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  return `${slug}-${wbId}`;
}

// Парсинг TSV
function parseTSVLine(line) {
  const fields = line.split('\t');
  return {
    type: fields[0],
    slug: fields[1],
    wbId: fields[2],
    name: fields[3],
    category: fields[4],
    brand: fields[5],
    description: fields[6],
    images: fields[7] ? fields[7].split(';').slice(0, 3) : [],
    video: fields[8],
    gender: fields[9],
    material: fields[10],
    color: fields[11],
    barcode: fields[12],
    size: fields[13],
    sizeNumber: fields[14]
  };
}

// Получение цвета (исправляем составные цвета)
function getColorName(colorStr) {
  if (!colorStr) return null;
  const cleaned = colorStr.toLowerCase().trim();
  
  // Берем первый цвет до точки с запятой
  const firstColor = cleaned.split(';')[0].trim();
  
  const colorMap = {
    'серый': 'серый',
    'черный': 'черный', 
    'белый': 'белый',
    'бежевый': 'бежевый',
    'коричневый': 'коричневый',
    'темно-синий': 'темно-синий',
    'молочный': 'молочный'
  };
  
  return colorMap[firstColor] || null;
}

// Получение размера
function getSizeName(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.trim().toUpperCase();
  
  if (['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(cleaned)) {
    return cleaned;
  }
  
  return null;
}

async function importProducts() {
  console.log('🚀 Импорт товаров NAKEN (исправленный)...');
  
  try {
    // Читаем файлы
    const file1 = fs.readFileSync('1.md', 'utf8');
    const file2 = fs.readFileSync('2.md', 'utf8');
    
    const lines = [...file1.split('\n'), ...file2.split('\n')]
      .filter(line => line.trim() && !line.startsWith('#'));
    
    console.log(`📦 Найдено ${lines.length} строк товаров`);
    
    // Парсим все товары
    const parsedItems = lines.map(parseTSVLine)
      .filter(item => item.wbId && !item.wbId.includes('http')) // Убираем мусор с URL
      .filter(item => item.name && item.name !== 'Мужской'); // Убираем мусорные названия
    
    console.log(`✅ Распарсено ${parsedItems.length} валидных товаров`);
    
    // Группируем по WB ID
    const products = {};
    parsedItems.forEach(item => {
      if (!products[item.wbId]) {
        products[item.wbId] = {
          wbId: item.wbId,
          name: item.name,
          description: item.description,
          category: item.category,
          variants: []
        };
      }
      
      products[item.wbId].variants.push({
        color: getColorName(item.color),
        size: getSizeName(item.size),
        barcode: item.barcode
      });
    });
    
    console.log(`🎯 Найдено ${Object.keys(products).length} уникальных товаров`);
    
    // Получаем существующие цвета и размеры
    const existingColors = await prisma.color.findMany();
    const existingSizes = await prisma.size.findMany();
    
    console.log(`🎨 Цветов в БД: ${existingColors.length}`);
    console.log(`📏 Размеров в БД: ${existingSizes.length}`);
    
    let createdCount = 0;
    
    // Создаем товары
    for (const [wbId, productData] of Object.entries(products)) {
      console.log(`\n📦 Создаем товар: ${productData.name} (${wbId})`);
      
      // Сокращаем описание
      const shortDescription = truncateDescription(productData.description, 200);
      
      // Создаем slug
      const slug = createSlug(productData.name, wbId);
      
      // Получаем цвет
      const colorName = productData.variants.find(v => v.color)?.color;
      let colorId = null;
      
      if (colorName) {
        const color = existingColors.find(c => c.name.toLowerCase().includes(colorName.toLowerCase()));
        colorId = color?.id;
        console.log(`🎨 Цвет: ${colorName} -> ${colorId ? 'найден' : 'НЕ НАЙДЕН'}`);
      }
      
      try {
        // Создаем товар (ИСПРАВЛЕНО: images как строка JSON)
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            slug: slug,
            description: shortDescription,
            price: 1800,
            sku: `NAKEN-${wbId}`,
            stock: 100,
            images: JSON.stringify(["/images/placeholder.jpg"]), // Правильный формат!
            published: true,
            colorId: colorId
          }
        });
        
        console.log(`✅ Товар создан: ${product.id}`);
        
        // Связываем с размерами
        const uniqueSizes = [...new Set(productData.variants.map(v => v.size).filter(Boolean))];
        
        for (const sizeName of uniqueSizes) {
          const size = existingSizes.find(s => s.name === sizeName);
          if (size) {
            try {
              await prisma.productSize.create({
                data: {
                  productId: product.id,
                  sizeId: size.id
                }
              });
              console.log(`📏 Размер добавлен: ${sizeName}`);
            } catch (error) {
              if (error.code !== 'P2002') {
                console.log(`⚠️ Ошибка добавления размера ${sizeName}:`, error.message);
              }
            }
          } else {
            console.log(`⚠️ Размер не найден: ${sizeName}`);
          }
        }
        
        createdCount++;
        
      } catch (error) {
        console.log(`❌ Ошибка создания товара ${wbId}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Импорт завершен! Создано товаров: ${createdCount}`);
    
  } catch (error) {
    console.error('💥 Ошибка импорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск
importProducts(); 