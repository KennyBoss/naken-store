const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { generateSEOData } = require('../src/lib/seo-boost');

const prisma = new PrismaClient();

// Данные товаров из бэкапа
const backupProducts = [
  {
    id: 'cmcfdkj5w000tkrxhx9miom3w',
    name: 'Футболка однотонная в стиле old money',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-320309230',
    description: 'Эта футболка станет отличным дополнением к вашему гардеробу, идеально подходя для мужчин, которые ценят комфорт и стиль.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-320309230',
    stock: 100,
    images: ["/uploads/1751122358927-y5yi4mi3v2.jpg","/uploads/1751122360915-vx8r5yfgnu.jpg","/uploads/1751122363014-coycsvq2xd6.jpg","/uploads/1751122364940-vpfibwn5px.jpg","/uploads/1751122367413-r1rd9p610e.jpg"],
    published: true,
    colorName: 'коричневый'
  },
  {
    id: 'cmcfdkj64000vkrxhxn3jiopw', 
    name: 'Однотонная футболка обтягивающая',
    slug: 'odnotonnaya-futbolka-obtyagivayuschaya-329353482',
    description: 'Мужская футболка, пропитанная духом 90-х в стиле олд мани, станет отличным дополнением любого гардероба.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-329353482',
    stock: 100,
    images: ["/uploads/1751121738044-fm2qoheuv3s.jpg","/uploads/1751121738897-6ngw1w8qphm.jpg","/uploads/1751121740416-2u3j3stqw0r.jpg","/uploads/1751121741635-8lwfe8t49yb.jpg","/uploads/1751121742871-nmk86vyahae.jpg"],
    published: true,
    colorName: 'Без цвета'
  },
  {
    id: 'cmcfdkj6b000xkrxh8n9jhf2z',
    name: 'Футболка однотонная базовая',
    slug: 'futbolka-odnotonnaya-bazovaya-329876930', 
    description: 'Эта мужская футболка с обтяжкой станет отличным выбором для летнего гардероба. Выполненная в черном цвете.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-329876930',
    stock: 100,
    images: ["/uploads/1751121905604-ubdawteykq.jpg","/uploads/1751121907148-ozcf1e0trwd.jpg","/uploads/1751121908726-o2fh1mouyf.jpg","/uploads/1751121910051-a3nofwjcb48.jpg","/uploads/1751121911332-pphqotn7rvq.jpg","/uploads/1751121912569-uvefsshgnc9.jpg","/uploads/1751121913978-7ihvntdkl5e.jpg"],
    published: true,
    colorName: 'черный'
  },
  {
    id: 'cmcfdkj7h0017krxh3aravkt4',
    name: 'Футболка однотонная базовая',
    slug: 'futbolka-odnotonnaya-bazovaya-329919074',
    description: 'Эта мужская футболка с обтяжкой станет отличным выбором для летнего гардероба. Выполненная в белом молочном цвете, она обладает приталенным кроем, который подчеркивает фигуру. Базовая модель с...',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-329919074',
    stock: 100,
    images: ["/uploads/1751122005560-4ougpsee3kq.jpg","/uploads/1751122006576-rpladf0l8kl.jpg","/uploads/1751122007681-1i56xibpsol.jpg","/uploads/1751122008963-18pmb8hczjs.jpg","/uploads/1751122010130-xyj4ece33ps.jpg","/uploads/1751122011067-mza7qgmehd.jpg","/uploads/1751122012146-8d245ceknnx.jpg","/uploads/1751122013148-im4acr1f2dh.jpg","/uploads/1751122014176-tvxn7hvxgok.jpg"],
    published: true,
    colorName: 'белый'
  },
  {
    id: 'cmcfdkj9t001jkrxh9q5vh34a',
    name: 'Футболка однотонная в стиле old money',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-338023200',
    description: 'Эта футболка — идеальный выбор для тех, кто ценит стиль и комфорт. Однотонная футболка в стиле old money подчеркнет вашу индивидуальность.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-338023200',
    stock: 100,
    images: ["/uploads/1751113834204-cgg7os3z7ka.jpg","/uploads/1751113835400-2qwkmhruhrp.jpg","/uploads/1751113837171-a23g108x5of.jpg","/uploads/1751113838079-j1sbglc1i6j.jpg","/uploads/1751113838986-mvdn8eeoyk.jpg"],
    published: true,
    colorName: 'Без цвета'
  },
  {
    id: 'cmcfdkj98001hkrxh0b1ct71d',
    name: 'Футболка однотонная в стиле old money',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-338008188',
    description: 'Мужская футболка, пропитанная духом 90-х в стиле олд мани, станет отличным дополнением любого гардероба.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-338008188',
    stock: 100,
    images: ["/uploads/1751114151243-ztk470zuf3i.jpg","/uploads/1751114152389-a1svrg407ik.jpg","/uploads/1751114153256-642r7fye7yq.jpg","/uploads/1751114153752-x40u4blfbn.jpg","/uploads/1751114154621-6n822f3okr2.jpg","/uploads/1751114155370-et2u5gyy58w.jpg","/uploads/1751114156268-evfba7tz8.jpg"],
    published: true,
    colorName: 'Без цвета'
  },
  {
    id: 'cmcfdkjar001nkrxhlo3ps7w6',
    name: 'Футболка однотонная в стиле old money',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-340412588',
    description: 'Мужская футболка, пропитанная духом 90-х в стиле олд мани, станет отличным дополнением любого гардероба.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-340412588',
    stock: 100,
    images: ["/uploads/1751122218797-rnjcufkc4n.jpg","/uploads/1751122219670-9cm13xvhmg7.jpg","/uploads/1751122220800-jiivibxhm1a.jpg","/uploads/1751122221909-3wece0gybs6.jpg"],
    published: true,
    colorName: '30'
  },
  {
    id: 'cmcfdkjdo001ykrxhtasf0xlh',
    name: 'Футболка поло ажурная в стиле Old Money',
    slug: 'futbolka-polo-azhurnaya-v-stile-old-money-371134103',
    description: 'Футболка поло от NAKEN - это идеальный выбор для тех, кто ценит комфорт и стиль. Ажурная вязка придает ей легкую и воздушную текстуру, делая ее комфортной для носки в любую погоду. Классический крой...',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371134103',
    stock: 100,
    images: ["/uploads/1751113640701-gtyyapt8q7.jpg","/uploads/1751113641838-ek8caqxsck8.jpg","/uploads/1751113642857-riluwm0quvg.jpg","/uploads/1751113644119-ug36cofupui.jpg","/uploads/1751113645688-z824c0j0i7.jpg","/uploads/1751113646441-ouwxfpncta.jpg","/uploads/1751113647967-184jco1eq.jpg"],
    published: true,
    colorName: 'Без цвета'
  },
  {
    id: 'cmcfdkjh6002akrxhaa4ci5fi',
    name: 'Футболка поло в стиле old money',
    slug: 'futbolka-polo-v-stile-old-money-371134105',
    description: 'Футболка поло от NAKEN - это идеальный выбор для тех, кто ценит комфорт и стиль. Ажурная вязка придает ей легкую и воздушную текстуру.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371134105',
    stock: 100,
    images: ["/uploads/1751113311399-6hvkqxs6wck.jpg","/uploads/1751113312789-oh1p21rbmt.jpg","/uploads/1751113314214-aze2wyh41fr.jpg","/uploads/1751113314951-j9uli2x6i2.jpg","/uploads/1751113316517-w5gwj82ibnj.jpg","/uploads/1751113318068-02iod8ezv523.jpg","/uploads/1751113319947-7du6y2zvshw.jpg"],
    published: true,
    colorName: 'бежевый'
  },
  {
    id: 'cmcfdkjmh002ukrxhjqcyf3vy',
    name: 'Футболка однотонная в стиле old money базовая',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-bazovaya-371136581',
    description: 'Эта мужская футболка — идеальный выбор для тех, кто ценит стиль old money. Летняя футболка выполнена из качественного материала,...',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371136581',
    stock: 100,
    images: ["/uploads/1751102501687-u16hvcvlc9.jpg","/uploads/1751102502265-1n80raswrrm.jpg","/uploads/1751102502739-w9eopj9e839.jpg","/uploads/1751102503201-ktn19khbjl.jpg","/uploads/1751102503569-adtr9zaxwbn.jpg","/uploads/1751102503971-coug39gmxir.jpg","/uploads/1751102504354-r414ggwq3b.jpg"],
    published: true,
    colorName: 'черный'
  },
  {
    id: 'cmcfdkjfv0028krxhkn2xvw01',
    name: 'Футболка поло ажурная в стиле Old Money',
    slug: 'futbolka-polo-azhurnaya-v-stile-old-money-371134104',
    description: 'Футболка поло в стиле Old Money — это идеальный выбор для тех, кто ценит стиль и комфорт.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371134104',
    stock: 100,
    images: ["/uploads/1751113513188-ahbp99pyyfi.jpg","/uploads/1751113515298-hv3ap1f8y1w.jpg","/uploads/1751113516728-uzpzn464a1.jpg","/uploads/1751113517760-woklhsfk7ml.jpg","/uploads/1751113519033-55wdqwx1oe.jpg","/uploads/1751113519660-ezfg88p9zsc.jpg","/uploads/1751113520948-bdc9rp2ecj.jpg","/uploads/1751113521971-1r0hy923bsl.jpg"],
    published: true,
    colorName: 'черный'
  },
  {
    id: 'cmcfdkjp20033krxhscx1699a',
    name: 'Футболка однотонная в стиле old money базовая',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-bazovaya-371136583',
    description: 'Эта футболка станет отличным выбором для любителей стиля и комфорта в летнее время. Она выполнена из высококачественной ткани.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371136583',
    stock: 100,
    images: ["/uploads/1751107485523-zu4ej3fd91.jpg","/uploads/1751107485926-5yivganbwc8.jpg","/uploads/1751107486542-zm23nj1ic9b.jpg","/uploads/1751107487176-mue3szbe6rl.jpg","/uploads/1751107487702-4pu1y926bch.jpg","/uploads/1751107488164-gndmpxz7a4s.jpg","/uploads/1751107488623-5id4fydftaw.jpg","/uploads/1751107489199-bel4rlyebbj.jpg"],
    published: true,
    colorName: 'Без цвета'
  },
  {
    id: 'cmcfdkjth003nkrxh311mhba3',
    name: 'Футболка однотонная в стиле old money базовая',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-bazovaya-371136586',
    description: 'Эта мужская футболка — идеальный выбор для тех, кто ценит стиль и комфорт. Выполненная в стиле old money, она станет базовым элементом вашего гардероба.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371136586',
    stock: 100,
    images: ["/uploads/1751100947394-o53woju581.jpg","/uploads/1751100947925-7hi9vi7095s.jpg","/uploads/1751100948366-5aji2e66yz.jpg","/uploads/1751100948894-e2rw238lehm.jpg","/uploads/1751100949332-o96sy8du2em.jpg","/uploads/1751100949941-4lgfu1mdz52.jpg"],
    published: true,
    colorName: 'бежевый'
  },
  {
    id: 'cmcfdkjqn003dkrxhoef6ls2c',
    name: 'Футболка однотонная в стиле old money базовая',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-bazovaya-371136585',
    description: 'Эта футболка станет отличным выбором для любителей стиля и комфорта в летнее время. Она выполнена из высококачественной ткани, что гарантирует легкость.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371136585',
    stock: 100,
    images: ["/uploads/1751104477412-oemkuwe6hd.jpg","/uploads/1751104477858-g06efnubfm.jpg","/uploads/1751104478283-bf8emebakb.jpg","/uploads/1751104478736-d82hdrxbtbr.jpg","/uploads/1751104479081-1kq5jhx2qsq.jpg","/uploads/1751104479535-vfaf73cp5f.jpg","/uploads/1751104479943-q41dd6nve2l.jpg"],
    published: true,
    colorName: 'коричневый'
  },
  {
    id: 'cmcfdkjtz003pkrxhobxvtejz',
    name: 'Футболка однотонная базовая белая кашкорсе',
    slug: 'futbolka-odnotonnaya-bazovaya-belaya-kashkorse-446346856',
    description: 'Эта мужская футболка с обтяжкой станет отличным выбором для летнего гардероба. Выполненная в белом молочном цвете, она обладает приталенным кроем.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-446346856',
    stock: 100,
    images: ["/uploads/1751101588334-gflrbze422d.jpg"],
    published: true,
    colorName: 'белый'
  },
  {
    id: 'cmcfdkjjd002kkrxh6ykewr9u',
    name: 'Футболка поло ажурная в стиле Old Money',
    slug: 'futbolka-polo-azhurnaya-v-stile-old-money-371134106',
    description: 'Футболка поло от NAKEN - это идеальный выбор для тех, кто ценит комфорт и стиль. Ажурная вязка придает ей легкую и воздушную текстуру.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-371134106',
    stock: 100,
    images: ["/uploads/1751113168344-qxbjfykc9e.jpg","/uploads/1751113172873-8tdtmnjivuv.jpg","/uploads/1751113175344-ete71tt0jmc.jpg","/uploads/1751113176730-kl0cpukf5kr.jpg","/uploads/1751113179351-61ap6yt4ud.jpg","/uploads/1751113182478-hap461e9qad.jpg","/uploads/1751113184030-f2b75o6zz7u.jpg","/uploads/1751113186319-66p0rlb3d67.jpg","/uploads/1751113189048-d3anj2yz53.jpg"],
    published: true,
    colorName: 'коричневый'
  },
  {
    id: 'cmcfdkj0u0001krxhan4jlw25',
    name: 'Однотонная футболка в аристократичном стиле old money',
    slug: 'odnotonnaya-futbolka-v-atristokratichnom-stile-old-money-220598151',
    description: 'Мужская футболка в черном цвете, из ткани лапша с утягивающим эффектом станет отличным выбором для летнего гардероба.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-220598151',
    stock: 100,
    images: ["/uploads/1751120420912-j2d8yjtq6wf.jpg","/uploads/1751120422238-p9syg0o0fh.jpg","/uploads/1751120423751-maghb40jq3j.jpg","/uploads/1751120425316-rt6fu0cwdkb.jpg","/uploads/1751120427166-jxu4g76yivb.jpg"],
    published: true,
    colorName: 'черный'
  },
  {
    id: 'cmcfdkj4c000jkrxhvv4z6glf',
    name: 'Футболка однотонная в стиле old money',
    slug: 'futbolka-odnotonnaya-v-stile-old-money-320104109',
    description: 'Мужская футболка в белом молочном цветах, из ткани лапша с утягивающим эффектом станет отличным выбором для летнего гардероба.',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-320104109',
    stock: 100,
    images: ["/uploads/1751121356537-t63ew37mdd.jpg","/uploads/1751121359095-nm63rokerd9.jpg","/uploads/1751121361826-my6otgn7vhn.jpg","/uploads/1751121363598-mwzg171s03s.jpg"],
    published: true,
    colorName: 'молочный'
  },
  {
    id: 'cmcfdkjyw003zkrxhz16hlsh1',
    name: 'Футболка однотонная базовая черный кашкорсе',
    slug: 'futbolka-odnotonnaya-bazovaya-chernyy-kashkorse-446346857',
    description: 'Эта мужская футболка с обтяжкой станет отличным выбором для летнего гардероба. Выполненная в черном цвете, она обладает приталенным кроем, который подчеркивает фигуру. Базовая модель с...',
    price: 1800,
    salePrice: null,
    sku: 'NAKEN-446346857',
    stock: 100,
    images: ["/uploads/1751099189407-d5e2ha22yg5.jpg"],
    published: true,
    colorName: 'черный'
  },
  {
    id: 'cmcgd83h10026krlx5e8pioaa',
    name: 'Майка с подтяжками',
    slug: 'odezhda-aa-yaa-m-chernyj-ndam',
    description: 'Мужская обтягивающая майка с подятжками — отличный выбор для активных мужчин, увлеченных танцами и спортом.',
    price: 1300,
    salePrice: null,
    sku: 'maika-vandam',
    stock: 100,
    images: ["/uploads/1751122651909-n5iycvavdmj.jpg","/uploads/1751122653694-3uu9t9iuwg4.jpg","/uploads/1751122655704-0wtxjaakcih.jpg","/uploads/1751122657087-iqm885j8wl.jpg","/uploads/1751122658692-vdeuysvh8s.jpg","/uploads/1751122660359-gc91as3jyy.jpg"],
    published: true,
    colorName: 'черный'
  }
];

