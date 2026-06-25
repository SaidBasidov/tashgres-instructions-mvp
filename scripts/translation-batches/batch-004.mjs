import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { batch as batch003 } from "./batch-003.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");
const previousSpecs = new Map(batch003.map((spec) => [spec.documentId, spec]));

function readDocument(documentId) {
  return JSON.parse(fs.readFileSync(path.join(importedRoot, documentId, "document.json"), "utf8"));
}

function sourceBlocks(documentId) {
  const document = readDocument(documentId);
  return document.translations[document.sourceLanguage].blocks;
}

function blockMap(documentId, translator) {
  return Object.fromEntries(sourceBlocks(documentId).map((block) => [block.id, translator(block.text || "", block)]));
}

const ruUzPhrases = [
  ["УТВЕРЖДАЮ", "TASDIQLAYMAN"],
  ["ТЕХНИЧЕСКИЙ ДИРЕКТОР", "TEXNIK DIREKTOR"],
  ["АО « ТАШКЕНТСКАЯ ТЭС»", "AJ «TOSHKENT IES»"],
  ["Т И П О В А Я П Р О Г Р А М М А", "NAMUNAVIY DASTUR"],
  ["ТИПОВАЯ ПРОГРАММА", "NAMUNAVIY DASTUR"],
  ["ПРОГРАММА", "DASTUR"],
  ["Подготовительные работы", "Tayyorgarlik ishlari"],
  ["ПОДГОТОВИТЕЛЬНЫЕ РАБОТЫ", "TAYYORGARLIK ISHLARI"],
  ["ПРОДУВКА ПАРОПРОВОДОВ", "BUG‘ QUVURLARINI PUFLASH"],
  ["Проведение паровой продувки котла", "Qozonni bug‘ bilan puflashni o‘tkazish"],
  ["Программа паровой продувки котла", "Qozonni bug‘ bilan puflash dasturi"],
  ["паровой продувки котла", "qozonni bug‘ bilan puflash"],
  ["опрессовки первичного тракта", "birlamchi traktni presslash"],
  ["первичного тракта котлоагрегата", "qozon agregati birlamchi trakti"],
  ["ОСТАНОВ ТУРБИННОЙ УСТАНОВКИ", "TURBINA QURILMASINI TO‘XTATISH"],
  ["опробование защиты турбогенератора от разгона", "turbogeneratorning razgondan himoyasini sinab ko‘rish"],
  ["пуск на холостой ход", "bo‘sh yurishga ishga tushirish"],
  ["проверка автомата безопасности", "xavfsizlik avtomatini tekshirish"],
  ["проверка автомата безопасности", "xavfsizlik avtomatini tekshirish"],
  ["необходимо", "zarur"],
  ["должны быть", "bo‘lishi kerak"],
  ["должен быть", "bo‘lishi kerak"],
  ["запрещается", "taqiqlanadi"],
  ["производится", "bajariladi"],
  ["производятся", "bajariladi"],
  ["проверить", "tekshirish"],
  ["Проверить", "Tekshirish"],
  ["отключить", "o‘chirish"],
  ["Отключить", "O‘chirish"],
  ["включить", "yoqish"],
  ["Включить", "Yoqish"],
  ["закрыть", "yopish"],
  ["Закрыть", "Yopish"],
  ["открыть", "ochish"],
  ["Открыть", "Ochish"],
  ["останов", "to‘xtatish"],
  ["Останов", "To‘xtatish"],
  ["растопку котла", "qozonni yoqish"],
  ["растопки котла", "qozonni yoqish"],
  ["питательной воды", "oziqlantiruvchi suv"],
  ["химобессоленной водой", "kimyoviy tuzsizlantirilgan suv bilan"],
  ["паропроводов", "bug‘ quvurlari"],
  ["паропроводы", "bug‘ quvurlari"],
  ["котла", "qozon"],
  ["Котла", "Qozon"],
  ["турбины", "turbina"],
  ["Турбины", "Turbina"],
  ["трубопроводов", "quvurlar"],
  ["давление", "bosim"],
  ["Давление", "Bosim"],
  ["температура", "harorat"],
  ["Температура", "Harorat"],
  ["частота вращения", "aylanish chastotasi"],
  ["персонал", "xodimlar"],
  ["Персонал", "Xodimlar"],
  ["ремонт", "ta’mir"],
  ["Ремонт", "Ta’mir"],
  ["арматуры", "armatura"],
  ["дефектов", "nuqsonlar"],
  ["Ответственный", "Mas’ul"],
  ["Начальник", "Boshliq"],
  ["начальник", "boshliq"],
  ["Зам. тех.директора", "Texnik direktor o‘rinbosari"],
  ["по тепломеханической части", "issiqlik-mexanika qismi bo‘yicha"],
  ["по электрооборудованию", "elektr uskunalari bo‘yicha"],
  ["Ведущий инспектор", "Yetakchi inspektor"],
  ["Руководитель работ", "Ishlar rahbari"],
  ["после ремонта", "ta’mirdan keyin"],
  ["после среднего ремонта", "o‘rta ta’mirdan keyin"],
  ["автомат безопасности", "xavfsizlik avtomati"],
  ["защиты от разгона", "razgondan himoya"],
  ["разгон", "razgon"],
  ["холостой ход", "bo‘sh yurish"],
  ["аварийных ситуациях", "avariya vaziyatlarida"],
];

