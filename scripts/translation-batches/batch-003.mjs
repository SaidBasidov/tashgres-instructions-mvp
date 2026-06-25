import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { batch as batch001 } from "./batch-001.mjs";
import { batch as batch002 } from "./batch-002.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");
const previousSpecs = new Map([...batch001, ...batch002].map((spec) => [spec.documentId, spec]));

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
  ["Технический директор", "Texnik direktor"],
  ["АО « ТАШКЕНТСКАЯ ТЭС»", "AJ «TOSHKENT IES»"],
  ["АО «Ташкентская ТЭС»", "AJ «Toshkent IES»"],
  ["Т И П О В А Я П Р О Г Р А М М А", "NAMUNAVIY DASTUR"],
  ["Т И П О В А Я П Р О Г РА М М А", "NAMUNAVIY DASTUR"],
  ["ТИПОВАЯ ПРОГРАММА", "NAMUNAVIY DASTUR"],
  ["П Р О Г Р А М М А", "DASTUR"],
  ["ПРОГРАММА", "DASTUR"],
  ["ПОДГОТОВИТЕЛЬНЫЕ РАБОТЫ", "TAYYORGARLIK ISHLARI"],
  ["ОРГАНИЗАЦИОННЫЕ ВОПРОСЫ", "TASHKILIY MASALALAR"],
  ["ПОРЯДОК ОПЕРАЦИИ", "OPERATSIYALAR TARTIBI"],
  ["ПРОДУВКА ПАРОПРОВОДОВ", "BUG‘ QUVURLARINI PUFLASH"],
  ["ПРОВЕДЕНИЕ ГИДРАВЛИЧЕСКИХ ИСПЫТАНИЙ", "GIDRAVLIK SINOVLARNI O‘TKAZISH"],
  ["ОРГАНИЗАЦИОННЫЕ МЕРОПРИЯТИЯ, ОБЕСПЕЧИВАЮЩИЕ БЕЗОПАСНОСТЬ РАБОТ", "ISHLAR XAVFSIZLIGINI TA’MINLAYDIGAN TASHKILIY TADBIRLAR"],
  ["Проверка плотности", "Zichlikni tekshirish"],
  ["проверка плотности", "zichlikni tekshirish"],
  ["стопорных", "to‘xtatish"],
  ["регулирующих клапанов", "rostlash klapanlari"],
  ["регулирующих клапанов", "rostlash klapanlari"],
  ["после среднего ремонта", "o‘rta ta’mirdan keyin"],
  ["после ремонта", "ta’mirdan keyin"],
  ["блока №2", "№2 blok"],
  ["блока", "blok"],
  ["проведения гидравлического испытания", "gidravlik sinovni o‘tkazish"],
  ["котлоагрегата", "qozon agregati"],
  ["парового опробования котла", "qozonni bug‘ bilan sinab ko‘rish"],
  ["настройка клапанов", "klapanlarni sozlash"],
  ["продувки паропроводов", "bug‘ quvurlarini puflash"],
  ["САР турбин", "turbinalar САР"],
  ["системы регулирования", "rostlash tizimi"],
  ["регулирования", "rostlash"],
  ["номинальными параметрами пара", "bug‘ning nominal parametrlari"],
  ["скользящих параметров", "sirpanuvchi parametrlar"],
  ["выход на регулирование", "rostlashga chiqish"],
  ["проверить", "tekshirish"],
  ["Проверить", "Tekshirish"],
  ["провести", "o‘tkazish"],
  ["Провести", "O‘tkazish"],
  ["отключить", "o‘chirish"],
  ["Отключить", "O‘chirish"],
  ["включить", "yoqish"],
  ["Включить", "Yoqish"],
  ["закрыть", "yopish"],
  ["Закрыть", "Yopish"],
  ["открыть", "ochish"],
  ["Открыть", "Ochish"],
  ["должны быть", "bo‘lishi kerak"],
  ["должна быть", "bo‘lishi kerak"],
  ["необходимо", "zarur"],
  ["производится", "bajariladi"],
  ["производятся", "bajariladi"],
  ["согласно", "muvofiq"],
  ["в соответствии", "muvofiq"],
  ["Ответственный", "Mas’ul"],
  ["Начальник", "Boshliq"],
  ["начальник", "boshliq"],
  ["Зам. тех.директора", "Texnik direktor o‘rinbosari"],
  ["Зам.ТЕХНИЧЕСКОГО ДИРЕКТОРА", "TEXNIK DIREKTOR O‘RINBOSARI"],
  ["по тепломеханической части", "issiqlik-mexanika qismi bo‘yicha"],
  ["по электрооборудованию", "elektr uskunalari bo‘yicha"],
  ["Ведущий инспектор", "Yetakchi inspektor"],
  ["Руководитель работ", "Ishlar rahbari"],
  ["химического цеха", "kimyo sexi"],
  ["ХИМ.РЕЖИМА", "KIMYOVIY REJIM"],
  ["химического режима", "kimyoviy rejim"],
  ["хим.режима", "kimyoviy rejim"],
  ["конденсатора", "kondensator"],
  ["котла", "qozon"],
  ["Котла", "Qozon"],
  ["турбины", "turbina"],
  ["Турбины", "Turbina"],
  ["давление", "bosim"],
  ["Давление", "Bosim"],
  ["температура", "harorat"],
  ["Температура", "Harorat"],
  ["частота вращения", "aylanish chastotasi"],
  ["персонал", "xodimlar"],
  ["Персонал", "Xodimlar"],
  ["инструктаж", "yo‘riqnoma"],
  ["испытания", "sinovlar"],
  ["испытание", "sinov"],
  ["ремонт", "ta’mir"],
  ["Ремонт", "Ta’mir"],
  ["арматуры", "armatura"],
  ["паропроводов", "bug‘ quvurlari"],
  ["питательной воды", "oziqlantiruvchi suv"],
  ["химобессоленной водой", "kimyoviy tuzsizlantirilgan suv bilan"],
  ["неплотностей", "zich bo‘lmagan joylar"],
  ["при положительных результатах", "ijobiy natijalarda"],
  ["составляется совместный акт", "qo‘shma dalolatnoma tuziladi"],
  ["аварийных ситуациях", "avariya vaziyatlarida"],
  ["действия оперативного персонала", "operativ xodimlar harakatlari"],
];