// Размеры для всех товаров
const sizes = ['S', 'M', 'L', 'XL'];

async function restoreProducts() {
  console.log('🔄 Начинаю восстановление товаров из бэкапа...');

  try {
    // Получаем существующие цвета и размеры
    const [existingColors, existingSizes] = await Promise.all([
      prisma.color.findMany(),
      prisma.size.findMany()
    ]);

    const colorMap = new Map(existingColors.map(c => [c.name, c.id]));
    const sizeMap = new Map(existingSizes.map(s => [s.name, s.id]));

    let restoredCount = 0;
    let skippedCount = 0;

    for (const product of backupProducts) {
      // Проверяем, существует ли товар
      const existingProduct = await prisma.product.findUnique({
        where: { sku: product.sku }
      });

      if (existingProduct) {
        console.log(`⏭️  Товар ${product.sku} уже существует`);
        skippedCount++;
        continue;
      }

      // Найти цвет для товара
      const colorId = colorMap.get(product.colorName) || colorMap.get('Без цвета');

      // Генерируем SEO данные
      const seoData = await generateSEOData({
        name: product.name,
        description: product.description,
        price: product.price
      });

      // Создаем товар с SEO данными
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice,
          sku: product.sku,
          stock: product.stock,
          images: product.images,
          published: product.published,
          colorId: colorId,
          // Добавляем SEO поля
          seoTitle: seoData.title,
          seoKeywords: seoData.keywords,
          faq: JSON.stringify(seoData.faq),
          views: 0
        }
      });

      // Добавляем размеры для товара
      for (const sizeName of sizes) {
        const sizeId = sizeMap.get(sizeName);
        if (sizeId) {
          await prisma.productSize.create({
            data: {
              productId: createdProduct.id,
              sizeId: sizeId,
              stock: 100
            }
          });
        }
      }

      console.log(`✅ Восстановлен товар: ${product.name} (${product.sku})`);
      restoredCount++;
    }

    console.log(`\n🎉 Восстановление завершено!`);
    console.log(`✅ Восстановлено товаров: ${restoredCount}`);
    console.log(`⏭️  Пропущено (уже существуют): ${skippedCount}`);
    console.log(`📊 Всего обработано: ${restoredCount + skippedCount}`);

    // Обновляем общее количество в базе
    const totalProducts = await prisma.product.count();
    console.log(`📦 Всего товаров в базе: ${totalProducts}`);

    return { restored: restoredCount, skipped: skippedCount, total: totalProducts };

  } catch (error) {
    console.error('❌ Ошибка при восстановлении товаров:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await restoreProducts();
    
    console.log('\n🚀 Запускаю SEO оптимизацию для всех товаров...');
    
    // Запускаем SEO оптимизацию
    const { spawn } = require('child_process');
    const seoProcess = spawn('node', ['scripts/seo-boost-products.js', 'all'], {
      stdio: 'inherit'
    });

    seoProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ SEO оптимизация завершена успешно!');
      } else {
        console.log('⚠️ SEO оптимизация завершилась с ошибками');
      }
      process.exit(code);
    });

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск с аргументами командной строки
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔄 Скрипт восстановления товаров из бэкапа

Использование:
  node scripts/restore-products-from-backup.js

Возможности:
  - Восстанавливает все 20 товаров из бэкапа
  - Автоматически генерирует SEO данные
  - Добавляет размеры для всех товаров  
  - Пропускает уже существующие товары
  - Запускает SEO оптимизацию после импорта

Пример:
  node scripts/restore-products-from-backup.js
`);
    process.exit(0);
  }

  main();
}

module.exports = { restoreProducts }; 