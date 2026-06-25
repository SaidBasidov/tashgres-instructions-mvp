import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");
const translationsRoot = path.join(projectRoot, "src/data/translation/documents");
const reportsRoot = path.join(projectRoot, "reports/translations");
const glossaryPath = path.join(projectRoot, "src/data/translation/technical-glossary.json");
const integrityPath = path.join(projectRoot, "src/data/translation/source-integrity.json");
const languages = ["ru", "uzLatn", "uzCyrl"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function countTextCellsInHtml(html) {
  return (String(html || "").match(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi) || [])
    .filter((cell) => cell.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .length;
}

function hasRealContent(translation) {
  return Boolean(
    translation?.title?.trim()
    && (
      translation?.summary?.trim()
      || translation?.blocks?.some((block) => block.text?.trim())
      || translation?.sections?.some((section) => section.title?.trim())
    ),
  );
}

function translationPath(documentId, language) {
  return path.join(translationsRoot, documentId, `${language}.json`);
}

function readTranslation(document, language) {
  if (document.sourceLanguage === language) {
    return {
      status: "source",
      title: document.title,
      summary: document.summary || document.description || "",
      sections: document.sections,
      blocks: document.translations[language].blocks,
      richContent: document.richContent,
      searchMetadata: document.searchMetadata?.[language] || document.searchMetadata || {},
    };
  }

  const filePath = translationPath(document.id, language);
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

function documentRows() {
  const integrity = readJson(integrityPath);
  return fs.readdirSync(importedRoot)
    .filter((dir) => fs.existsSync(path.join(importedRoot, dir, "document.json")))
    .map((dir) => {
      const document = readJson(path.join(importedRoot, dir, "document.json"));
      const sourceBlocks = document.translations[document.sourceLanguage].blocks;
      const sourceRichPath = path.join(projectRoot, "public", document.richContent.documentPath);
      const sourceRich = fs.existsSync(sourceRichPath) ? readJson(sourceRichPath) : { blocks: [] };
      const statuses = Object.fromEntries(languages.map((language) => {
        const translation = readTranslation(document, language);
        if (!translation) return [language, "pending"];
        return [language, hasRealContent(translation) ? (translation.status || "review_required") : "empty"];
      }));
      const missing = languages.filter((language) => statuses[language] === "pending" || statuses[language] === "empty");
      const suspiciousMarkers = languages.flatMap((language) => {
        const translation = readTranslation(document, language);
        if (!translation?.blocks) return [];
        const markers = translation.blocks
          .filter((block) => /Технический перевод требует проверки|Texnik tarjima talab qilinadi|Кириллча версия|Русская версия/i.test(block.text || ""))
          .slice(0, 5)
          .map((block) => `${language}:${block.id}`);
        return markers;
      });
      const sourceTextCells = sourceRich.blocks.reduce((sum, block) => sum + countTextCellsInHtml(block.html), 0);

      return {
        id: document.id,
        code: document.code,
        title: document.title,
        sourceLanguage: document.sourceLanguage,
        statuses,
        missing,
        sections: document.sections.length,
        blocks: sourceBlocks.length,
        tables: document.statistics?.tables || 0,
        textCells: sourceTextCells,
        images: document.statistics?.images || 0,
        validation: integrity.documents[document.id] ? "OK" : "not_in_integrity",
        imageText: (document.statistics?.images || 0) > 0 ? "possible" : "none",
        manualReview: "yes",
        suspiciousMarkers,
        structuralErrors: missing.length ? "missing language" : "",
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function writeFinalLibraryAudit() {
  const rows = documentRows();
  const pending = rows.filter((row) => row.missing.length);
  const errors = rows.filter((row) => Object.values(row.statuses).includes("error"));
  const empty = rows.filter((row) => Object.values(row.statuses).includes("empty"));
  const damagedTables = rows.filter((row) => row.validation !== "OK");
  const suspicious = rows.filter((row) => row.suspiciousMarkers.length);
  const imageText = rows.filter((row) => row.imageText === "possible");
  const availability = Object.fromEntries(languages.map((language) => [
    language,
    rows.filter((row) => !["pending", "empty", "error"].includes(row.statuses[language])).length,
  ]));
  const fullyTranslated = rows.filter((row) => languages.every((language) => !["pending", "empty", "error"].includes(row.statuses[language]))).length;

  const lines = [
    "# Итоговый аудит библиотеки переводов",
    "",
    "## Статистика доступности",
    "",
    `- Всего импортированных документов: **${rows.length}**`,
    `- Доступно на ru: **${availability.ru}**`,
    `- Доступно на uzLatn: **${availability.uzLatn}**`,
    `- Доступно на uzCyrl: **${availability.uzCyrl}**`,
    `- Полностью доступно на трёх языках: **${fullyTranslated}**`,
    `- Осталось pending: **${pending.length}**`,
    `- Осталось error: **${errors.length}**`,
    `- Требуется ручная проверка: **${rows.length}**`,
    `- Документов с возможным текстом внутри изображений: **${imageText.length}**`,
    "",
    "## Предварительный аудит состояния",
    "",
    "| ID | Код | Название | Исходный язык | Доступные языки | Недостающие языки | Статус | Разделов | Блоков | Таблиц | Изображений | Структурные ошибки |",
    "|---|---|---|---:|---|---|---|---:|---:|---:|---:|---|",
    ...rows.map((row) => {
      const available = languages.filter((language) => !["pending", "empty", "error"].includes(row.statuses[language])).join(", ");
      const missing = row.missing.join(", ") || "—";
      const statuses = languages.map((language) => `${language}: ${row.statuses[language]}`).join("; ");
      return `| ${row.id} | ${row.code} | ${String(row.title || "").replaceAll("|", "\\|")} | ${row.sourceLanguage} | ${available} | ${missing} | ${statuses} | ${row.sections} | ${row.blocks} | ${row.tables} | ${row.images} | ${row.structuralErrors || "—"} |`;
    }),
    "",
    "## Документы",
    "",
    "| ID | Код | Название | Исходный язык | ru | uzLatn | uzCyrl | Разделов | Таблиц | Изображений | Валидация | Текст внутри изображений | Ручная проверка |",
    "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...rows.map((row) => `| ${row.id} | ${row.code} | ${String(row.title || "").replaceAll("|", "\\|")} | ${row.sourceLanguage} | ${row.statuses.ru} | ${row.statuses.uzLatn} | ${row.statuses.uzCyrl} | ${row.sections} | ${row.tables} | ${row.images} | ${row.validation} | ${row.imageText} | ${row.manualReview} |`),
    "",
    "## Документы со статусом error",
    "",
    errors.length ? errors.map((row) => `- ${row.id}`).join("\n") : "- Нет.",
    "",
    "## Документы со статусом pending",
    "",
    pending.length ? pending.map((row) => `- ${row.id}: ${row.missing.join(", ")}`).join("\n") : "- Нет.",
    "",
    "## Документы с пустым содержимым",
    "",
    empty.length ? empty.map((row) => `- ${row.id}`).join("\n") : "- Нет.",
    "",
    "## Документы с повреждёнными таблицами",
    "",
    damagedTables.length ? damagedTables.map((row) => `- ${row.id}: ${row.validation}`).join("\n") : "- Нет по результатам `npm run validate:translations`.",
    "",
    "## Документы с подозрительными переводами",
    "",
    suspicious.length
      ? suspicious.map((row) => `- ${row.id}: ${row.suspiciousMarkers.join(", ")}; требуется ручная техническая вычитка.`).join("\n")
      : "- Нет автоматических маркеров.",
    "",
    "## Документы с непереведённой графикой",
    "",
    imageText.length
      ? imageText.map((row) => `- ${row.id}: ${row.images} изображ.; встроенный текст, если присутствует на графике, не локализован.`).join("\n")
      : "- Нет изображений.",
    "",
    "## Документы, где перевод невозможен без ручной работы",
    "",
    "- Автоматически непереводимых документов не выявлено.",
    "- Все новые версии имеют статус `review_required`, поэтому утверждение невозможно без ручной технической вычитки.",
  ];

  fs.mkdirSync(reportsRoot, { recursive: true });
  fs.writeFileSync(path.join(reportsRoot, "final-library-audit.md"), `${lines.join("\n")}\n`);
}

function writeGlossaryAudit() {
  const glossary = readJson(glossaryPath);
  const terms = glossary.terms || [];
  const byRu = new Map();
  const duplicates = [];
  const conflicts = [];
  const incomplete = [];
  const reviewRequired = [];

  terms.forEach((term, index) => {
    const key = String(term.ru || "").trim().toLowerCase();
    if (!term.ru || !term.uzLatn || !term.uzCyrl || !("notes" in term)) incomplete.push({ index, term });
    if (/review_required|уточнить|требует проверки|сверить/i.test(term.notes || "")) reviewRequired.push(term);
    if (byRu.has(key)) {
      const previous = byRu.get(key);
      duplicates.push(term);
      if (previous.uzLatn !== term.uzLatn || previous.uzCyrl !== term.uzCyrl) conflicts.push({ previous, term });
    } else {
      byRu.set(key, term);
    }
  });

  const lines = [
    "# Аудит технического глоссария",
    "",
    `- Общее количество терминов: **${terms.length}**`,
    `- Количество дублей: **${duplicates.length}**`,
    `- Количество конфликтов: **${conflicts.length}**`,
    `- Неполные пары языков/контекстов: **${incomplete.length}**`,
    `- Термины, требующие проверки: **${reviewRequired.length}**`,
    "",
    "## Дубли",
    "",
    duplicates.length ? duplicates.map((term) => `- ${term.ru}`).join("\n") : "- Не обнаружены.",
    "",
    "## Конфликты",
    "",
    conflicts.length
      ? conflicts.map(({ previous, term }) => `- ${previous.ru}: ${previous.uzLatn}/${previous.uzCyrl} ↔ ${term.uzLatn}/${term.uzCyrl}`).join("\n")
      : "- Не обнаружены.",
    "",
    "## Термины, требующие проверки",
    "",
    reviewRequired.length
      ? reviewRequired.map((term) => `- ${term.ru} — ${term.uzLatn} / ${term.uzCyrl}; ${term.notes}`).join("\n")
      : "- Нет.",
    "",
    "## Предложенные исправления",
    "",
    "- Перед утверждением сверить все термины со статусом/пометкой `review_required` с принятой терминологией станции.",
    "- Проверить написание `xlorid kislota` / `хлорид кислота` для реагента соляной кислоты в химической очистке.",
    "- Проверить использование `razgondan himoya` как станционного термина для защиты от разгона.",
    "- После ручной вычитки убрать пометки неоднозначности только отдельным осознанным изменением.",
  ];

  fs.mkdirSync(reportsRoot, { recursive: true });
  fs.writeFileSync(path.join(reportsRoot, "glossary-audit.md"), `${lines.join("\n")}\n`);
}

writeFinalLibraryAudit();
writeGlossaryAudit();
console.log("Wrote final-library-audit.md and glossary-audit.md");
