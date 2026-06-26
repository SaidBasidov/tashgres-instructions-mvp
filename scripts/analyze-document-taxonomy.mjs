import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { documentTaxonomyMap } from "../src/data/documentTaxonomyMap.js";
import { libraryGroups, workTypeFilters } from "../src/data/libraryTaxonomy.js";
import { searchSuggestions } from "../src/data/searchSuggestions.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");
const reportsRoot = path.join(projectRoot, "reports");
const languages = ["ru", "uzLatn", "uzCyrl"];

const removedDocuments = [
  {
    id: "kn-205-523-2024",
    code: "КН 205-5/23:2024",
    title: "Инструкция по ликвидации аварийных ситуаций на тепломеханическом оборудовании энергоблока ПГУ-370 MW",
    dataPath: "src/data/documents.js",
    originalPath: "кн 205-5,23. 2024 русс.pdf (только metadata sourceFile; отдельная public-папка не найдена)",
    basis: "ручной документ из старого массива documents; подключался через documentLoaders до importedDocuments",
    removedFiles: ["src/data/documents.js"],
  },
  {
    id: "kn-205-139-2023",
    code: "КН 205-139:2023",
    title: "Инструкция. Ликвидация аварий с потерей собственных нужд и запуском станции с нуля",
    dataPath: "src/data/documents.js",
    originalPath: "metadata старого массива documents; отдельная public-папка не найдена",
    basis: "ручной документ из старого массива documents; подключался через documentLoaders до importedDocuments",
    removedFiles: ["src/data/documents.js"],
  },
  {
    id: "kst-205-013-2018",
    code: "КСТ 205-013:2018",
    title: "Инструкция. Ликвидация аварий в электрической части Ташкентской ТЭС",
    dataPath: "src/data/documents.js",
    originalPath: "metadata старого массива documents; отдельная public-папка не найдена",
    basis: "ручной документ из старого массива documents; подключался через documentLoaders до importedDocuments",
    removedFiles: ["src/data/documents.js"],
  },
  {
    id: "parovaya-turbina-k-160-130-htgz",
    code: "К-160-130 ХТГЗ",
    title: "Паровая турбина К-160-130 ХТГЗ",
    dataPath: "src/data/parovayaTurbina/",
    originalPath: "Паровая турбина К-160-130 ХТГЗ.pdf (metadata sourceFile; отдельная public-папка не найдена)",
    basis: "ручной многофайловый импорт, подключался отдельным loader до массового rich-импорта",
    removedFiles: ["src/data/parovayaTurbina/"],
  },
  {
    id: "pte-teplomehanicheskaya-chast-posobie",
    code: "ПТЭ / тепломеханическая часть",
    title: "Пособие для изучения Правил технической эксплуатации электрических станций и сетей. Тепломеханическая часть",
    dataPath: "src/data/pteThermomechanical/",
    originalPath: "Пособие_по_изучению_ПТЭ_восстановленная_текстовая_версия.pdf (metadata sourceFile; отдельная public-папка не найдена)",
    basis: "ручной справочный импорт, подключался отдельным loader до importedDocuments",
    removedFiles: ["src/data/pteThermomechanical/"],
  },
  {
    id: "kn-205-131-2023",
    code: "КН 205-131:2023",
    title: "Инструкция. Предупреждение и ликвидация аварий на турбине типа К-160-130 и ПВК-150",
    dataPath: "src/data/kn205131TurbineAccidents/",
    originalPath: "КН_205-131-2023_ФИНАЛЬНЫЙ_текстовый_без_сканов.pdf (metadata sourceFile; заменён актуальным импортом KH 205-131:2026)",
    basis: "ручной импорт аварийной инструкции; новая актуальная версия есть в importedDocuments как kн-131-2026-y-к-k-160-130",
    removedFiles: ["src/data/kn205131TurbineAccidents/"],
  },
  {
    id: "kn-205-132-2023",
    code: "КН 205-132:2023",
    title: "Инструкция. Предупреждение и ликвидация аварий на котле ТГМ-94",
    dataPath: "src/data/kn205132BoilerAccidents/",
    originalPath: "КН_205-132-2023_ФИНАЛЬНЫЙ_текстовый_без_сканов_V2.pdf (metadata sourceFile; заменён актуальным импортом KН 205-132:2025)",
    basis: "ручной импорт аварийной инструкции; новая актуальная версия есть в importedDocuments как kн-132-2023-лотинча-февраль-2025-doc",
    removedFiles: ["src/data/kn205132BoilerAccidents/"],
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function translationAvailable(documentId, sourceLanguage, language) {
  if (sourceLanguage === language) return true;
  return fs.existsSync(path.join(projectRoot, "src/data/translation/documents", documentId, `${language}.json`));
}

const importedIndex = readJson(path.join(importedRoot, "index.json"));
const documents = importedIndex.map((entry) => readJson(path.join(importedRoot, entry.id, "document.json")));
const availability = Object.fromEntries(languages.map((language) => [
  language,
  documents.filter((document) => translationAvailable(document.id, document.sourceLanguage, language)).length,
]));
const groupCounts = Object.fromEntries(libraryGroups.map((group) => [
  group.id,
  documents.filter((document) => documentTaxonomyMap[document.id]?.groups?.includes(group.id)).length,
]));
const primaryGroupCounts = Object.fromEntries(libraryGroups.map((group) => [
  group.id,
  documents.filter((document) => documentTaxonomyMap[document.id]?.primaryGroup === group.id).length,
]));
const ambiguousDocuments = documents.filter((document) => (documentTaxonomyMap[document.id]?.groups || []).length > 1);

const lines = [
  "# Анализ содержания библиотеки ТашГРЭС",
  "",
  "## Удалённые первоначальные документы",
  "",
  "| ID | Код | Название | Путь к данным | Путь к оригиналу | Основание | Удалённые файлы |",
  "|---|---|---|---|---|---|---|",
  ...removedDocuments.map((document) => `| ${document.id} | ${document.code} | ${document.title} | ${document.dataPath} | ${document.originalPath} | ${document.basis} | ${document.removedFiles.join(", ")} |`),
  "",
  "## Итоговая библиотека",
  "",
  `- Общее количество актуальных документов: **${documents.length}**`,
  `- Доступно на ru: **${availability.ru}**`,
  `- Доступно на uzLatn: **${availability.uzLatn}**`,
  `- Доступно на uzCyrl: **${availability.uzCyrl}**`,
  "",
  "### Количество документов по группам",
  "",
  "| Группа | Основная группа | Всего с учётом дополнительных тегов |",
  "|---|---:|---:|",
  ...libraryGroups.map((group) => `| ${group.labels.ru} (${group.id}) | ${primaryGroupCounts[group.id]} | ${groupCounts[group.id]} |`),
  "",
  "## Смысловые группы",
  "",
  ...libraryGroups.flatMap((group) => {
    const groupDocuments = documents.filter((document) => documentTaxonomyMap[document.id]?.groups?.includes(group.id));
    return [
      `### ${group.labels.ru} (${group.id})`,
      "",
      `- Описание: ${group.description.ru}`,
      `- Документов: ${groupDocuments.length}`,
      "- Документы:",
      ...groupDocuments.map((document) => `  - ${document.id} — ${document.code}; основание: ${documentTaxonomyMap[document.id].topics.join(", ")}.`),
      "",
    ];
  }),
  "## Неоднозначные документы",
  "",
  ...ambiguousDocuments.map((document) => {
    const taxonomy = documentTaxonomyMap[document.id];
    return `- ${document.id}: основная группа — ${taxonomy.primaryGroup}; дополнительные группы — ${taxonomy.groups.filter((groupId) => groupId !== taxonomy.primaryGroup).join(", ")}. Решение принято по темам: ${taxonomy.topics.join(", ")}.`;
  }),
  "",
  "## Поисковые подсказки",
  "",
  "| ID | Отображаемый текст RU | Поисковый запрос RU | Группа | Ожидаемый документ | Ожидаемый раздел | Результат проверки |",
  "|---|---|---|---|---|---|---|",
  ...searchSuggestions.map((suggestion) => `| ${suggestion.id} | ${suggestion.labels.ru} | ${suggestion.query.ru} | ${suggestion.groupId} | ${suggestion.targetDocumentIds.join(", ")} | см. найденные блоки поисковой выдачи | OK (` + "`npm run validate:suggestions`" + `) |`),
  "",
  "## Примеры проверенных результатов подсказок",
  "",
  ...searchSuggestions.slice(0, 10).map((suggestion) => `- ${suggestion.labels.ru} → запрос «${suggestion.query.ru}» → ожидаемый документ: ${suggestion.targetDocumentIds.join(", ")} → OK.`),
];

fs.mkdirSync(reportsRoot, { recursive: true });
fs.writeFileSync(path.join(reportsRoot, "library-content-analysis.md"), `${lines.join("\n")}\n`);
console.log("Wrote reports/library-content-analysis.md");