const uzRuPhrases = [
  ["NORMATIV HUJJA T", "НОРМАТИВНЫЙ ДОКУМЕНТ"],
  ["K-160-130 RUSUMLI", "ТИПА К-160-130"],
  ["BU G‘ TURBINANING", "ПАРОВОЙ ТУРБИНЫ"],
  ["ROSTLASH TIZIMINI", "СИСТЕМЫ РЕГУЛИРОВАНИЯ"],
  ["ISHLATISH", "ЭКСПЛУАТАЦИЯ"],
  ["TAVSIFLAB BERISH", "ОПИСАНИЕ"],
  ["YO‘RI Q NOMASI", "ИНСТРУКЦИЯ"],
  ["So‘z boshi", "Предисловие"],
  ["Qo‘lla", "Область применения"],
  ["Rostlash tizimi tavsifi", "Описание системы регулирования"],
  ["Ishga tushir", "Пуск"],
  ["texnik xizmat ko‘rsatish", "техническое обслуживание"],
  ["ta’mirlashga chiqarish", "вывод в ремонт"],
  ["xavfsizlik texnikasi", "техника безопасности"],
  ["yong‘in xavfsizligi", "пожарная безопасность"],
  ["bug‘ turbinasi", "паровая турбина"],
  ["bug‘", "пар"],
  ["turbina", "турбина"],
  ["rostlash", "регулирование"],
  ["tizimi", "система"],
  ["klapan", "клапан"],
  ["klapanlari", "клапаны"],
  ["bosim", "давление"],
  ["moy", "масло"],
  ["nasos", "насос"],
  ["podshipnik", "подшипник"],
  ["aylanish", "вращение"],
  ["tezligi", "скорость"],
  ["yuklanish", "нагрузка"],
  ["xodimlar", "персонал"],
  ["ishlab chiqilgan", "разработан"],
  ["tasdiqlangan", "утверждён"],
  ["amalga kiritilgan", "введён в действие"],
  ["muvofiq", "в соответствии"],
  ["kerak", "должен"],
  ["ta’minlaydi", "обеспечивает"],
  ["tekshirish", "проверка"],
  ["ta’mir", "ремонт"],
  ["jadval", "график"],
];

function replaceMany(value, replacements) {
  let result = value;
  for (const [source, target] of replacements) result = result.replaceAll(source, target);
  return result;
}

function ruToUz(value) {
  if (!value.trim()) return "";
  const translated = replaceMany(value, ruUzPhrases);
  if (translated === value && /[а-яё]{4}/i.test(value) && value.length > 30) {
    return `Texnik tarjima talab qilinadi: ${translated}`;
  }
  return translated;
}

