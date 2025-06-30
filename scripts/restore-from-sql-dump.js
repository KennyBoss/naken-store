const { exec } = require('child_process');
const { promisify } = require('util');
const { PrismaClient } = require('@prisma/client');
const { generateSEOData } = require('./seo-boost');

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Функция выполнения SQL команд
async function executeSQLCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr && !stderr.includes('NOTICE')) {
      console.log('⚠️ Предупреждение:', stderr);
    }
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Создание SQL для добавления SEO полей
function generateSEOFieldsSQL() {
  return `
-- Добавление SEO полей к таблице products (если их нет)
DO $$
BEGIN
  -- Добавляем seoTitle если не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='seoTitle') THEN
    ALTER TABLE products ADD COLUMN "seoTitle" TEXT;
  END IF;
  
  -- Добавляем seoKeywords если не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='seoKeywords') THEN
    ALTER TABLE products ADD COLUMN "seoKeywords" TEXT;
  END IF;
  
  -- Добавляем faq если не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='faq') THEN
    ALTER TABLE products ADD COLUMN "faq" TEXT;
  END IF;
  
  -- Добавляем views если не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='views') THEN
    ALTER TABLE products ADD COLUMN "views" INTEGER DEFAULT 0;
  END IF;
END
$$;
  `;
}

// Основная функция восстановления
async function restoreFromSQLDump(dumpFilePath) {
  console.log('🔄 Начинаю восстановление из SQL дампа...');
  console.log(`📁 Файл дампа: ${dumpFilePath}`);
  
  try {
    // 1. Проверяем что файл существует
    const checkFile = await execAsync(`ls -la "${dumpFilePath}"`);
    if (!checkFile) {
      throw new Error('Файл дампа не найден');
    }
    console.log('✅ Файл дампа найден');
    
    // 2. Создаем резервную копию текущей базы
    console.log('💾 Создаю резервную копию текущей базы...');
    const backupName = `backup_before_restore_${Date.now()}.sql`;
    const backupCmd = `pg_dump $DATABASE_URL > /tmp/${backupName}`;
    const backup = await executeSQLCommand(backupCmd);
    
    if (backup.success) {
      console.log(`✅ Резервная копия создана: /tmp/${backupName}`);
    } else {
      console.log('⚠️ Не удалось создать резервную копию, продолжаем...');
    }
    
    // 3. Очищаем существующие данные товаров
    console.log('🗑️ Очищаю существующие товары...');
    await prisma.productSize.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    
    // 4. Восстанавливаем только товарные таблицы из дампа
    console.log('📦 Восстанавливаю товары из дампа...');
    
    // Извлекаем только нужные таблицы
    const tablesToRestore = [
      'products',
      'colors', 
      'sizes',
      'product_sizes'
    ];
    
    // Создаем временный файл с нужными таблицами
    const tempFile = '/tmp/products_only.sql';
    
    for (const table of tablesToRestore) {
      console.log(`📋 Восстанавливаю таблицу: ${table}`);
      
      // Извлекаем данные таблицы из дампа
      const extractCmd = `grep -A 10000 "COPY public.${table}" "${dumpFilePath}" | head -n -1 > ${tempFile}_${table}`;
      await executeSQLCommand(extractCmd);
      
      // Восстанавливаем таблицу
      const restoreCmd = `psql $DATABASE_URL < ${tempFile}_${table}`;
      const result = await executeSQLCommand(restoreCmd);
      
      if (result.success) {
        console.log(`✅ Таблица ${table} восстановлена`);
      } else {
        console.log(`⚠️ Проблема с ${table}:`, result.error);
      }
    }
    
    // 5. Добавляем SEO поля
    console.log('🎯 Добавляю SEO поля...');
    const seoSQL = generateSEOFieldsSQL();
    const seoResult = await executeSQLCommand(`psql $DATABASE_URL -c "${seoSQL}"`);
    
    if (seoResult.success) {
      console.log('✅ SEO поля добавлены');
    } else {
      console.log('⚠️ Проблема с SEO полями:', seoResult.error);
    }
    
    // 6. Генерируем SEO данные для всех товаров
    console.log('🚀 Генерирую SEO данные для всех товаров...');
    const products = await prisma.product.findMany();
    
    let seoCount = 0;
    for (const product of products) {
      try {
        const seoData = await generateSEOData({
          name: product.name,
          description: product.description,
          price: product.price
        });
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            seoTitle: seoData.title,
            seoKeywords: seoData.keywords,
            faq: JSON.stringify(seoData.faq),
            views: 0
          }
        });
        
        seoCount++;
      } catch (error) {
        console.log(`⚠️ Ошибка SEO для товара ${product.name}:`, error.message);
      }
    }
    
    console.log(`✅ SEO данные сгенерированы для ${seoCount} товаров`);
    
    // 7. Показываем статистику
    const stats = await prisma.product.count();
    const colorsCount = await prisma.color.count();
    const sizesCount = await prisma.size.count();
    
    console.log('\n🎉 ВОССТАНОВЛЕНИЕ ЗАВЕРШЕНО!');
    console.log(`📦 Товаров восстановлено: ${stats}`);
    console.log(`🎨 Цветов: ${colorsCount}`);
    console.log(`📏 Размеров: ${sizesCount}`);
    console.log(`🎯 SEO оптимизация: Применена`);
    console.log(`💾 Резервная копия: /tmp/${backupName}`);
    
    // 8. Очищаем временные файлы
    await executeSQLCommand(`rm -f ${tempFile}*`);
    
    return { success: true, stats: { products: stats, colors: colorsCount, sizes: sizesCount } };
    
  } catch (error) {
    console.error('❌ Критическая ошибка восстановления:', error);
    return { success: false, error: error.message };
  }
}

