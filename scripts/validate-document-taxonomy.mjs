import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { documentTaxonomyMap } from "../src/data/documentTaxonomyMap.js";
import { libraryGroups, workTypeFilters } from "../src/data/libraryTaxonomy.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importedIndex = JSON.parse(fs.readFileSync(path.join(projectRoot, "src/data/importedDocuments/index.json"), "utf8"));
const documentIds = importedIndex.map((entry) => entry.id);
const documentIdSet = new Set(documentIds);
const groupIds = new Set(libraryGroups.map((group) => group.id));
const workTypeIds = new Set(workTypeFilters.map((workType) => workType.id));
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

libraryGroups.forEach((group) => {
  ["ru", "uzLatn", "uzCyrl"].forEach((language) => {
    if (!group.labels?.[language]) errors.push(`${group.id}: missing ${language} label`);
    if (!group.description?.[language]) errors.push(`${group.id}: missing ${language} description`);
  });
});

workTypeFilters.forEach((workType) => {
  ["ru", "uzLatn", "uzCyrl"].forEach((language) => {
    if (!workType.labels?.[language]) errors.push(`${workType.id}: missing ${language} label`);
  });
});

documentIds.forEach((documentId) => {
  const taxonomy = documentTaxonomyMap[documentId];
  if (!taxonomy) {
    errors.push(`${documentId}: missing taxonomy entry`);
    return;
  }
  if (!groupIds.has(taxonomy.primaryGroup)) errors.push(`${documentId}: unknown primaryGroup ${taxonomy.primaryGroup}`);
  if (!taxonomy.groups?.includes(taxonomy.primaryGroup)) errors.push(`${documentId}: primaryGroup is not present in groups`);
  (taxonomy.groups || []).forEach((groupId) => {
    if (!groupIds.has(groupId)) errors.push(`${documentId}: unknown group ${groupId}`);
  });
  (taxonomy.workTypes || []).forEach((workTypeId) => {
    if (!workTypeIds.has(workTypeId)) errors.push(`${documentId}: unknown workType ${workTypeId}`);
  });
  if ((taxonomy.groups || []).includes("accident-response") && (taxonomy.groups || []).includes("water-chemistry")) {
    errors.push(`${documentId}: accident-response and water-chemistry combination requires explicit review`);
  }
});

Object.keys(documentTaxonomyMap).forEach((documentId) => {
  if (oldDocumentIds.has(documentId)) errors.push(`${documentId}: removed old document referenced in taxonomy`);
  if (!documentIdSet.has(documentId)) errors.push(`${documentId}: taxonomy references unknown document`);
});

libraryGroups.forEach((group) => {
  const count = documentIds.filter((documentId) => documentTaxonomyMap[documentId]?.groups?.includes(group.id)).length;
  if (count === 0) errors.push(`${group.id}: empty group`);
});

if (errors.length) {
  console.error(`Document taxonomy validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Document taxonomy validation passed for ${documentIds.length} documents and ${libraryGroups.length} groups.`);
