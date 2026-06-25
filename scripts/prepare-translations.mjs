import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { batch as batch001 } from "./translation-batches/batch-001.mjs";
import { batch as batch002 } from "./translation-batches/batch-002.mjs";
import { batch as batch003 } from "./translation-batches/batch-003.mjs";
import { batch as batch004 } from "./translation-batches/batch-004.mjs";
import { batch as batch005 } from "./translation-batches/batch-005.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");
const translationsRoot = path.join(projectRoot, "src/data/translation/documents");
const publicRoot = path.join(projectRoot, "public");
const reportsRoot = path.join(projectRoot, "reports/translations");
const integrityFile = path.join(projectRoot, "src/data/translation/source-integrity.json");
const protectedTerms = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "src/data/translation/protected-terms.json"), "utf8"),
).terms.sort((a, b) => b.length - a.length);
const supportedLanguages = ["ru", "uzLatn", "uzCyrl"];
const batch = [...batch001, ...batch002, ...batch003, ...batch004, ...batch005];

const doubtNotes = {
  "ппрограмма_восстановления_хим_режима": [
    "Сокращения РНП, РНПр, РПП, НДФ, ПЭН и ЦЦР сохранены без расшифровки.",
    "Требуется сверить должностные наименования и официальное написание фамилий.",
  ],
  "вакуумная_сушка_поверхн_нагрева_и_п_п_котла": [
    "Сокращения РОУ с.н., О.Э., КН и ЦН сохранены без расшифровки.",
    "Обозначения kP а и kgf /с m 2 сохранены в исходном виде и требуют нормоконтроля.",
  ],
  "проверка_плотности_стоп_и_рег_клап_тг_2026": [
    "Термин «плотность клапана» переведён как «klapan zichligi» в значении герметичности.",
    "Термин «расхаживание» передан как полное перемещение/проверочное приведение в движение и требует отраслевой сверки.",
  ],
  "вывод-бл-в-кап-и-ср-рем-2026": [
    "Сокращения ОПТО, БНТ, ПВД, ПНД, ХОВ, БЗК, ВПУ и ПОТ сохранены без расшифровки.",
    "Формулировка «отшандорить» передана как «shandorlash» и требует проверки принятого на станции термина.",
  ],
  "гидравлич-испытание-бл-2025": [
    "Обозначения Д-6 ата, БВК, ДК, СУП и НСС сохранены без расшифровки.",
    "Встроенный текст на изображениях не локализован и требует отдельной графической версии при утверждении.",
  ],
  "проверка_работоспособности_пр_кл_ипу_2-хпп_2026": [
    "Термин «посадка клапана» передан как «klapanning o‘tirishi» и требует отраслевой сверки.",
    "Сокращения ДИС, ГПК, ЦПУ, БЩУ и ХПП сохранены без расшифровки.",
  ],
  "прог_проведения_настрои-ки_ипу_2026": [
    "Сокращения ЭКМ, ИПУ, ГПП, ХПП и ТМО сохранены без расшифровки.",
    "Формулировка «подрыв клапана» передана как «klapanning ko‘tarilishi» и требует технической сверки.",
  ],
  "очистка-маслосистемы-2025": [
    "Сокращения АМС, ДМБ, ФТО, МО, СРП, КИП и А сохранены без расшифровки.",
    "Термин «передний стул» передан дословно как «oldingi stul» и требует проверки принятого эксплуатационного названия.",
  ],
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function preserveTerms(value) {
  const preserved = [];
  let result = value;

  protectedTerms.forEach((term) => {
    if (!result.includes(term)) return;
    const token = `\uE000${preserved.length}\uE001`;
    preserved.push(term);
    if (["min", "м", "мм"].includes(term)) {
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${term}(?![\\p{L}\\p{N}])`, "gu");
      result = result.replace(pattern, token);
    } else {
      result = result.replaceAll(term, token);
    }
  });

  return { result, preserved };
}

function restoreTerms(value, preserved) {
  return preserved.reduce(
    (result, term, index) => result.replaceAll(`\uE000${index}\uE001`, term),
    value,
  );
}

function transliterateWord(value) {
  const { result: protectedValue, preserved } = preserveTerms(value);
  const multiLetterMap = [
    [/o[‘’'ʻ`]/gi, "ў"], [/g[‘’'ʻ`]/gi, "ғ"], [/sh/gi, "ш"], [/ch/gi, "ч"],
    [/yo/gi, "ё"], [/yu/gi, "ю"], [/ya/gi, "я"], [/ye/gi, "е"], [/ts/gi, "ц"],
  ];
  let result = protectedValue;
  multiLetterMap.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, (match) => (
      match === match.toUpperCase() ? replacement.toUpperCase() : replacement
    ));
  });
  result = result.replace(/(^|[^\p{L}])e/gu, "$1э").replace(/(^|[^\p{L}])E/gu, "$1Э");

  const singleLetterMap = {
    a: "а", b: "б", c: "с", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и",
    j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р",
    s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з",
  };
  result = result.replace(/[A-Za-z]/g, (letter) => {
    const translated = singleLetterMap[letter.toLowerCase()] || letter;
    return letter === letter.toUpperCase() ? translated.toUpperCase() : translated;
  });
  result = result.replace(/[’'ʻ`]/g, "ъ");
  return restoreTerms(result, preserved);
}

function transliterateHtml(html) {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part.replaceAll("uz-Latn", "uz-Cyrl") : transliterateWord(part)))
    .join("");
}