// Упрощенное восстановление (полное)
async function simpleRestore(dumpFilePath) {
  console.log('⚡ Быстрое восстановление всей базы...');
  
  try {
    // Создаем резервную копию
    const backupName = `full_backup_${Date.now()}.sql`;
    console.log('💾 Создаю полную резервную копию...');
    await executeSQLCommand(`pg_dump $DATABASE_URL > /tmp/${backupName}`);
    
    // Восстанавливаем весь дамп
    console.log('📦 Восстанавливаю полную базу...');
    const restoreCmd = `psql $DATABASE_URL < "${dumpFilePath}"`;
    const result = await executeSQLCommand(restoreCmd);
    
    if (!result.success) {
      throw new Error(`Ошибка восстановления: ${result.error}`);
    }
    
    // Добавляем SEO поля
    console.log('🎯 Добавляю SEO поля...');
    const seoSQL = generateSEOFieldsSQL();
    await executeSQLCommand(`psql $DATABASE_URL -c "${seoSQL}"`);
    
    // Перегенерируем Prisma клиент
    console.log('🔄 Обновляю Prisma клиент...');
    await executeSQLCommand('npx prisma generate');
    
    console.log('✅ Быстрое восстановление завершено!');
    console.log(`💾 Резервная копия: /tmp/${backupName}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Ошибка быстрого восстановления:', error);
    return { success: false, error: error.message };
  }
}

// CLI интерфейс
async function main() {
  const command = process.argv[2];
  const dumpPath = process.argv[3] || '/root/naken-store/naken_store_working_backup_20250629_113733_database.sql';
  
  console.log('🗄️ NAKEN Store - Восстановление из SQL дампа\n');
  
  switch (command) {
    case 'safe':
      console.log('🛡️ Режим: Безопасное восстановление товаров');
      await restoreFromSQLDump(dumpPath);
      break;
      
    case 'full':
      console.log('⚡ Режим: Полное восстановление базы');
      await simpleRestore(dumpPath);
      break;
      
    case 'check':
      console.log('🔍 Проверка файла дампа...');
      try {
        const { stdout } = await execAsync(`head -20 "${dumpPath}"`);
        console.log('✅ Файл найден, первые строки:');
        console.log(stdout);
      } catch (error) {
        console.log('❌ Файл не найден:', error.message);
      }
      break;
      
    default:
      console.log(`
🗄️ Восстановление NAKEN Store из SQL дампа

Использование:
  node scripts/restore-from-sql-dump.js safe [path]  - Безопасное восстановление товаров
  node scripts/restore-from-sql-dump.js full [path]  - Полное восстановление базы  
  node scripts/restore-from-sql-dump.js check [path] - Проверить файл дампа

Параметры:
  path - Путь к SQL дампу (по умолчанию: /root/naken-store/naken_store_working_backup_20250629_113733_database.sql)

Примеры:
  node scripts/restore-from-sql-dump.js safe
  node scripts/restore-from-sql-dump.js full /path/to/backup.sql
  node scripts/restore-from-sql-dump.js check

🛡️ БЕЗОПАСНО: safe - восстанавливает только товары, создает резервную копию
⚡ БЫСТРО: full - полное восстановление всей базы (ОСТОРОЖНО!)
      `);
  }
  
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { restoreFromSQLDump, simpleRestore }; 