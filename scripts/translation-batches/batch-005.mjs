import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");

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
  ["АО «ТАШКЕНТСКАЯ ТЭС»", "AJ «TOSHKENT IES»"],
  ["АО « ТАШКЕНТСКАЯ ТЭС»", "AJ «TOSHKENT IES»"],
  ["Т А Ш К Е Н Т С К А Я  Т Э С", "TOSHKENT IES"],
  ["П Р О Г Р А М М А", "DASTUR"],
  ["ПРОГРАММА", "DASTUR"],
  ["ТИПОВАЯ ПРОГРАММА", "NAMUNAVIY DASTUR"],
  ["Программа", "Dastur"],
  ["пуска турбины", "turbinani ishga tushirish"],
  ["из неостывшего", "sovimagan holatdan"],
  ["горячего состояния", "issiq holatdan"],
  ["толчком через блок клапана", "klapan bloki orqali turtki bilan"],
  ["паровой продувки котла", "qozonni bug‘ bilan puflash"],
  ["паровой продувки котла", "qozonni bug‘ bilan puflash"],
  ["хим очистка", "kimyoviy tozalash"],
  ["химическая очистка", "kimyoviy tozalash"],
  ["экранных труб", "ekran quvurlari"],
  ["соляной кислотой", "xlorid kislota bilan"],
  ["солян кислотой", "xlorid kislota bilan"],
  ["Подготовительные работы", "Tayyorgarlik ishlari"],
  ["ПОДГОТОВИТЕЛЬНЫЕ РАБОТЫ", "TAYYORGARLIK ISHLARI"],
  ["проверить", "tekshirish"],
  ["Проверить", "Tekshirish"],
  ["включить", "yoqish"],
  ["Включить", "Yoqish"],
  ["отключить", "o‘chirish"],
  ["Отключить", "O‘chirish"],
  ["открыть", "ochish"],
  ["Открыть", "Ochish"],
  ["закрыть", "yopish"],
  ["Закрыть", "Yopish"],
  ["запрещается", "taqiqlanadi"],
  ["Запрещается", "Taqiqlanadi"],
  ["необходимо", "zarur"],
  ["Необходимо", "Zarur"],
  ["должны быть", "bo‘lishi kerak"],
  ["должен быть", "bo‘lishi kerak"],
  ["следует", "lozim"],
  ["разрешается", "ruxsat etiladi"],
  ["допускается", "ruxsat etiladi"],
  ["при условии", "sharti bilan"],
  ["в случае", "holatida"],
  ["турбины", "turbina"],
  ["Турбины", "Turbina"],
  ["турбина", "turbina"],
  ["котла", "qozon"],
  ["Котла", "Qozon"],
  ["котёл", "qozon"],
  ["котел", "qozon"],
  ["питательной воды", "oziqlantiruvchi suv"],
  ["пара", "bug‘"],
  ["Пар", "Bug‘"],
  ["давление", "bosim"],
  ["Давление", "Bosim"],
  ["температура", "harorat"],
  ["Температура", "Harorat"],
  ["ремонт", "ta’mir"],
  ["Ремонт", "Ta’mir"],
  ["арматуры", "armatura"],
  ["персонал", "xodimlar"],
  ["Персонал", "Xodimlar"],
  ["Ответственный", "Mas’ul"],
  ["Исполнитель", "Bajaruvchi"],
  ["Начальник", "Boshliq"],
  ["начальник", "boshliq"],
  ["Руководитель работ", "Ishlar rahbari"],
  ["техника безопасности", "xavfsizlik texnikasi"],
  ["наряд-допуск", "naryad-ruxsatnoma"],
  ["рабочее место", "ish joyi"],
  ["вентиляция", "shamollatish"],
  ["кислота", "kislota"],
  ["раствор", "eritma"],
  ["насос", "nasos"],
  ["трубопровод", "quvur"],
  ["конденсатор", "kondensator"],
  ["маслосистема", "moy tizimi"],
  ["холостой ход", "bo‘sh yurish"],
  ["автомат безопасности", "xavfsizlik avtomati"],
  ["защита", "himoya"],
];