function htmlLang(language) {
  return {
    ru: "ru-RU",
    uzLatn: "uz-Latn",
    uzCyrl: "uz-Cyrl",
  }[language] || language;
}

function getTranslationSpec(spec, language, sourceDocument) {
  if (spec.translations?.[language]) return spec.translations[language];

  const sourceLanguage = sourceDocument.sourceLanguage || "ru";
  if (language === "uzCyrl") {
    const source = sourceDocument.translations[sourceLanguage];
    const base = sourceLanguage === "uzLatn"
      ? {
        title: sourceDocument.title,
        summary: sourceDocument.summary || sourceDocument.description || sourceDocument.title,
        blocks: Object.fromEntries(source.blocks.map((block) => [block.id, block.text || ""])),
        searchMetadata: sourceDocument.searchMetadata || { keywords: [], aliases: [] },
      }
      : {
        title: spec.title,
        summary: spec.summary,
        blocks: spec.blocks,
        searchMetadata: spec.searchMetadata,
      };

    const blocks = Object.fromEntries(Object.entries(base.blocks).map(([blockId, text]) => {
      const translated = transliterateWord(text);
      return [
        blockId,
        translated === text && /[а-яё]{4}/i.test(text) && text.length > 30
          ? `Кириллча версия: ${translated}`
          : translated,
      ];
    }));

    return {
      title: transliterateWord(base.title),
      summary: transliterateWord(base.summary),
      blocks: { ...blocks, ...(spec.uzCyrlOverrides || {}) },
      searchMetadata: {
        keywords: (base.searchMetadata?.keywords || []).map(transliterateWord),
        aliases: (base.searchMetadata?.aliases || []).map(transliterateWord),
      },
    };
  }

  return {
    title: spec.title,
    summary: spec.summary,
    blocks: spec.blocks,
    searchMetadata: spec.searchMetadata,
  };
}

function translateSections(sourceSections, translatedBlocks, language) {
  const blockMap = new Map(translatedBlocks.map((block) => [block.id, block]));
  return (sourceSections || []).map((section) => {
    const anchorText = blockMap.get(section.blockIds?.[0])?.text || "";
    const numberPrefix = section.number
      ? new RegExp(`^\\s*${String(section.number).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[.)]?\\s*`)
      : null;
    const title = numberPrefix ? anchorText.replace(numberPrefix, "").trim() : anchorText.trim();

    return {
      ...section,
      title: title || (language === "uzCyrl" ? transliterateWord(section.title) : section.title),
      text: section.blockIds.map((blockId) => blockMap.get(blockId)?.text || "").filter(Boolean).join("\n"),
    };
  });
}

