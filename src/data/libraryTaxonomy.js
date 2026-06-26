export const libraryGroups = [
  {
    id: "water-chemistry",
    labels: { ru: "Водно-химический режим", uzLatn: "Suv-kimyoviy rejim", uzCyrl: "Сув-кимёвий режим" },
    description: {
      ru: "Химический режим, консервация, очистка и контроль качества воды, пара и реагентов.",
      uzLatn: "Kimyoviy rejim, konservatsiya, tozalash hamda suv, bug‘ va reagentlar sifatini nazorat qilish.",
      uzCyrl: "Кимёвий режим, консервация, тозалаш ҳамда сув, буғ ва реагентлар сифатини назорат қилиш.",
    },
  },
  {
    id: "turbine-equipment",
    labels: { ru: "Турбинное оборудование", uzLatn: "Turbina uskunalari", uzCyrl: "Турбина ускуналари" },
    description: {
      ru: "Эксплуатация, регулирование, защита, маслосистемы и вспомогательные узлы турбин.",
      uzLatn: "Turbinalarni ishlatish, rostlash, himoya, moy tizimlari va yordamchi uzellari.",
      uzCyrl: "Турбиналарни ишлатиш, ростлаш, ҳимоя, мой тизимлари ва ёрдамчи узеллари.",
    },
  },
  {
    id: "boiler-equipment",
    labels: { ru: "Котельное оборудование", uzLatn: "Qozon uskunalari", uzCyrl: "Қозон ускуналари" },
    description: {
      ru: "Котлы ТГМ-94, паропроводы, продувки, опрессовки, клапаны и котельные защиты.",
      uzLatn: "TGM-94 qozonlari, bug‘ quvurlari, puflash, presslash, klapanlar va qozon himoyalari.",
      uzCyrl: "ТГМ-94 қозонлари, буғ қувурлари, пуфлаш, пресслаш, клапанлар ва қозон ҳимоялари.",
    },
  },
  {
    id: "startup-shutdown",
    labels: { ru: "Пуски и остановы", uzLatn: "Ishga tushirish va to‘xtatish", uzCyrl: "Ишга тушириш ва тўхтатиш" },
    description: {
      ru: "Пусковые операции, остановы, холостой ход, вывод оборудования и режимные переходы.",
      uzLatn: "Ishga tushirish operatsiyalari, to‘xtatish, bo‘sh yurish, uskunani chiqarish va rejim o‘tishlari.",
      uzCyrl: "Ишга тушириш операциялари, тўхтатиш, бўш юриш, ускунани чиқариш ва режим ўтишлари.",
    },
  },
  {
    id: "tests-protections",
    labels: { ru: "Испытания и защиты", uzLatn: "Sinovlar va himoyalar", uzCyrl: "Синовлар ва ҳимоялар" },
    description: {
      ru: "Проверки клапанов, защит, автоматики, гидравлические испытания и настройка ИПУ.",
      uzLatn: "Klapanlar, himoyalar, avtomatika tekshiruvlari, gidravlik sinovlar va IPU sozlash.",
      uzCyrl: "Клапанлар, ҳимоялар, автоматика текширувлари, гидравлик синовлар ва ИПУ созлаш.",
    },
  },
  {
    id: "repair-maintenance",
    labels: { ru: "Ремонт и обслуживание", uzLatn: "Ta’mir va xizmat ko‘rsatish", uzCyrl: "Таъмир ва хизмат кўрсатиш" },
    description: {
      ru: "Капитальные и средние ремонты, подготовка рабочих мест, очистка и восстановительные работы.",
      uzLatn: "Kapital va o‘rta ta’mirlar, ish joylarini tayyorlash, tozalash va tiklash ishlari.",
      uzCyrl: "Капитал ва ўрта таъмирлар, иш жойларини тайёрлаш, тозалаш ва тиклаш ишлари.",
    },
  },
  {
    id: "accident-response",
    labels: { ru: "Аварийные действия", uzLatn: "Avariya harakatlari", uzCyrl: "Авария ҳаракатлари" },
    description: {
      ru: "Предупреждение и ликвидация аварий, отказов, опасных отклонений и действий персонала.",
      uzLatn: "Avariyalar, rad etishlar, xavfli og‘ishlar va xodimlar harakatlarining oldini olish hamda bartaraf etish.",
      uzCyrl: "Авариялар, рад этишлар, хавфли оғишлар ва ходимлар ҳаракатларининг олдини олиш ҳамда бартараф этиш.",
    },
  },
  {
    id: "fuel-gas-safety",
    labels: { ru: "Топливо и газ", uzLatn: "Yoqilg‘i va gaz", uzCyrl: "Ёқилғи ва газ" },
    description: {
      ru: "Природный газ, мазут, топливная безопасность, горение и газомазутные режимы котла.",
      uzLatn: "Tabiiy gaz, mazut, yoqilg‘i xavfsizligi, yonish va qozonning gaz-mazut rejimlari.",
      uzCyrl: "Табиий газ, мазут, ёқилғи хавфсизлиги, ёниш ва қозоннинг газ-мазут режимлари.",
    },
  },
];

export const workTypeFilters = [
  {
    id: "operation",
    labels: { ru: "Эксплуатация", uzLatn: "Ekspluatatsiya", uzCyrl: "Эксплуатация" },
  },
  {
    id: "startup-shutdown",
    labels: { ru: "Пуск / останов", uzLatn: "Ishga tushirish / to‘xtatish", uzCyrl: "Ишга тушириш / тўхтатиш" },
  },
  {
    id: "testing",
    labels: { ru: "Испытания", uzLatn: "Sinovlar", uzCyrl: "Синовлар" },
  },
  {
    id: "maintenance",
    labels: { ru: "Ремонт / обслуживание", uzLatn: "Ta’mir / xizmat", uzCyrl: "Таъмир / хизмат" },
  },
  {
    id: "emergency",
    labels: { ru: "Аварийные действия", uzLatn: "Avariya harakatlari", uzCyrl: "Авария ҳаракатлари" },
  },
  {
    id: "safety",
    labels: { ru: "Безопасность", uzLatn: "Xavfsizlik", uzCyrl: "Хавфсизлик" },
  },
];

export function getLocalizedTaxonomyItem(items, id, language) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return null;

  return {
    ...item,
    label: item.labels[language] || item.labels.ru || id,
    description: item.description?.[language] || item.description?.ru || "",
  };
}