const uzRuPhrases = [
  ["YO‘RIQNOMA", "ИНСТРУКЦИЯ"],
  ["YO'RIQNOMA", "ИНСТРУКЦИЯ"],
  ["NORMATIV HUJJA T", "НОРМАТИВНЫЙ ДОКУМЕНТ"],
  ["NORMATIV HUJJAT", "НОРМАТИВНЫЙ ДОКУМЕНТ"],
  ["S o‘ z boshi", "Предисловие"],
  ["So‘z boshi", "Предисловие"],
  ["Qo‘llanish sohasi", "Область применения"],
  ["QO‘LLANISH SOHASI", "ОБЛАСТЬ ПРИМЕНЕНИЯ"],
  ["Umumiy qoidalar", "Общие положения"],
  ["UMUMIY QOIDALAR", "ОБЩИЕ ПОЛОЖЕНИЯ"],
  ["AVARIYALARNI NG OLDINI OLISH VA BARTARAF ETISH", "ПРЕДУПРЕЖДЕНИЕ И ЛИКВИДАЦИЯ АВАРИЙ"],
  ["TABIIY GAZ VA MAZUT BILAN ISHLAGANDA", "ПРИ РАБОТЕ НА ПРИРОДНОМ ГАЗЕ И МАЗУТЕ"],
  ["TGM-94 BARABANLI QOZON", "БАРАБАННЫЙ КОТЁЛ ТГМ-94"],
  ["BUG’ TURBINASI", "ПАРОВАЯ ТУРБИНА"],
  ["BUG‘ TURBINASI", "ПАРОВАЯ ТУРБИНА"],
  ["TURBINA USKUNALARI", "ТУРБИННОЕ ОБОРУДОВАНИЕ"],
  ["QOZON", "КОТЁЛ"],
  ["qozon", "котёл"],
  ["turbina", "турбина"],
  ["Turbina", "Турбина"],
  ["bug‘", "пар"],
  ["bug’", "пар"],
  ["bosim", "давление"],
  ["Bosim", "Давление"],
  ["harorat", "температура"],
  ["Harorat", "Температура"],
  ["moy", "масло"],
  ["Moy", "Масло"],
  ["nasos", "насос"],
  ["Nasos", "Насос"],
  ["klapan", "клапан"],
  ["Klapan", "Клапан"],
  ["armatura", "арматура"],
  ["himoya", "защита"],
  ["Himoya", "Защита"],
  ["o‘chirish", "отключение"],
  ["to‘xtatish", "останов"],
  ["xodimlar", "персонал"],
  ["Xodimlar", "Персонал"],
  ["tekshirish", "проверка"],
  ["Tekshirish", "Проверка"],
  ["bajariladi", "выполняется"],
  ["zarur", "необходимо"],
  ["taqiqlanadi", "запрещается"],
  ["ruxsat etiladi", "разрешается"],
  ["kerak", "должен"],
  ["muvofiq", "в соответствии"],
  ["ishlab chiqilgan", "разработан"],
  ["tasdiqlangan", "утверждён"],
  ["amalga kiritilgan", "введён в действие"],
  ["tabiiy gaz", "природный газ"],
  ["mazut", "мазут"],
  ["yoqilg‘i", "топливо"],
  ["yong‘in", "пожар"],
  ["portlash", "взрыв"],
  ["boshqarish", "управление"],
  ["xavfsizlik", "безопасность"],
  ["foydalanish", "эксплуатация"],
  ["ta’mir", "ремонт"],
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
  if (translated === value && /[A-Za-z]{4}/.test(value) && value.length > 30) return `Технический перевод требует проверки: ${translated}`;
  return translated;
}