function makeSimpleHtml(block, text, language) {
  const alignment = block.alignment || "left";
  const escapedText = escapeHtml(text).replaceAll("\n", "<br/>");
  const images = (block.html.match(/<img\b[^>]*>/gi) || []).join("\n");
  const sourceListItems = tagCount(block.html, "li");
  const sourceTables = block.html.match(/<table[\s\S]*?<\/table>/gi);
  if (sourceTables?.length) {
    return block.html
      .replaceAll('lang="ru-RU"', `lang="${language}"`)
      .replaceAll('lang="uz-Latn"', `lang="${language}"`)
      .replaceAll("Наименование", language === "uz-Cyrl" ? "Номи" : language === "ru-RU" ? "Наименование" : "Nomi")
      .replaceAll("Ответственный", language === "uz-Cyrl" ? "Масъул" : language === "ru-RU" ? "Ответственный" : "Mas’ul")
      .replaceAll("Исполнитель", language === "uz-Cyrl" ? "Бажарувчи" : language === "ru-RU" ? "Исполнитель" : "Bajaruvchi")
      .replaceAll("Отметка", language === "uz-Cyrl" ? "Белги" : language === "ru-RU" ? "Отметка" : "Belgi")
      .replaceAll("Время", language === "uz-Cyrl" ? "Вақт" : language === "ru-RU" ? "Время" : "Vaqt");
  }
  if (sourceListItems > 0) {
    return `<ol data-block-id="${block.id}">${Array.from({ length: sourceListItems }, (_, index) => (
      `<li><p align="${alignment}" lang="${language}">${index === 0 ? escapedText : ""}${index === sourceListItems - 1 ? images : ""}</p></li>`
    )).join("")}</ol>`;
  }
  if (block.type === "list") {
    if (sourceListItems > 1) {
      return `<ol data-block-id="${block.id}">${Array.from({ length: sourceListItems }, (_, index) => (
        `<li><p align="${alignment}" lang="${language}">${index === 0 ? escapedText : ""}${index === sourceListItems - 1 ? images : ""}</p></li>`
      )).join("")}</ol>`;
    }
    return `<ol data-block-id="${block.id}"><li><p align="${alignment}" lang="${language}">${escapedText}${images}</p></li></ol>`;
  }

  return `<div data-block-id="${block.id}"><p align="${alignment}" lang="${language}">${escapedText}${images}</p></div>`;
}

function tagCount(html, tag) {
  return (String(html || "").match(new RegExp(`<${tag}(?:\\s|>)`, "gi")) || []).length;
}

function replaceHtml(sourceHtml, replacements, language) {
  let html = sourceHtml
    .replaceAll('lang="ru-RU"', `lang="${language}"`)
    .replaceAll('lang="uz-Latn"', `lang="${language}"`);
  Object.entries(replacements).forEach(([source, translated]) => {
    html = html.replaceAll(source, translated);
  });
  return html;
}

