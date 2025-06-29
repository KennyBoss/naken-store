"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// --- Вспомогательные функции для генерации slug ---
function transliterate(text) {
    var translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return text
        .toLowerCase()
        .split('')
        .map(function (char) { return translitMap[char] || char; })
        .join('');
}
function createProductSlug(name, sizes, colors) {
    var baseSlug = transliterate(name)
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (sizes && sizes.length > 0) {
        var sizeSlug = transliterate(sizes[0]).replace(/[^a-z0-9]/g, '');
        if (sizeSlug) {
            baseSlug += '-' + sizeSlug;
        }
    }
    if (colors && colors.length > 0) {
        var colorSlug = transliterate(colors[0]).replace(/[^a-z0-9]/g, '');
        if (colorSlug) {
            baseSlug += '-' + colorSlug;
        }
    }
    return baseSlug;
}
// --- Конец вспомогательных функций ---
// Список реальных изображений
var images = [
    '/images/men-jacket.jpg',
    '/images/women-dress.jpg',
    '/images/sport-tshirt.jpg',
    '/images/women-shirt.jpg',
    '/images/men-jeans.jpg',
];
// Функция для получения случайного набора изображений
var getRandomImages = function () {
    var shuffled = __spreadArray([], images, true).sort(function () { return 0.5 - Math.random(); });
    var count = Math.floor(Math.random() * 3) + 1; // от 1 до 3 изображений
    return JSON.stringify(shuffled.slice(0, count));
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var categoriesData, _i, categoriesData_1, category, menCat, womenCat, sportCat, productsData, i, _a, productsData_1, p, slug;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Заполняем базу данных...');
                    categoriesData = [
                        { name: 'Мужская одежда', slug: 'men' },
                        { name: 'Женская одежда', slug: 'women' },
                        { name: 'Спортивная одежда', slug: 'sport' },
                        { name: 'Аксессуары', slug: 'accessories' }
                    ];
                    _i = 0, categoriesData_1 = categoriesData;
                    _b.label = 1;
                case 1:
                    if (!(_i < categoriesData_1.length)) return [3 /*break*/, 4];
                    category = categoriesData_1[_i];
                    return [4 /*yield*/, prisma.category.upsert({
                            where: { slug: category.slug },
                            update: {},
                            create: category,
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Категории созданы/обновлены.');
                    return [4 /*yield*/, prisma.category.findUnique({ where: { slug: 'men' } })];
                case 5:
                    menCat = _b.sent();
                    return [4 /*yield*/, prisma.category.findUnique({ where: { slug: 'women' } })];
                case 6:
                    womenCat = _b.sent();
                    return [4 /*yield*/, prisma.category.findUnique({ where: { slug: 'sport' } })
                        // 2. Очистка старых товаров для чистого сидинга
                    ];
                case 7:
                    sportCat = _b.sent();
                    // 2. Очистка старых товаров для чистого сидинга
                    return [4 /*yield*/, prisma.product.deleteMany({})];
                case 8:
                    // 2. Очистка старых товаров для чистого сидинга
                    _b.sent();
                    console.log('Старые товары удалены.');
                    productsData = [
                        // Мужские
                        { name: 'Майка в стиле Old Money', price: 3200, salePrice: 2560, categoryId: menCat.id, stock: 15 },
                        { name: 'Классические брюки', price: 4500, categoryId: menCat.id, stock: 20 },
                        { name: 'Льняная рубашка', price: 3800, salePrice: 3000, categoryId: menCat.id, stock: 18 },
                        { name: 'Джинсовая куртка', price: 7200, categoryId: menCat.id, stock: 10 },
                        { name: 'Базовое худи', price: 4100, categoryId: menCat.id, stock: 25 },
                        // Женские
                        { name: 'Женская рубашка', price: 2400, categoryId: womenCat.id, stock: 22 },
                        { name: 'Летнее платье', price: 2800, categoryId: womenCat.id, stock: 12 },
                        { name: 'Шелковая блуза', price: 4600, salePrice: 3900, categoryId: womenCat.id, stock: 14 },
                        { name: 'Юбка-миди плиссе', price: 3500, categoryId: womenCat.id, stock: 19 },
                        { name: 'Тренч классический', price: 9500, categoryId: womenCat.id, stock: 8 },
                        // Спортивные
                        { name: 'Спортивная футболка', price: 1200, categoryId: sportCat.id, stock: 30 },
                        { name: 'Леггинсы для фитнеса', price: 2900, categoryId: sportCat.id, stock: 28 },
                        { name: 'Спортивный топ', price: 2100, salePrice: 1800, categoryId: sportCat.id, stock: 24 },
                        { name: 'Тренировочные шорты', price: 2300, categoryId: sportCat.id, stock: 35 },
                        { name: 'Олимпийка на молнии', price: 4800, categoryId: sportCat.id, stock: 16 },
                    ];
                    i = 1;
                    _a = 0, productsData_1 = productsData;
                    _b.label = 9;
                case 9:
                    if (!(_a < productsData_1.length)) return [3 /*break*/, 12];
                    p = productsData_1[_a];
                    slug = createProductSlug(p.name, [], []) // Простой slug для сидов
                    ;
                    return [4 /*yield*/, prisma.product.create({
                            data: __assign(__assign({}, p), { slug: "".concat(slug, "-").concat(i), sku: "NAKEN-".concat(2024 + i++), description: 'Это прекрасный товар из нашей последней коллекции. Высокое качество и стильный дизайн не оставят вас равнодушным. Сделано с любовью в NAKEN.', images: getRandomImages(), published: true }),
                        })];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    _a++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log("\u2705 \u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0430. \u0421\u043E\u0437\u0434\u0430\u043D\u043E ".concat(productsData.length, " \u0442\u043E\u0432\u0430\u0440\u043E\u0432."));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
