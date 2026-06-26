import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { libraryGroups } from "../src/data/libraryTaxonomy.js";
import { searchSuggestions } from "../src/data/searchSuggestions.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importedRoot = path.join(projectRoot, "src/data/importedDocuments");
const translationsRoot = path.join(projectRoot, "src/data/translation/documents");
const importedIndex = JSON.parse(fs.readFileSync(path.join(importedRoot, "index.json"), "utf8"));
const documentIds = new Set(importedIndex.map((entry) => entry.id));
const groupIds = new Set(libraryGroups.map((group) => group.id));
const languages = ["ru", "uzLatn", "uzCyrl"];
const oldDocumentIds = new Set([
  "kn-205-523-2024",
  "kn-205-139-2023",
  "kst-205-013-2018",
  "parovaya-turbina-k-160-130-htgz",
  "pte-teplomehanicheskaya-chast-posobie",
  "kn-205-131-2023",
  "kn-205-132-2023",
]);
const errors = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}‘’'ʻ`-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryTokens(query) {
  return normalize(query)
    .split(" ")
    .filter((token) => token.length >= 3 || /\d/.test(token));
}

function blockText(block) {
  return [block.title, block.text, block.items?.join(" "), block.rows?.flat().join(" ")]
    .filter(Boolean)
    .join(" ");
}

function getTranslation(document, language) {
  if (document.sourceLanguage === language) {
    return {
      title: document.title,
      summary: document.summary || "",
      blocks: document.translations[language].blocks,
      searchMetadata: document.searchMetadata?.[language] || document.searchMetadata || {},
    };
  }

  const translationPath = path.join(translationsRoot, document.id, `${language}.json`);
  if (!fs.existsSync(translationPath)) return null;
  return readJson(translationPath);
}

const documents = importedIndex.map((entry) => readJson(path.join(importedRoot, entry.id, "document.json")));
const indices = new Map(languages.map((language) => {
  const entries = documents.flatMap((document) => {
    const translation = getTranslation(document, language);
    if (!translation?.blocks?.length) return [];

    const documentKeywords = translation.searchMetadata?.keywords?.join(" ") || "";
    const documentAliases = translation.searchMetadata?.aliases?.join(" ") || "";
    return [{
      documentId: document.id,
      text: normalize([
        document.code,
        translation.title,
        translation.summary,
        documentKeywords,
        documentAliases,
        ...translation.blocks.map(blockText),
      ].join(" ")),
    }];
  });

  return [language, { entries }];
}));

function searchExpected(language, query, expectedDocumentIds) {
  const { entries } = indices.get(language);
  const normalizedQuery = normalize(query);
  const tokens = queryTokens(query);
  return entries.some((entry) => {
    if (!expectedDocumentIds.includes(entry.documentId)) return false;
    if (entry.text.includes(normalizedQuery)) return true;
    const matchedTokens = tokens.filter((token) => entry.text.includes(token));
    return matchedTokens.length >= Math.min(2, tokens.length);
  });
}

const ids = new Set();
searchSuggestions.forEach((suggestion) => {
  if (!suggestion.id) errors.push("suggestion without id");
  if (ids.has(suggestion.id)) errors.push(`${suggestion.id}: duplicate id`);
  ids.add(suggestion.id);

  if (!groupIds.has(suggestion.groupId)) errors.push(`${suggestion.id}: unknown group ${suggestion.groupId}`);
  if (!suggestion.targetDocumentIds?.length) errors.push(`${suggestion.id}: no target documents`);

  (suggestion.targetDocumentIds || []).forEach((documentId) => {
    if (oldDocumentIds.has(documentId)) errors.push(`${suggestion.id}: references removed old document ${documentId}`);
    if (!documentIds.has(documentId)) errors.push(`${suggestion.id}: unknown target document ${documentId}`);
  });

  languages.forEach((language) => {
    if (!suggestion.labels?.[language]) errors.push(`${suggestion.id}: missing ${language} label`);
    if (!suggestion.query?.[language]) errors.push(`${suggestion.id}: missing ${language} query`);
    if (suggestion.query?.[language] && !searchExpected(language, suggestion.query[language], suggestion.targetDocumentIds || [])) {
      errors.push(`${suggestion.id}/${language}: query does not find expected document`);
    }
  });
});

if (errors.length) {
  console.error(`Search suggestions validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Search suggestions validation passed for ${searchSuggestions.length} suggestions.`);