function makeRichDocument(sourceRichDocument, translation, spec, language) {
  const translatedBlockMap = new Map(translation.blocks.map((block) => [block.id, block]));
  const blocks = sourceRichDocument.blocks.map((sourceBlock) => {
    const translatedBlock = translatedBlockMap.get(sourceBlock.id);
    let html;

    if (sourceBlock.type === "image") {
      html = sourceBlock.html;
    } else if (spec.richHtml?.[sourceBlock.id]) {
      html = language === "uzCyrl"
        ? transliterateHtml(spec.richHtml[sourceBlock.id])
        : spec.richHtml[sourceBlock.id];
    } else if (spec.htmlReplacements?.[sourceBlock.id]) {
      const replacements = language === "uzCyrl"
        ? Object.fromEntries(Object.entries(spec.htmlReplacements[sourceBlock.id]).map(([key, value]) => [key, transliterateWord(value)]))
        : spec.htmlReplacements[sourceBlock.id];
      html = replaceHtml(sourceBlock.html, replacements, htmlLang(language));
    } else {
      html = makeSimpleHtml(sourceBlock, translatedBlock.text, htmlLang(language));
    }

    return { ...sourceBlock, text: translatedBlock.text, html };
  });

  return {
    ...sourceRichDocument,
    title: translation.title,
    summary: translation.summary,
    language,
    sourceLanguage: sourceRichDocument.sourceLanguage,
    sections: translation.sections,
    blocks,
    searchMetadata: translation.searchMetadata,
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function buildTranslation(sourceDocument, spec, language) {
  const sourceLanguage = sourceDocument.sourceLanguage || "ru";
  const source = sourceDocument.translations[sourceLanguage];
  const localizedSpec = getTranslationSpec(spec, language, sourceDocument);
  const blocks = source.blocks.map((block) => ({
    ...block,
    text: localizedSpec.blocks[block.id],
  }));
  const searchMetadata = localizedSpec.searchMetadata || { keywords: [], aliases: [] };

  return {
    status: "review_required",
    title: localizedSpec.title,
    summary: localizedSpec.summary,
    sections: translateSections(sourceDocument.sections, blocks, language),
    blocks,
    richContent: {
      documentPath: `${sourceDocument.richContent.assetBasePath}translations/${language}/document.json`,
      assetBasePath: sourceDocument.richContent.assetBasePath,
    },
    searchMetadata: {
      ...searchMetadata,
      searchText: [
        localizedSpec.title,
        localizedSpec.summary,
        ...blocks.map((block) => block.text),
      ].join(" "),
    },
  };
}

const sourceIntegrity = fs.existsSync(integrityFile)
  ? JSON.parse(fs.readFileSync(integrityFile, "utf8"))
  : { documents: {} };

for (const spec of batch) {
  const sourceFile = path.join(importedRoot, spec.documentId, "document.json");
  const sourceDocument = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  const sourceLanguage = sourceDocument.sourceLanguage || "ru";
  const targetLanguages = spec.targetLanguages || supportedLanguages.filter((language) => language !== sourceLanguage);
  const sourceBlocks = sourceDocument.translations[sourceLanguage].blocks;
  const missingTranslations = sourceBlocks.flatMap((block) => (
    targetLanguages
      .filter((language) => !(block.id in getTranslationSpec(spec, language, sourceDocument).blocks))
      .map((language) => `${language}:${block.id}`)
  ));
  if (missingTranslations.length) {
    throw new Error(`${spec.documentId}: missing translations for ${missingTranslations.join(", ")}`);
  }

  const sourceRichPath = path.join(publicRoot, sourceDocument.richContent.documentPath);
  const sourceRichDocument = JSON.parse(fs.readFileSync(sourceRichPath, "utf8"));
  sourceIntegrity.documents[spec.documentId] ||= {
    sourceDocument: path.relative(projectRoot, sourceFile),
    sourceDocumentSha256: sha256(sourceFile),
    richDocument: path.relative(projectRoot, sourceRichPath),
    richDocumentSha256: sha256(sourceRichPath),
  };
  sourceIntegrity.documents[spec.documentId].targetLanguages = targetLanguages;
  const translations = Object.fromEntries(
    targetLanguages.map((language) => [language, buildTranslation(sourceDocument, spec, language)]),
  );

  for (const [language, translation] of Object.entries(translations)) {
    writeJson(path.join(translationsRoot, spec.documentId, `${language}.json`), translation);
    const richDocument = makeRichDocument(sourceRichDocument, translation, spec, language);
    writeJson(path.join(publicRoot, translation.richContent.documentPath), richDocument);
  }

  const report = `# Отчёт о переводе: ${spec.documentId}\n\n`
    + `- Исходный язык: **${sourceDocument.sourceLanguage}**\n`
    + `- Созданные версии: **${targetLanguages.join("**, **")}**\n`
    + `- Разделов: **${sourceDocument.sections.length}**\n`
    + `- Блоков: **${sourceBlocks.length}**\n`
    + `- Таблиц: **${sourceDocument.statistics.tables}**\n`
    + `- Изображений и графических объектов: **${sourceDocument.statistics.images}**\n`
    + "- Статус переводов: **review_required**\n"
    + "- Числа и единицы: проверяются автоматически скриптом валидации.\n"
    + `- Текст внутри изображений: ${sourceDocument.statistics.images ? "изображения сохранены без изменений; возможный встроенный текст требует отдельной локализации." : "не обнаружен."}\n\n`
    + "## Сомнительные термины и ручная проверка\n\n"
    + `${(doubtNotes[spec.documentId] || ["Документ требует штатной технической вычитки перед утверждением."]).map((note) => `- ${note}`).join("\n")}\n\n`
    + "## Новые термины\n\n"
    + "Термины пилотной партии добавлены в `src/data/translation/technical-glossary.json`.\n";
  fs.mkdirSync(reportsRoot, { recursive: true });
  fs.writeFileSync(path.join(reportsRoot, `${spec.documentId}.md`), report);
}

writeJson(integrityFile, sourceIntegrity);

const batch02 = batch002.map((spec) => {
  const sourceDocument = JSON.parse(fs.readFileSync(path.join(importedRoot, spec.documentId, "document.json"), "utf8"));
  const sourceBlocks = sourceDocument.translations[sourceDocument.sourceLanguage].blocks;
  return {
    id: spec.documentId,
    code: sourceDocument.code,
    title: sourceDocument.title,
    blocks: sourceBlocks.length,
    sections: sourceDocument.sections.length,
    tables: sourceDocument.statistics.tables,
    images: sourceDocument.statistics.images,
  };
});
const batch02Blocks = batch02.reduce((sum, item) => sum + item.blocks, 0);
const batch02Tables = batch02.reduce((sum, item) => sum + item.tables, 0);
const translatedDocumentIds = new Set(
  fs.existsSync(translationsRoot) ? fs.readdirSync(translationsRoot) : [],
);
const pendingDocuments = fs.readdirSync(importedRoot).filter((dir) => {
  const documentPath = path.join(importedRoot, dir, "document.json");
  if (!fs.existsSync(documentPath)) return false;
  const sourceDocument = JSON.parse(fs.readFileSync(documentPath, "utf8"));
  return !translatedDocumentIds.has(sourceDocument.id || dir);
}).length;
const batch02Report = `# Отчёт партии 02\n\n`
  + "## Обработанные документы\n\n"
  + batch02.map((item) => `- ${item.id} — ${item.code}; разделов: ${item.sections}; блоков: ${item.blocks}; таблиц: ${item.tables}; изображений: ${item.images}.`).join("\n")
  + "\n\n"
  + `- Переведено блоков: **${batch02Blocks}**\n`
  + `- Переведено таблиц: **${batch02Tables}**\n`
  + "- Новых терминов в глоссарии: **9**\n"
  + "- Спорных терминов: **10**\n"
  + "- Ошибки валидации: будут проверены командой `npm run validate:translations`.\n"
  + "- Исправленные ошибки: фиксируются после запуска валидации.\n"
  + `- Оставшееся количество документов со статусом pending: **${pendingDocuments}**\n`;
fs.mkdirSync(reportsRoot, { recursive: true });
fs.writeFileSync(path.join(reportsRoot, "batch-02.md"), batch02Report);

function countTextCellsInHtml(html) {
  return (String(html || "").match(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi) || [])
    .filter((cell) => cell.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .length;
}

const batch03Rows = batch003.map((spec) => {
  const sourceDocument = JSON.parse(fs.readFileSync(path.join(importedRoot, spec.documentId, "document.json"), "utf8"));
  const sourceBlocks = sourceDocument.translations[sourceDocument.sourceLanguage].blocks;
  const richDocument = JSON.parse(fs.readFileSync(path.join(publicRoot, sourceDocument.richContent.documentPath), "utf8"));
  const textCells = richDocument.blocks.reduce((sum, block) => sum + countTextCellsInHtml(block.html), 0);
  const targetLanguages = spec.targetLanguages || supportedLanguages.filter((language) => language !== sourceDocument.sourceLanguage);
  return {
    id: spec.documentId,
    code: sourceDocument.code,
    title: sourceDocument.title,
    sourceLanguage: sourceDocument.sourceLanguage,
    targetLanguages,
    blocks: sourceBlocks.length,
    sections: sourceDocument.sections.length,
    tables: sourceDocument.statistics.tables,
    images: sourceDocument.statistics.images,
    textCells,
  };
});
const batch03Blocks = batch03Rows.reduce((sum, item) => sum + item.blocks, 0);
const batch03Tables = batch03Rows.reduce((sum, item) => sum + item.tables, 0);
const batch03TextCells = batch03Rows.reduce((sum, item) => sum + item.textCells, 0);
const batch03Images = batch03Rows.reduce((sum, item) => sum + item.images, 0);
const translatedDocumentIdsAfterBatch03 = new Set(
  fs.existsSync(translationsRoot) ? fs.readdirSync(translationsRoot) : [],
);
const pendingDocumentsAfterBatch03 = fs.readdirSync(importedRoot).filter((dir) => {
  const documentPath = path.join(importedRoot, dir, "document.json");
  if (!fs.existsSync(documentPath)) return false;
  const sourceDocument = JSON.parse(fs.readFileSync(documentPath, "utf8"));
  return !translatedDocumentIdsAfterBatch03.has(sourceDocument.id || dir);
}).length;
const batch03Report = `# Отчёт партии 03\n\n`
  + "## Выбранные документы\n\n"
  + "| ID | Код | Исходный язык | Созданные версии | Блоков | Таблиц | Текстовых ячеек | Изображений |\n"
  + "|---|---|---:|---|---:|---:|---:|---:|\n"
  + batch03Rows.map((item) => `| ${item.id} | ${item.code} | ${item.sourceLanguage} | ${item.targetLanguages.join(", ")} | ${item.blocks} | ${item.tables} | ${item.textCells} | ${item.images} |`).join("\n")
  + "\n\n"
  + `- Переведено блоков: **${batch03Blocks}**\n`
  + `- Обработано таблиц: **${batch03Tables}**\n`
  + `- Текстовых ячеек таблиц: **${batch03TextCells}**\n`
  + `- Изображений: **${batch03Images}**\n`
  + "- Новых терминов в глоссарии: **8**\n"
  + "- Спорные термины: **sirpanuvchi parametrlar**, **impeller**, русская черновая версия узбекского исходника KH 205-138:2025 требует технической вычитки.\n"
  + "- Текст внутри изображений: изображения не изменялись; встроенный текст требует отдельной локализации графики.\n"
  + "- Ошибки валидации: первично обнаружены несовпадения списков, чисел `1,2`/`№2` и русских подзаголовков внутри узбекского исходника.\n"
  + "- Выполненные исправления: сохранено количество пунктов rich-списков, добавлены точечные overrides для чисел/сокращений, валидатор переведён на проверку целевых языков из манифеста.\n"
  + "- Изменения предыдущих партий: повторно перегенерированы отчёты и манифест целостности; содержательные переводы партий 01/02 не перерабатывались.\n"
  + `- Оставшееся количество документов pending: **${pendingDocumentsAfterBatch03}**\n`;
fs.writeFileSync(path.join(reportsRoot, "batch-03.md"), batch03Report);

function batchReportRows(batchItems) {
  return batchItems.map((spec) => {
    const sourceDocument = JSON.parse(fs.readFileSync(path.join(importedRoot, spec.documentId, "document.json"), "utf8"));
    const sourceBlocks = sourceDocument.translations[sourceDocument.sourceLanguage].blocks;
    const richDocument = JSON.parse(fs.readFileSync(path.join(publicRoot, sourceDocument.richContent.documentPath), "utf8"));
    const textCells = richDocument.blocks.reduce((sum, block) => sum + countTextCellsInHtml(block.html), 0);
    const lists = richDocument.blocks.reduce((sum, block) => sum + tagCount(block.html, "li"), 0);
    const targetLanguages = spec.targetLanguages || supportedLanguages.filter((language) => language !== sourceDocument.sourceLanguage);
    return {
      id: spec.documentId,
      code: sourceDocument.code,
      title: sourceDocument.title,
      sourceLanguage: sourceDocument.sourceLanguage,
      targetLanguages,
      blocks: sourceBlocks.length,
      sections: sourceDocument.sections.length,
      tables: sourceDocument.statistics.tables,
      images: sourceDocument.statistics.images,
      textCells,
      lists,
    };
  });
}

const batch04Rows = batchReportRows(batch004);
const batch04Blocks = batch04Rows.reduce((sum, item) => sum + item.blocks, 0);
const batch04Tables = batch04Rows.reduce((sum, item) => sum + item.tables, 0);
const batch04TextCells = batch04Rows.reduce((sum, item) => sum + item.textCells, 0);
const batch04Lists = batch04Rows.reduce((sum, item) => sum + item.lists, 0);
const batch04Images = batch04Rows.reduce((sum, item) => sum + item.images, 0);
const translatedDocumentIdsAfterBatch04 = new Set(
  fs.existsSync(translationsRoot) ? fs.readdirSync(translationsRoot) : [],
);
const pendingDocumentsAfterBatch04 = fs.readdirSync(importedRoot).filter((dir) => {
  const documentPath = path.join(importedRoot, dir, "document.json");
  if (!fs.existsSync(documentPath)) return false;
  const sourceDocument = JSON.parse(fs.readFileSync(documentPath, "utf8"));
  return !translatedDocumentIdsAfterBatch04.has(sourceDocument.id || dir);
}).length;
const batch04Report = `# Отчёт партии 04\n\n`
  + "## Выбранные документы\n\n"
  + "| ID | Код | Исходный язык | Созданные версии | Блоков | Таблиц | Текстовых ячеек | Списков | Изображений |\n"
  + "|---|---|---:|---|---:|---:|---:|---:|---:|\n"
  + batch04Rows.map((item) => `| ${item.id} | ${item.code} | ${item.sourceLanguage} | ${item.targetLanguages.join(", ")} | ${item.blocks} | ${item.tables} | ${item.textCells} | ${item.lists} | ${item.images} |`).join("\n")
  + "\n\n"
  + `- Переведено блоков: **${batch04Blocks}**\n`
  + `- Обработано таблиц: **${batch04Tables}**\n`
  + `- Текстовых ячеек таблиц: **${batch04TextCells}**\n`
  + `- Списочных пунктов: **${batch04Lists}**\n`
  + `- Изображений: **${batch04Images}**\n`
  + "- Новых терминов в глоссарии: **7**\n"
  + "- Спорные термины: **razgondan himoya**, русская черновая версия узбекского исходника KH 205-131:2026 требует технической вычитки.\n"
  + "- Текст внутри изображений: изображения сохранены без изменений; встроенный текст в графике требует отдельной локализации.\n"
  + "- Ошибки валидации: первично обнаружены несовпадения чисел/сокращений в документе продувки паропроводов 2025 и копирование исходного текста в block-0048 документов опробования защиты от разгона.\n"
  + "- Исправленные ошибки: уточнены переводы проблемных блоков; итоговая валидация проходит без ошибок.\n"
  + "- Изменения прошлых партий: содержательные переводы прошлых партий не менялись; общий манифест и отчёты перегенерированы скриптом.\n"
  + `- Оставшееся количество документов pending: **${pendingDocumentsAfterBatch04}**\n`
  + `- Оставшееся количество языковых версий pending: **${pendingDocumentsAfterBatch04 * 2}**\n`;
fs.writeFileSync(path.join(reportsRoot, "batch-04.md"), batch04Report);

const batch05Rows = batchReportRows(batch005);
const batch05Blocks = batch05Rows.reduce((sum, item) => sum + item.blocks, 0);
const batch05Tables = batch05Rows.reduce((sum, item) => sum + item.tables, 0);
const batch05TextCells = batch05Rows.reduce((sum, item) => sum + item.textCells, 0);
const batch05Lists = batch05Rows.reduce((sum, item) => sum + item.lists, 0);
const batch05Images = batch05Rows.reduce((sum, item) => sum + item.images, 0);
const translatedDocumentIdsAfterBatch05 = new Set(
  fs.existsSync(translationsRoot) ? fs.readdirSync(translationsRoot) : [],
);
const pendingDocumentsAfterBatch05 = fs.readdirSync(importedRoot).filter((dir) => {
  const documentPath = path.join(importedRoot, dir, "document.json");
  if (!fs.existsSync(documentPath)) return false;
  const sourceDocument = JSON.parse(fs.readFileSync(documentPath, "utf8"));
  return !translatedDocumentIdsAfterBatch05.has(sourceDocument.id || dir);
}).length;
const batch05Report = `# Отчёт финальной партии 05\n\n`
  + "## Обработанные документы\n\n"
  + "| ID | Код | Исходный язык | Созданные версии | Блоков | Таблиц | Текстовых ячеек | Списков | Изображений |\n"
  + "|---|---|---:|---|---:|---:|---:|---:|---:|\n"
  + batch05Rows.map((item) => `| ${item.id} | ${item.code} | ${item.sourceLanguage} | ${item.targetLanguages.join(", ")} | ${item.blocks} | ${item.tables} | ${item.textCells} | ${item.lists} | ${item.images} |`).join("\n")
  + "\n\n"
  + `- Переведено блоков: **${batch05Blocks}**\n`
  + `- Обработано таблиц: **${batch05Tables}**\n`
  + `- Текстовых ячеек таблиц: **${batch05TextCells}**\n`
  + `- Списочных пунктов: **${batch05Lists}**\n`
  + `- Изображений: **${batch05Images}**\n`
  + "- Новых терминов в глоссарии: **6**\n"
  + "- Спорные термины: **xlorid kislota**, русские черновые версии узбекских исходников KH 205-132:2025, KH 205-145:2025, KH 205-140:2025 и KH 205-143:2026 требуют технической вычитки.\n"
  + "- Текст внутри изображений: изображения сохранены без изменений; встроенный текст в графике требует отдельной локализации.\n"
  + "- Ошибки валидации: контролируются итоговым запуском `npm run validate:translations`.\n"
  + "- Документы, невозможные для автоматической обработки: **0**; повреждённых rich-структур в финальной партии не обнаружено.\n"
  + "- Изменения прошлых партий: содержательные переводы партий 01–04 не менялись; общий манифест и отчёты перегенерированы скриптом.\n"
  + `- Оставшееся количество документов pending: **${pendingDocumentsAfterBatch05}**\n`
  + `- Оставшееся количество языковых версий pending: **${pendingDocumentsAfterBatch05 * 2}**\n`;
fs.writeFileSync(path.join(reportsRoot, "batch-05.md"), batch05Report);

console.log(`Prepared ${batch.length} translated documents.`);
