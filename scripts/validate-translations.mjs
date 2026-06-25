import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const integrity = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "src/data/translation/source-integrity.json"), "utf8"),
);
const protectedTerms = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "src/data/translation/protected-terms.json"), "utf8"),
).terms;
const defaultTargetLanguages = ["uzLatn", "uzCyrl"];
const errors = [];
const summaries = [];

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function multiset(values) {
  return values.reduce((result, value) => {
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
}

function numericTokens(value) {
  return String(value || "").match(/\d+(?:[.,]\d+)?/g) || [];
}

function countMatches(value, pattern) {
  return (String(value || "").match(pattern) || []).length;
}

function tagCount(html, tag) {
  return countMatches(html, new RegExp(`<${tag}(?:\\s|>)`, "gi"));
}

function tableShapes(html) {
  return (String(html || "").match(/<table[\s\S]*?<\/table>/gi) || []).map((table) => ({
    rows: tagCount(table, "tr"),
    cells: tagCount(table, "td") + tagCount(table, "th"),
    rowspans: countMatches(table, /\srowspan=/gi),
    colspans: countMatches(table, /\scolspan=/gi),
  }));
}

function normalized(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termCount(value, term) {
  if (/^[А-Яа-яЁё0-9.,-]+$/u.test(term) && !["м", "мм"].includes(term)) {
    return String(value || "").split(term).length - 1;
  }
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, "gu");
  return countMatches(value, pattern);
}

function validateText(sourceBlock, targetBlock, documentId, language) {
  const label = `${documentId}/${language}/${sourceBlock.id}`;
  if (sourceBlock.text?.trim() && !targetBlock.text?.trim()) errors.push(`${label}: empty translation`);
  if (/<[^>]+>/.test(targetBlock.text || "")) errors.push(`${label}: HTML tag found in text`);

  const sourceNumbers = multiset(numericTokens(sourceBlock.text));
  const targetNumbers = multiset(numericTokens(targetBlock.text));
  if (JSON.stringify(sourceNumbers) !== JSON.stringify(targetNumbers)) {
    errors.push(`${label}: numeric tokens differ (${JSON.stringify(sourceNumbers)} != ${JSON.stringify(targetNumbers)})`);
  }

  protectedTerms.forEach((term) => {
    const sourceCount = termCount(sourceBlock.text, term);
    const targetCount = termCount(targetBlock.text, term);
    if (sourceCount > 0 && sourceCount !== targetCount) errors.push(`${label}: protected term "${term}" count differs`);
  });

  const sourceText = normalized(sourceBlock.text);
  if (
    sourceText.length > 30
    && /[а-яё]{4}/i.test(sourceText)
    && sourceText === normalized(targetBlock.text)
  ) {
    errors.push(`${label}: source text appears to be copied without translation`);
  }
}

function validateStructure(source, target, documentId, language) {
  if (target.status !== "review_required") errors.push(`${documentId}/${language}: invalid status ${target.status}`);
  if (source.blocks.length !== target.blocks.length) errors.push(`${documentId}/${language}: block count differs`);
  if ((source.sections || []).length !== (target.sections || []).length) errors.push(`${documentId}/${language}: section count differs`);

  source.blocks.forEach((sourceBlock, index) => {
    const targetBlock = target.blocks[index];
    if (!targetBlock) return;
    if (sourceBlock.id !== targetBlock.id) errors.push(`${documentId}/${language}: block ID differs at ${index}`);
    if (sourceBlock.type !== targetBlock.type) errors.push(`${documentId}/${language}/${sourceBlock.id}: block type differs`);
    if (JSON.stringify(sourceBlock.sectionIds || []) !== JSON.stringify(targetBlock.sectionIds || [])) {
      errors.push(`${documentId}/${language}/${sourceBlock.id}: section links differ`);
    }
    validateText(sourceBlock, targetBlock, documentId, language);
  });

  (source.sections || []).forEach((sourceSection, index) => {
    const targetSection = target.sections[index];
    if (!targetSection || sourceSection.id !== targetSection.id) {
      errors.push(`${documentId}/${language}: section ID differs at ${index}`);
      return;
    }
    if (JSON.stringify(sourceSection.blockIds) !== JSON.stringify(targetSection.blockIds)) {
      errors.push(`${documentId}/${language}/${sourceSection.id}: section block links differ`);
    }
  });
}

function validateRichStructure(sourceRich, targetRich, documentId, language) {
  if (sourceRich.blocks.length !== targetRich.blocks.length) errors.push(`${documentId}/${language}: rich block count differs`);

  sourceRich.blocks.forEach((sourceBlock, index) => {
    const targetBlock = targetRich.blocks[index];
    if (!targetBlock || sourceBlock.id !== targetBlock.id) {
      errors.push(`${documentId}/${language}: rich block ID differs at ${index}`);
      return;
    }

    const sourceTables = tableShapes(sourceBlock.html);
    const targetTables = tableShapes(targetBlock.html);
    if (JSON.stringify(sourceTables) !== JSON.stringify(targetTables)) {
      errors.push(`${documentId}/${language}/${sourceBlock.id}: table structure differs`);
    }
    if (tagCount(sourceBlock.html, "img") !== tagCount(targetBlock.html, "img")) {
      errors.push(`${documentId}/${language}/${sourceBlock.id}: image count differs`);
    }
    if (tagCount(sourceBlock.html, "li") !== tagCount(targetBlock.html, "li")) {
      errors.push(`${documentId}/${language}/${sourceBlock.id}: list item count differs`);
    }
  });
}

for (const [documentId, integrityEntry] of Object.entries(integrity.documents)) {
  const sourceDocumentPath = path.join(projectRoot, integrityEntry.sourceDocument);
  const sourceRichPath = path.join(projectRoot, integrityEntry.richDocument);
  if (sha256(sourceDocumentPath) !== integrityEntry.sourceDocumentSha256) errors.push(`${documentId}: source document changed`);
  if (sha256(sourceRichPath) !== integrityEntry.richDocumentSha256) errors.push(`${documentId}: source rich document changed`);

  const sourceDocument = readJson(sourceDocumentPath);
  const source = {
    blocks: sourceDocument.translations[sourceDocument.sourceLanguage].blocks,
    sections: sourceDocument.sections,
  };
  const sourceRich = readJson(sourceRichPath);

  const languages = integrityEntry.targetLanguages || defaultTargetLanguages;
  for (const language of languages) {
    const targetPath = path.join(projectRoot, "src/data/translation/documents", documentId, `${language}.json`);
    const target = readJson(targetPath);
    const targetRich = readJson(path.join(projectRoot, "public", target.richContent.documentPath));
    validateStructure(source, target, documentId, language);
    validateRichStructure(sourceRich, targetRich, documentId, language);
  }

  summaries.push(`${documentId}: ${source.blocks.length} blocks, ${source.sections.length} sections, ${languages.join("/")} review_required`);
}

if (errors.length) {
  console.error(`Translation validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Translation validation passed for ${summaries.length} documents.`);
summaries.forEach((summary) => console.log(`- ${summary}`));