const uzRuPhrases = [
  ["YO‘RIQNOMA", "ИНСТРУКЦИЯ"],
  ["AVARIYALARNI NG OLDINI OLISH VA BARTARAF ETISH", "ПРЕДУПРЕЖДЕНИЕ И ЛИКВИДАЦИЯ АВАРИЙ"],
  ["K-160-130 VA PVK-150 RUSUMLI TURBINADA", "НА ТУРБИНЕ ТИПА К-160-130 И ПВК-150"],
  ["NORMATIV HUJJA T", "НОРМАТИВНЫЙ ДОКУМЕНТ"],
  ["So‘z boshi", "Предисловие"],
  ["Qo‘lla", "Область применения"],
  ["avariya", "авария"],
  ["avariyalar", "аварии"],
  ["turbina", "турбина"],
  ["bug‘", "пар"],
  ["qozon", "котёл"],
  ["baraban", "барабан"],
  ["bosim", "давление"],
  ["harorat", "температура"],
  ["moy", "масло"],
  ["nasos", "насос"],
  ["klapan", "клапан"],
  ["klapanlari", "клапаны"],
  ["himoya", "защита"],
  ["o‘chirish", "отключение"],
  ["to‘xtatish", "останов"],
  ["xodimlar", "персонал"],
  ["ko‘rik", "осмотр"],
  ["tekshirish", "проверка"],
  ["bajariladi", "выполняется"],
  ["zarur", "необходимо"],
  ["taqiqlanadi", "запрещается"],
  ["kerak", "должен"],
  ["muvofiq", "в соответствии"],
  ["ishlab chiqilgan", "разработан"],
  ["tasdiqlangan", "утверждён"],
  ["amalga kiritilgan", "введён в действие"],
];

function replaceMany(value, replacements) {
  let result = value;
  for (const [source, target] of replacements) result = result.replaceAll(source, target);
  return result;
}

function ruToUz(value) {
  if (!value.trim()) return "";
  const translated = replaceMany(value, ruUzPhrases);
  if (translated === value && /[а-яё]{4}/i.test(value) && value.length > 30) return `Texnik tarjima talab qilinadi: ${translated}`;
  return translated;
}

function uzToRu(value) {
  if (!value.trim()) return "";
  const translated = replaceMany(value, uzRuPhrases);
  if (translated === value && /[а-яё]{4}/i.test(value) && value.length > 30) return `Русская версия: ${translated}`;
  if (translated === value && /[A-Za-z]{4}/.test(value) && value.length > 30) return `Технический перевод требует проверки: ${translated}`;
  return translated;
}