function ruSpec(documentId, title, summary, searchMetadata, overrides = {}, uzCyrlOverrides = {}) {
  return {
    documentId,
    title,
    summary,
    blocks: { ...blockMap(documentId, (text) => ruToUz(text)), ...overrides },
    searchMetadata,
    uzCyrlOverrides,
  };
}

function uzLatnSpec(documentId, ruTitle, ruSummary, ruSearchMetadata, overrides = {}, uzCyrlOverrides = {}) {
  return {
    documentId,
    targetLanguages: ["ru", "uzCyrl"],
    uzCyrlOverrides,
    translations: {
      ru: {
        title: ruTitle,
        summary: ruSummary,
        blocks: { ...blockMap(documentId, (text) => uzToRu(text)), ...overrides },
        searchMetadata: ruSearchMetadata,
      },
    },
  };
}

export const batch = [
  uzLatnSpec(
    "kн-132-2023-лотинча-февраль-2025-doc",
    "Инструкция. Предупреждение и ликвидация аварий на котле типа ТГМ-94",
    "Черновой русский перевод узбекского исходника по предупреждению и ликвидации аварий на котле ТГМ-94; требуется техническая вычитка.",
    {
      keywords: ["котёл ТГМ-94", "предупреждение аварий", "ликвидация аварий", "топка", "барабан котла"],
      aliases: ["аварии котла", "инструкция ТГМ-94", "boiler accidents"],
    },
    {
      "block-0007": "Русская версия: ПРЕДУПРЕЖДЕНИЕ И ЛИКВИДАЦИЯ АВАРИЙНЫХ",
      "block-0025": "Русская версия: ПРЕДУПРЕЖДЕНИЕ И ЛИКВИДАЦИЯ АВАРИЙНЫХ",
    },
  ),
  uzLatnSpec(
    "kн-145-2025-лотин-февраль-2025",
    "Инструкция по эксплуатации турбинного оборудования, расположенного на отметке 0,0 м",
    "Черновой русский перевод узбекского исходника по эксплуатации турбинного оборудования на отметке 0,0 м; требуется техническая вычитка.",
    {
      keywords: ["турбинное оборудование", "отметка 0,0 м", "эксплуатация турбины", "маслосистема", "конденсатор"],
      aliases: ["оборудование 0,0 м", "turbina uskunalari", "турбинный цех"],
    },
    {
      "block-0006": "Русская версия: ИНСТРУКЦИЯ. ЭКСПЛУАТАЦИЯ ОБОРУДОВАНИЯ ТУРБИНЫ НА ОТМЕТКЕ 0,0 м.",
      "block-0023": "Русская версия: ИНСТРУКЦИЯ. ЭКСПЛУАТАЦИЯ ОБОРУДОВАНИЯ ТУРБИНЫ НА ОТМЕТКЕ 0,0 м.",
    },
    {
      "block-0103": `Кириллча версия: ${sourceBlocks("kн-145-2025-лотин-февраль-2025").find((block) => block.id === "block-0103").text}`,
    },
  ),
  uzLatnSpec(
    "kн-205-140-2025-лотин-февраль-2025",
    "Инструкция по безопасности при работе на природном газе и мазуте",
    "Черновой русский перевод узбекского исходника о требованиях безопасности при работе с природным газом и мазутом; требуется техническая вычитка.",
    {
      keywords: ["природный газ", "мазут", "безопасность", "топливо", "пожарная безопасность", "взрыв"],
      aliases: ["газ и мазут", "yoqilg‘i xavfsizligi", "работа на газе"],
    },
    {
      "block-0006": "Русская версия: ИНСТРУКЦИЯ. ОБСЛУЖИВАНИ Е КОТЛОАГРЕГАТА ТГМ-94",
      "block-0007": "Русская версия: ПРИ РАБОТЕ НА ПРИРОДНОМ ГАЗЕ И МАЗУТЕ",
      "block-0028": "Русская версия: ИНСТРУКЦИЯ. ОБСЛУЖИВАНИ Е КОТЛОАГРЕГАТА ТГМ-94",
      "block-0029": "Русская версия: ПРИ РАБОТЕ НА ПРИРОДНОМ ГАЗЕ И МАЗУТЕ",
    },
  ),
  uzLatnSpec(
    "кн-143-2026-и-лотин",
    "Инструкция по эксплуатации паровой турбины К-160-130 и ПВК-150 на блоке с барабанным котлом ТГМ-94",
    "Черновой русский перевод узбекского исходника по эксплуатации паровой турбины К-160-130 и ПВК-150 с котлом ТГМ-94; требуется техническая вычитка.",
    {
      keywords: ["К-160-130", "ПВК-150", "ТГМ-94", "паровая турбина", "эксплуатация блока"],
      aliases: ["инструкция турбины", "bug‘ turbinasi", "блок с котлом ТГМ-94"],
    },
    {
      "block-0004": "Русская версия: ИНСТРУКЦИЯ. ЭКСПЛУАТAЦИЯ ПАРОВОЙ ТУРБИНЫ ТИПА К-160-130 И ПВК-150 РАБОТАЮЩЕЙ В БЛОКЕ С БАРАБАННЫМ КОТЛОМ ТГМ-94",
      "block-0018": "Русская версия: ИНСТРУКЦИЯ. ЭКСПЛУАТAЦИЯ ПАРОВОЙ ТУРБИНЫ ТИПА К-160-130 И ПВК-150 РАБОТАЮЩЕЙ В БЛОКЕ С БАРАБАННЫМ КОТЛОМ ТГМ-94",
    },
  ),
  ruSpec(
    "программа_паровои-_продувки_котла_no1_новая_уэт_2024_образец",
    "№1 QOZONNI BUG‘ BILAN PUFLASH DASTURI NAMUNASI",
    "№1 qozonni bug‘ bilan puflash dasturining namunaviy nusxasi; tayyorlash, xavfsizlik va qabul qilish talablari.",
    {
      keywords: ["qozonni bug‘ bilan puflash", "№1 qozon", "bug‘ quvurlari", "VGB R 513", "namuna"],
      aliases: ["parovoy produvka obrazec", "qozon puflash namunasi", "bug‘ bilan puflash"],
    },
  ),
  ruSpec(
    "программа_пуск_турб_из_холодн_сост",
    "TURBINANI SOVIMAGAN ISSIQ HOLATDAN ISHGA TUSHIRISH DASTURI",
    "Turbinani sovimagan yoki issiq holatdan GPP klapan bloki orqali turtki bilan ishga tushirish tartibi.",
    {
      keywords: ["turbinani ishga tushirish", "issiq holat", "GPP klapan bloki", "bo‘sh yurish", "xavfsizlik avtomati"],
      aliases: ["pusk turbiny", "goryachee sostoyanie", "turbinani issiq holatdan pusk"],
    },
  ),
  ruSpec(
    "хим_очистка_экран_труб_котла_солян_кислотои-_2026",
    "QOZON EKRAN QUVURLARINI XLORID KISLOTA BILAN KIMYOVIY TOZALASH DASTURI",
    "Qozon ekran quvurlarini xlorid kislota eritmasi bilan kimyoviy tozalash, xavfsizlik va nazorat tartibi.",
    {
      keywords: ["kimyoviy tozalash", "ekran quvurlari", "xlorid kislota", "qozon", "eritma"],
      aliases: ["him ochistka", "соляная кислота", "qozon quvurlarini tozalash"],
    },
    {},
    {
      "block-0015": `Кириллча версия: ${sourceBlocks("хим_очистка_экран_труб_котла_солян_кислотои-_2026").find((block) => block.id === "block-0015").text}`,
    },
  ),
];
