import importedDocumentIndex from "./index.json";

const documentModules = import.meta.glob("./*/document.json");
const documentLoaders = new Map(
  importedDocumentIndex.map((entry) => [entry.id, documentModules[entry.path]]),
);
const documentPromises = new Map();

function getAvailableTranslations(documentData) {
  return Object.fromEntries(
    Object.entries(documentData.translations || {}).filter(([language]) => (
      documentData.translationStatus?.[language] !== "pending"
    )),
  );
}

function adaptImportedDocument(documentData) {
  const sourceLanguage = documentData.sourceLanguage || "unknown";
  const translations = getAvailableTranslations(documentData);
  const sourceTranslation = translations[sourceLanguage];

  return {
    ...documentData,
    title: sourceTranslation?.title || documentData.title || documentData.code,
    summary: sourceTranslation?.summary || documentData.summary || "",
    type: documentData.type || "Импортированный технический документ",
    category: documentData.category || "other",
    categoryLabel: documentData.categoryLabel || "Другие документы",
    purpose: documentData.purpose || "other",
    purposeLabel: documentData.purposeLabel || "Другое",
    department: documentData.department || "",
    equipmentArea: documentData.equipmentArea || "",
    language: documentData.language || sourceLanguage,
    sourceLanguage,
    translations,
  };
}

export const importedDocuments = importedDocumentIndex;

export async function loadImportedDocument(documentId) {
  const load = documentLoaders.get(documentId);
  if (!load) return null;

  if (!documentPromises.has(documentId)) {
    documentPromises.set(
      documentId,
      load().then((module) => adaptImportedDocument(module.default)),
    );
  }

  return documentPromises.get(documentId);
}

export function loadAllImportedDocuments() {
  return Promise.all(importedDocumentIndex.map(({ id }) => loadImportedDocument(id)));
}