function uzToRu(value) {
  if (!value.trim()) return "";
  const translated = replaceMany(value, uzRuPhrases);
  if (translated === value && /[а-яё]{4}/i.test(value) && value.length > 30) {
    return `Русская версия: ${translated}`;
  }
  if (translated === value && /[A-Za-z]{4}/.test(value) && value.length > 30) {
    return `Технический перевод требует проверки: ${translated}`;
  }
  return translated;
}

function fromPrevious(documentId, previousDocumentId, options = {}) {
  const source = sourceBlocks(documentId);
  const previous = previousSpecs.get(previousDocumentId);
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

function ruSpec(documentId, title, summary, searchMetadata, overrides = {}) {
  return {
    documentId,
    title,
    summary,
    blocks: { ...blockMap(documentId, (text) => ruToUz(text)), ...overrides },
    searchMetadata,
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
    "перевод-сар-2026",
    "TOSHKENT IES TURBINALARI САРNI NOMINAL BUG‘ PARAMETRLARIGA O‘TKAZISH BO‘YICHA NAMUNAVIY DASTUR",
    "Turbinalar САРni to‘liq ochiq yuqori bosim rostlash klapanlaridan nominal bug‘ parametrlarida ishlashga o‘tkazish tartibi.",
    {
      keywords: ["САРni o‘tkazish", "nominal bug‘ parametrlari", "rostlash klapanlari", "sinxronizator", "blok yuklamasi"],
      aliases: ["turbina САР", "rostlashga chiqish", "sirpanuvchi parametrlar"],
    },
  ),
  ruSpec(
    "ппр-восстановл-хим-режима-2026-г",
    "KIMYOVIY REJIMNI TIKLASH BO‘YICHA ISHLARNI BAJARISH LOYIHASI",
    "Bloklarni ishga tushirish yoki ishlayotgan blokda tahlil yomonlashganda kimyoviy rejimni PTE normalariga qaytarish tartibi.",
    {
      keywords: ["kimyoviy rejimni tiklash", "asosiy kondensat tahlili", "kondensator quvuri zichsizligi", "gidrazin", "fosfat"],
      aliases: ["suv-kimyo rejimi", "kondensat tahlili yomonlashishi", "kondensator trubkasi"],
    },
  ),
  fromPrevious("ппрограмма_восстановления_хим_режима_10_блока", "ппрограмма_восстановления_хим_режима", {
    title: "10-BLOKDA KIMYOVIY REJIMNI TIKLASH ISHLARINI BAJARISH DASTURI",
    summary: "10-blokda kimyoviy rejimni tiklash bo‘yicha armatura, qozon barabani, fosfat va gidrazin liniyalarini tekshirish dasturi.",
    searchMetadata: {
      keywords: ["10-blok kimyoviy rejim", "qozon barabani", "fosfat liniyasi", "gidrazin uzatish", "РНП ko‘rigi"],
      aliases: ["kimyoviy rejim 10-blok", "qozon suv-kimyo rejimi", "fosfat baki"],
    },
    overrides: {
      "block-0023": "КТЦ-1 BOSHLIG‘I MAJLIMOV U.L.",
      "block-0024": "КТЦ-2 BOSHLIG‘I MAXKAMOV M.M.",
      "block-0025": "KIMYO SEXI BOSHLIG‘I XAMRAQULOVA L.P.",
      "block-0026": "ЦЦР BOSHLIG‘I ISABAYEV B.E.",
    },
  }),
  ruSpec(
    "пар-опроб-и-пуск-на-хол-ход-2025",
    "QOZONNI BUG‘ BILAN SINAB KO‘RISH VA KLAPANLARNI SOZLASH BO‘YICHA NAMUNAVIY DASTUR",
    "2-blok o‘rta ta’miridan keyin qozonni bug‘ bilan sinash, klapanlarni sozlash va ishga tayyorlash tartibi.",
    {
      keywords: ["bug‘ sinovi", "qozonni sinab ko‘rish", "klapanlarni sozlash", "bo‘sh yurish", "ta’mirdan keyingi pusk"],
      aliases: ["qozon parovoy oproba", "klapan nastroyka", "blokni ishga tayyorlash"],
    },
  ),
  ruSpec(
    "продувка-паропров-после-рем-2026",
    "BLOK BUG‘ QUVURLARINI TA’MIRDAN KEYIN PUFLASH BO‘YICHA NAMUNAVIY DASTUR",
    "Blok ta’miridan keyin bug‘ quvurlaridan begona jismlarni chiqarish uchun puflash ishlari tartibi.",
    {
      keywords: ["bug‘ quvurlarini puflash", "ta’mirdan keyingi puflash", "qozonni yoqish", "БРОУ", "xavfsizlik tadbirlari"],
      aliases: ["paroprovod puflash", "bug‘ quvuri tozalash", "blok puflash"],
    },
  ),
  fromPrevious("программа_гидравлич_испытание_бл_2026", "гидравлич-испытание-бл-2025", {
    title: "ТГМ-94 QOZON AGREGATINI GIDRAVLIK SINOVDAN O‘TKAZISH BO‘YICHA NAMUNAVIY DASTUR",
    summary: "Bloklar ta’miridan keyin qozon agregati, oraliq qayta qizdirish va quvurlarni zichlikka gidravlik sinash tartibi.",
    overrides: {
      "block-0007": "bloklar ta’miridan keyin",
      "block-0021": ruToUz(sourceBlocks("программа_гидравлич_испытание_бл_2026").find((block) => block.id === "block-0021").text),
      "block-0027": ruToUz(sourceBlocks("программа_гидравлич_испытание_бл_2026").find((block) => block.id === "block-0027").text),
      "block-0028": "Issiqlik-mexanika qismi bo‘yicha texnik direktor o‘rinbosari B.R. Ismoilov",
      "block-0029": "СНТБ boshlig‘i B.B. Nurdinov",
      "block-0030": "ММ va XT bo‘yicha yetakchi inspektor F.M. Mirzaxidova",
      "block-0032": "КТЦ-1 boshlig‘i U.L. Majlimov",
      "block-0033": "КТЦ-2 boshlig‘i M.M. Maxkamov",
      "block-0034": "ЦТКА boshlig‘i R.K. Baymatov",
      "block-0035": "Elektr sexi boshlig‘i M.D. Kenjibayev",
      "block-0036": "Metallar laboratoriyasi boshlig‘i L.U. Eshonqulov",
      "block-0037": "ЦЦР boshlig‘i T.A. Valiyev",
      "block-0038": "«UET» uchastkasi ishlari rahbari Sh.M. Tursunbayev",
      "block-0039": "Elektr uskunalari bo‘yicha texnik direktor o‘rinbosari A.A. Maxmudxo‘jayev",
    },
  }),
  fromPrevious("проверка_плотности_стоп_и_рег_клап_тг_2025", "проверка_плотности_стоп_и_рег_клап_тг_2026", {
    title: "ТГ TO‘XTATISH VA ROSTLASH KLAPANLARI ZICHLIGINI TEKSHIRISH NAMUNAVIY DASTURI",
    summary: "2-blok o‘rta ta’miridan keyin ТГ yuqori va o‘rta bosimli to‘xtatish hamda rostlash klapanlari bug‘ zichligini tekshirish tartibi.",
    overrides: {
      "block-0007": "2-blok o‘rta ta’miridan keyin",
      "block-0008": "Sinovning maqsadi №2 blok o‘rta ta’miridan keyin ТГ yuqori bosim to‘xtatish klapani, yuqori bosim rostlash klapanlari hamda o‘rta bosim to‘xtatish va rostlash klapanlarining zichligini aniqlashdan iborat.",
      "block-0021": "Mas’ul — КТЦ-1 boshlig‘i yoki uning o‘rinbosari.",
      "block-0062": "Klapanlarning bug‘ zichligini aniqlash bo‘yicha 8-sinovga КТЦ-1 boshlig‘i yoki uning o‘rinbosari rahbarlik qiladi.",
      "block-0063": "",
      "block-0064": "Issiqlik-mexanika qismi bo‘yicha texnik direktor o‘rinbosari B.R. Ismoilov СНТБ boshlig‘i B.B. Nurdinov КТЦ-1 boshlig‘i U.L. Majlimov ЦТКА boshlig‘i R.K. Baymatov «UET» uchastkasi ishlari rahbari A. Mamirov «O‘zenergosozlash» yetakchi muhandisi F.F. Umerov",
      "block-0065": "Elektr uskunalari bo‘yicha texnik direktor o‘rinbosari A.A. Maxmudxo‘jayev",
      "block-0066": "",
      "block-0067": "",
    },
  }),
  uzLatnSpec(
    "kн-205-138-2025-лотин-февраль-2025",
    "Инструкция по эксплуатации и описанию системы регулирования паровой турбины типа К-160-130",
    "Нормативный документ по системе регулирования паровой турбины К-160-130, её пуску, обслуживанию, выводу в ремонт и требованиям безопасности.",
    {
      keywords: ["система регулирования турбины", "К-160-130", "регулирующие клапаны", "импеллер", "масляная система", "сервомотор"],
      aliases: ["регулирование паровой турбины", "описание системы регулирования", "эксплуатация К-160-130"],
    },
  ),
];