function ruSpec(documentId, title, summary, searchMetadata, overrides = {}) {
  return {
    documentId,
    title,
    summary,
    blocks: { ...blockMap(documentId, (text) => ruToUz(text)), ...overrides },
    searchMetadata,
  };
}

function fromPrevious(documentId, previousDocumentId, options = {}) {
  const previous = previousSpecs.get(previousDocumentId);
  const source = sourceBlocks(documentId);
  return {
    documentId,
    title: options.title || previous.title,
    summary: options.summary || previous.summary,
    blocks: Object.fromEntries(source.map((block) => [
      block.id,
      options.overrides?.[block.id] ?? previous.blocks?.[block.id] ?? ruToUz(block.text || ""),
    ])),
    searchMetadata: options.searchMetadata || previous.searchMetadata,
  };
}

function uzLatnSpec(documentId, ruTitle, ruSummary, ruSearchMetadata) {
  return {
    documentId,
    targetLanguages: ["ru", "uzCyrl"],
    translations: {
      ru: {
        title: ruTitle,
        summary: ruSummary,
        blocks: blockMap(documentId, (text) => uzToRu(text)),
        searchMetadata: ruSearchMetadata,
      },
    },
  };
}

export const batch = [
  ruSpec(
    "программа_паровои-_продувки_котла_no1_новая_уэт_2024",
    "№1 QOZONNI BUG‘ BILAN PUFLASH DASTURI",
    "№1 qozon va bug‘ quvurlarini ta’mirdan keyin bug‘ bilan puflash, tayyorlash, xavfsizlik va qabul mezonlari dasturi.",
    {
      keywords: ["qozonni bug‘ bilan puflash", "bug‘ quvurlari", "VGB R 513", "nazorat oynalari", "vaqtinchalik quvurlar"],
      aliases: ["parovoy produvka", "qozon puflash", "bug‘ quvuri puflash"],
    },
  ),
  fromPrevious("продувка-паропров-после-рем-2025", "продувка-паропров-после-рем-2026", {
    summary: "Blok ta’miridan keyin bug‘ quvurlaridan begona jismlarni chiqarish uchun puflash ishlari tartibi; tasvirlar alohida lokalizatsiya qilinmaydi.",
    overrides: {
      "block-0018": ruToUz(sourceBlocks("продувка-паропров-после-рем-2025").find((block) => block.id === "block-0018").text),
      "block-0021": ruToUz(sourceBlocks("продувка-паропров-после-рем-2025").find((block) => block.id === "block-0021").text),
      "block-0024": "СНТБ boshlig‘i B.B. Nurdinov",
      "block-0025": "ММ va XT bo‘yicha yetakchi inspektor F.M. Mirzaxidova",
      "block-0026": "КТЦ-1 boshlig‘i U.L. Majlimov",
    },
  }),
  ruSpec(
    "пров-опрес-первичн-тракта-2026",
    "ТГМ-94 QOZON AGREGATI BIRLAMCHI TRAKTINI ISH BOSIMIGA PRESSLASH BO‘YICHA NAMUNAVIY DASTUR",
    "Qozon birlamchi traktini to‘ldirish, presslash, ko‘rikdan o‘tkazish va xavfsiz ishlarni tashkil etish tartibi.",
    {
      keywords: ["birlamchi traktni presslash", "qozon bosimi", "gidravlik sinov", "drenajlar", "oziqlantiruvchi suv"],
      aliases: ["opressovka trakta", "qozonni presslash", "ish bosimi"],
    },
  ),
  ruSpec(
    "останов_турбиннои-_установки_no8_в_режим_холост_ход",
    "№8 TURBINA QURILMASINI BO‘SH YURISH REJIMIGA TO‘XTATISH",
    "№8 turbina qurilmasini yuklamadan bo‘sh yurish rejimiga o‘tkazish, almashlab ulash va nazorat operatsiyalari tartibi.",
    {
      keywords: ["turbina qurilmasini to‘xtatish", "№8 turbina", "bo‘sh yurish", "yuklamani kamaytirish", "operativ almashlab ulash"],
      aliases: ["turbina ostanov", "holostoy hod", "№8 ТГ to‘xtatish"],
    },
  ),
  ruSpec(
    "опроб-защиты-от-разгона-2026",
    "TURBOGENERATORNING RAZGONDAN HIMOYASINI SINAB KO‘RISH BO‘YICHA NAMUNAVIY DASTUR",
    "Turbogenerator razgondan himoyasini sinash, xodimlarni joylashtirish va avariya holatlaridagi harakatlar tartibi.",
    {
      keywords: ["razgondan himoya", "turbogenerator himoyasi", "xavfsizlik avtomati", "rotor aylanish chastotasi", "ТГ sinovi"],
      aliases: ["oprobovanie zashchity", "razgon himoyasi", "ТГ avtomat xavfsizlik"],
    },
    {
      "block-0048": "2.3. Aylanish chastotasini avval turbina boshqaruv mexanizmi bilan 3200 об/мин. gacha, so‘ng razgon qurilmasi bilan ikkita halqadan biri ishga tushguncha ravon oshirib borish; halqa ishga tushgan chastota taxometr bo‘yicha qayd etiladi, aylanishlar 3360 об/мин. dan oshmasligi kerak. Halqaning qayta o‘tirishi nazorat qilinadi.",
    },
  ),
  ruSpec(
    "опроб-защиты-от-разгона-2025",
    "TURBOGENERATORNING RAZGONDAN HIMOYASINI SINAB KO‘RISH BO‘YICHA NAMUNAVIY DASTUR",
    "Turbogenerator razgondan himoyasini sinash bo‘yicha 2025 yilgi dastur; tasvirlar umumiy asset sifatida saqlanadi.",
    {
      keywords: ["razgondan himoya 2025", "turbogenerator himoyasi", "xavfsizlik avtomati", "rotor aylanish chastotasi", "ТГ sinovi"],
      aliases: ["oprobovanie zashchity 2025", "razgon himoyasi", "ТГ avtomat xavfsizlik"],
    },
    {
      "block-0048": "2.3. Aylanish chastotasini avval turbina boshqaruv mexanizmi bilan 3200 об/мин. gacha, so‘ng razgon qurilmasi bilan ikkita halqadan biri ishga tushguncha ravon oshirib borish; halqa ishga tushgan chastota taxometr bo‘yicha qayd etiladi, aylanishlar 3360 об/мин. dan oshmasligi kerak. Halqaning qayta o‘tirishi nazorat qilinadi.",
    },
  ),
  ruSpec(
    "пуск_на_холостои-_ход_и_пров_авт_безопасн_2026",
    "BO‘SH YURISHGA ISHGA TUSHIRISH VA XAVFSIZLIK AVTOMATINI TEKSHIRISH DASTURI",
    "Blokni bo‘sh yurishga ishga tushirish, tayyorgarlik ishlarini bajarish va xavfsizlik avtomatini tekshirish tartibi.",
    {
      keywords: ["bo‘sh yurishga pusk", "xavfsizlik avtomati", "ТГ pusk", "rotor aylanish chastotasi", "tayyorgarlik ishlari"],
      aliases: ["holostoy hod pusk", "avtomat bezopasnosti", "ТГni ishga tushirish"],
    },
  ),
  uzLatnSpec(
    "kн-131-2026-y-к-k-160-130",
    "Инструкция. Предупреждение и ликвидация аварий на турбине типа К-160-130 и ПВК-150",
    "Нормативная инструкция по предупреждению и ликвидации аварий на турбинах К-160-130 и ПВК-150, действиям оперативного персонала и защитам оборудования.",
    {
      keywords: ["аварии турбины", "К-160-130", "ПВК-150", "оперативный персонал", "защиты турбины", "давление масла"],
      aliases: ["ликвидация аварий турбины", "предупреждение аварий", "инструкция по авариям ТГ"],
    },
  ),
];
