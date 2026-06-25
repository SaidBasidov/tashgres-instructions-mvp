import importedDocumentIndex from "./index.json";

const documentModules = import.meta.glob("./*/document.json");
const externalTranslationModules = import.meta.glob("../translation/documents/*/*.json");
const documentLoaders = new Map(
  importedDocumentIndex.map((entry) => [entry.id, documentModules[entry.path]]),
);
const externalTranslationLoaders = new Map();

Object.entries(externalTranslationModules).forEach(([modulePath, load]) => {
  const match = modulePath.match(/documents\/([^/]+)\/(ru|uzLatn|uzCyrl)\.json$/);
  if (!match) return;

  const [, documentId, language] = match;
  if (!externalTranslationLoaders.has(documentId)) externalTranslationLoaders.set(documentId, new Map());
  externalTranslationLoaders.get(documentId).set(language, load);
});
const documentPromises = new Map();

function getAvailableTranslations(documentData) {
  return Object.fromEntries(
    Object.entries(documentData.translations || {})
      .filter(([language, translation]) => {
        const status = translation?.status || documentData.translationStatus?.[language];
        return !["pending", "in_progress", "error"].includes(status);
      })
      .map(([language, translation]) => {
        const isSource = language === documentData.sourceLanguage;
        return [language, {
          ...translation,
          status: translation.status || documentData.translationStatus?.[language] || (isSource ? "source" : "review_required"),
          sections: translation.sections ?? (isSource ? documentData.sections : undefined),
          richContent: translation.richContent ?? (isSource ? documentData.richContent : undefined),
          searchMetadata: translation.searchMetadata ?? documentData.searchMetadata?.[language],
        }];
      }),
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

async function mergeExternalTranslations(documentData) {
  const loaders = externalTranslationLoaders.get(documentData.id);
  if (!loaders) return documentData;

  const loadedTranslations = await Promise.all(
    Array.from(loaders.entries()).map(async ([language, load]) => {
      const module = await load();
      return [language, module.default];
    }),
  );
  const externalTranslations = Object.fromEntries(loadedTranslations);
  const externalStatuses = Object.fromEntries(
    loadedTranslations.map(([language, translation]) => [language, translation.status]),
  );

  return {
    ...documentData,
    translations: { ...documentData.translations, ...externalTranslations },
    translationStatus: { ...documentData.translationStatus, ...externalStatuses },
  };
}

export const importedDocuments = importedDocumentIndex;

export async function loadImportedDocument(documentId) {
  const load = documentLoaders.get(documentId);
  if (!load) return null;

  if (!documentPromises.has(documentId)) {
    documentPromises.set(
      documentId,
      load()
        .then((module) => mergeExternalTranslations(module.default))
        .then(adaptImportedDocument),
    );
  }

  return documentPromises.get(documentId);
}

export function loadAllImportedDocuments() {
  return Promise.all(importedDocumentIndex.map(({ id }) => loadImportedDocument(id)));
}
