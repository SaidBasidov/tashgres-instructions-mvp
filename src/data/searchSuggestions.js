export const searchSuggestions = [
  {
    id: "chemical-regime-recovery",
    groupId: "water-chemistry",
    targetDocumentIds: ["ппрограмма_восстановления_хим_режима"],
    labels: {
      ru: "Как восстановить химический режим блока?",
      uzLatn: "Blokning kimyoviy rejimini qanday tiklash kerak?",
      uzCyrl: "Блокнинг кимёвий режимини қандай тиклаш керак?",
    },
    query: { ru: "восстановление химического режима", uzLatn: "kimyoviy rejimni tiklash", uzCyrl: "кимёвий режимни тиклаш" },
  },
  {
    id: "turbine-emergency-stop",
    groupId: "accident-response",
    targetDocumentIds: ["kн-131-2026-y-к-k-160-130"],
    labels: {
      ru: "Где найти порядок предупреждения и ликвидации аварий на турбине?",
      uzLatn: "Turbina avariyaviy to‘xtaganda nima qilish kerak?",
      uzCyrl: "Турбина авариявий тўхтаганда нима қилиш керак?",
    },
    query: { ru: "предупреждение ликвидация аварий турбине", uzLatn: "avariyaviy to‘xtatish turbina", uzCyrl: "авариявий тўхтатиш турбина" },
  },
  {
    id: "turbine-valve-tightness",
    groupId: "tests-protections",
    targetDocumentIds: ["проверка_плотности_стоп_и_рег_клап_тг_2025", "проверка_плотности_стоп_и_рег_клап_тг_2026"],
    labels: {
      ru: "Как проверить плотность стопорных и регулирующих клапанов ТГ?",
      uzLatn: "TG to‘xtatish va rostlash klapanlari zichligi qanday tekshiriladi?",
      uzCyrl: "ТГ тўхтатиш ва ростлаш клапанлари зичлиги қандай текширилади?",
    },
    query: { ru: "проверка плотности стопорных регулирующих клапанов", uzLatn: "stop rostlash klapanlari zichligi", uzCyrl: "тўхтатиш ростлаш клапанлари зичлиги" },
  },
  {
    id: "boiler-accident-drum-level",
    groupId: "accident-response",
    targetDocumentIds: ["kн-132-2023-лотинча-февраль-2025-doc"],
    labels: {
      ru: "Действия при нарушении уровня воды в барабане котла",
      uzLatn: "Qozon barabanida suv sathi buzilganda harakatlar",
      uzCyrl: "Қозон барабанида сув сатҳи бузилганда ҳаракатлар",
    },
    query: { ru: "барабан котла уровень воды", uzLatn: "qozon barabani suv sathi", uzCyrl: "қозон барабани сув сатҳи" },
  },
  {
    id: "oil-system-cleaning",
    groupId: "turbine-equipment",
    targetDocumentIds: ["очистка-маслосистемы-2025"],
    labels: {
      ru: "Порядок очистки маслосистемы турбоагрегата",
      uzLatn: "Turboagregat moy tizimini tozalash tartibi",
      uzCyrl: "Турбоагрегат мой тизимини тозалаш тартиби",
    },
    query: { ru: "очистка маслосистемы турбоагрегата", uzLatn: "moy tizimini tozalash turboagregat", uzCyrl: "мой тизимини тозалаш турбоагрегат" },
  },
  {
    id: "steam-line-blowing",
    groupId: "boiler-equipment",
    targetDocumentIds: ["продувка-паропров-после-рем-2025", "продувка-паропров-после-рем-2026"],
    labels: {
      ru: "Как выполнить продувку паропроводов после ремонта?",
      uzLatn: "Ta’mirdan keyin bug‘ quvurlarini qanday puflash kerak?",
      uzCyrl: "Таъмирдан кейин буғ қувурларини қандай пуфлаш керак?",
    },
    query: { ru: "продувка паропроводов после ремонта", uzLatn: "bug‘ quvurlarini puflash ta’mirdan keyin", uzCyrl: "буғ қувурларини пуфлаш таъмирдан кейин" },
  },
  {
    id: "boiler-steam-blowing-no1",
    groupId: "boiler-equipment",
    targetDocumentIds: ["программа_паровои-_продувки_котла_no1_новая_уэт_2024", "программа_паровои-_продувки_котла_no1_новая_уэт_2024_образец"],
    labels: {
      ru: "Программа паровой продувки котла №1",
      uzLatn: "№1 qozonni bug‘ bilan puflash dasturi",
      uzCyrl: "№1 қозонни буғ билан пуфлаш дастури",
    },
    query: { ru: "паровая продувка котла №1", uzLatn: "№1 qozon bug‘ bilan puflash", uzCyrl: "№1 қозон буғ билан пуфлаш" },
  },
  {
    id: "ipu-adjustment",
    groupId: "tests-protections",
    targetDocumentIds: ["прог_проведения_настрои-ки_ипу_2026"],
    labels: {
      ru: "Как настроить импульсные предохранительные устройства котла?",
      uzLatn: "Qozon IPU qurilmalari qanday sozlanadi?",
      uzCyrl: "Қозон ИПУ қурилмалари қандай созланади?",
    },
    query: { ru: "настройка ИПУ котла", uzLatn: "IPU qozon sozlash", uzCyrl: "ИПУ қозон созлаш" },
  },
  {
    id: "boiler-steam-test-idle",
    groupId: "startup-shutdown",
    targetDocumentIds: ["пар-опроб-и-пуск-на-хол-ход-2025"],
    labels: {
      ru: "Паровое опробование котла и пуск на холостой ход",
      uzLatn: "Qozonni bug‘ bilan sinash va bo‘sh yurishga ishga tushirish",
      uzCyrl: "Қозонни буғ билан синаш ва бўш юришга ишга тушириш",
    },
    query: { ru: "паровое опробование пуск на холостой ход", uzLatn: "bug‘ bilan sinab ko‘rish bo‘sh yurish", uzCyrl: "буғ билан синаб кўриш бўш юриш" },
  },
  {
    id: "boiler-hydraulic-test",
    groupId: "tests-protections",
    targetDocumentIds: ["гидравлич-испытание-бл-2025", "программа_гидравлич_испытание_бл_2026"],
    labels: {
      ru: "Подготовка котла ТГМ-94 к гидравлическому испытанию",
      uzLatn: "TGM-94 qozonini gidravlik sinovga tayyorlash",
      uzCyrl: "ТГМ-94 қозонини гидравлик синовга тайёрлаш",
    },
    query: { ru: "гидравлическое испытание котлоагрегата ТГМ-94", uzLatn: "gidravlik sinov TGM-94 qozon", uzCyrl: "гидравлик синов ТГМ-94 қозон" },
  },
  {
    id: "sar-steam-parameters",
    groupId: "turbine-equipment",
    targetDocumentIds: ["перевод-сар-2026", "kн-205-138-2025-лотин-февраль-2025"],
    labels: {
      ru: "Перевод САР турбин на номинальные параметры пара",
      uzLatn: "Turbina SAR tizimini bug‘ning nominal parametrlariga o‘tkazish",
      uzCyrl: "Турбина САР тизимини буғнинг номинал параметрларига ўтказиш",
    },
    query: { ru: "САР номинальные параметры пара", uzLatn: "SAR bug‘ning nominal parametrlari", uzCyrl: "САР буғнинг номинал параметрлари" },
  },
  {
    id: "safety-valves-ipu-hpp",
    groupId: "tests-protections",
    targetDocumentIds: ["проверка_работоспособности_пр_кл_ипу_2-хпп_2026"],
    labels: {
      ru: "Проверка работоспособности предохранительных клапанов ИПУ-2 и ХПП",
      uzLatn: "IPU-2 va XPP xavfsizlik klapanlari ishga yaroqliligini tekshirish",
      uzCyrl: "ИПУ-2 ва ХПП хавфсизлик клапанлари ишга яроқлилигини текшириш",
    },
    query: { ru: "предохранительные клапаны ИПУ-2 ХПП", uzLatn: "IPU-2 XPP xavfsizlik klapanlari", uzCyrl: "ИПУ-2 ХПП хавфсизлик клапанлари" },
  },
  {
    id: "overspeed-protection",
    groupId: "tests-protections",
    targetDocumentIds: ["опроб-защиты-от-разгона-2025", "опроб-защиты-от-разгона-2026"],
    labels: {
      ru: "Как опробовать защиту турбогенератора от разгона?",
      uzLatn: "Turbogeneratorning razgondan himoyasi qanday sinaladi?",
      uzCyrl: "Турбогенераторнинг разгондан ҳимояси қандай синалади?",
    },
    query: { ru: "защита турбогенератора от разгона", uzLatn: "turbogenerator razgondan himoya", uzCyrl: "турбогенератор разгондан ҳимоя" },
  },
  {
    id: "boiler-vacuum-drying",
    groupId: "water-chemistry",
    targetDocumentIds: ["вакуумная_сушка_поверхн_нагрева_и_п_п_котла"],
    labels: {
      ru: "Консервация котла методом вакуумной сушки",
      uzLatn: "Qozonni vakuumli quritish usuli bilan konservatsiya qilish",
      uzCyrl: "Қозонни вакуумли қуритиш усули билан консервация қилиш",
    },
    query: { ru: "вакуумная сушка поверхностей нагрева котла", uzLatn: "vakuumli quritish qozon", uzCyrl: "вакуумли қуритиш қозон" },
  },
  {
    id: "fuel-gas-mazut-safety",
    groupId: "fuel-gas-safety",
    targetDocumentIds: ["kн-205-140-2025-лотин-февраль-2025"],
    labels: {
      ru: "Требования безопасности при работе на газе и мазуте",
      uzLatn: "Gaz va mazutda ishlaganda xavfsizlik talablari",
      uzCyrl: "Газ ва мазутда ишлаганда хавфсизлик талаблари",
    },
    query: { ru: "природный газ мазут безопасность", uzLatn: "tabiiy gaz mazut xavfsizlik", uzCyrl: "табиий газ мазут хавфсизлик" },
  },
  {
    id: "repair-output-block",
    groupId: "repair-maintenance",
    targetDocumentIds: ["вывод-бл-в-кап-и-ср-рем-2026"],
    labels: {
      ru: "Порядок вывода энергоблока в капитальный или средний ремонт",
      uzLatn: "Energiya blokini kapital yoki o‘rta ta’mirga chiqarish tartibi",
      uzCyrl: "Энергия блокини капитал ёки ўрта таъмирга чиқариш тартиби",
    },
    query: { ru: "вывод энергоблока капитальный средний ремонт", uzLatn: "energiya blokini kapital o‘rta ta’mir", uzCyrl: "энергия блокини капитал ўрта таъмир" },
  },
  {
    id: "hot-start-turbine",
    groupId: "startup-shutdown",
    targetDocumentIds: ["программа_пуск_турб_из_холодн_сост"],
    labels: {
      ru: "Пуск турбины из горячего состояния через блок клапана ГПП",
      uzLatn: "Turbinani issiq holatdan GPP klapan bloki orqali ishga tushirish",
      uzCyrl: "Турбинани иссиқ ҳолатдан ГПП клапан блоки орқали ишга тушириш",
    },
    query: { ru: "пуск турбины горячее состояние ГПП", uzLatn: "turbinani issiq holatdan GPP", uzCyrl: "турбинани иссиқ ҳолатдан ГПП" },
  },
  {
    id: "primary-tract-pressure-test",
    groupId: "tests-protections",
    targetDocumentIds: ["пров-опрес-первичн-тракта-2026"],
    labels: {
      ru: "Опрессовка первичного тракта котла на рабочее давление",
      uzLatn: "Qozon birlamchi traktini ish bosimiga presslash",
      uzCyrl: "Қозон бирламчи трактини иш босимига пресслаш",
    },
    query: { ru: "опрессовка первичного тракта котлоагрегата", uzLatn: "birlamchi trakt presslash", uzCyrl: "бирламчи тракт пресслаш" },
  },
  {
    id: "unit-8-idle-shutdown",
    groupId: "startup-shutdown",
    targetDocumentIds: ["останов_турбиннои-_установки_no8_в_режим_холост_ход"],
    labels: {
      ru: "Останов турбинной установки №8 в режим холостого хода",
      uzLatn: "№8 turbina qurilmasini bo‘sh yurish rejimiga to‘xtatish",
      uzCyrl: "№8 турбина қурилмасини бўш юриш режимига тўхтатиш",
    },
    query: { ru: "останов турбинной установки №8 холостой ход", uzLatn: "№8 turbina bo‘sh yurish", uzCyrl: "№8 турбина бўш юриш" },
  },
  {
    id: "turbine-control-system",
    groupId: "turbine-equipment",
    targetDocumentIds: ["kн-205-138-2025-лотин-февраль-2025"],
    labels: {
      ru: "Где описана система регулирования турбины К-160-130?",
      uzLatn: "K-160-130 turbinaning rostlash tizimi qayerda tavsiflangan?",
      uzCyrl: "К-160-130 турбинанинг ростлаш тизими қаерда тавсифланган?",
    },
    query: { ru: "система регулирования К-160-130", uzLatn: "K-160-130 rostlash tizimi", uzCyrl: "К-160-130 ростлаш тизими" },
  },
  {
    id: "turbine-boiler-block-operation",
    groupId: "turbine-equipment",
    targetDocumentIds: ["кн-143-2026-и-лотин"],
    labels: {
      ru: "Эксплуатация турбины К-160-130 с котлом ТГМ-94",
      uzLatn: "TGM-94 qozoni bilan K-160-130 turbinani ishlatish",
      uzCyrl: "ТГМ-94 қозони билан К-160-130 турбинани ишлатиш",
    },
    query: { ru: "К-160-130 ТГМ-94 эксплуатация", uzLatn: "K-160-130 TGM-94 ishlatish", uzCyrl: "К-160-130 ТГМ-94 ишлатиш" },
  },
  {
    id: "idle-run-safety-automaton",
    groupId: "startup-shutdown",
    targetDocumentIds: ["пуск_на_холостои-_ход_и_пров_авт_безопасн_2026"],
    labels: {
      ru: "Пуск на холостой ход и проверка автомата безопасности",
      uzLatn: "Bo‘sh yurishga ishga tushirish va xavfsizlik avtomatini tekshirish",
      uzCyrl: "Бўш юришга ишга тушириш ва хавфсизлик автомати текшириш",
    },
    query: { ru: "пуск на холостой ход автомат безопасности", uzLatn: "bo‘sh yurish xavfsizlik avtomati", uzCyrl: "бўш юриш хавфсизлик автомати" },
  },
  {
    id: "chemical-cleaning-screen-tubes",
    groupId: "water-chemistry",
    targetDocumentIds: ["хим_очистка_экран_труб_котла_солян_кислотои-_2026"],
    labels: {
      ru: "Химическая очистка экранных труб котла соляной кислотой",
      uzLatn: "Qozon ekran quvurlarini xlorid kislota bilan kimyoviy tozalash",
      uzCyrl: "Қозон экран қувурларини хлорид кислота билан кимёвий тозалаш",
    },
    query: { ru: "химическая очистка экранных труб соляной кислотой", uzLatn: "ekran quvurlari xlorid kislota kimyoviy tozalash", uzCyrl: "экран қувурлари хлорид кислота кимёвий тозалаш" },
  },
];

export function getSearchSuggestions(language, offset = 0, limit = 6) {
  const localized = searchSuggestions.map((suggestion) => ({
    ...suggestion,
    label: suggestion.labels[language] || suggestion.labels.ru,
    searchQuery: suggestion.query[language] || suggestion.query.ru,
  }));

  return Array.from({ length: Math.min(limit, localized.length) }, (_, index) => (
    localized[(offset + index) % localized.length]
  ));
}
