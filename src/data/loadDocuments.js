import { prepareDocumentTranslations } from "./documentTranslations.js";
import {
  loadAllImportedDocuments,
  loadImportedDocument,
} from "./importedDocuments/index.js";

const documentLoaders = {
};

let allDocumentsPromise;

export function loadDocument(documentId) {
  const load = documentLoaders[documentId];
  return load
    ? load().then(prepareDocumentTranslations)
    : loadImportedDocument(documentId).then(prepareDocumentTranslations);
}

export function loadAllDocuments() {
  allDocumentsPromise ??= Promise.all([
    ...Object.values(documentLoaders).map((load) => load().then(prepareDocumentTranslations)),
    loadAllImportedDocuments(),
  ]).then(([...loadedGroups]) => loadedGroups.flat());
  return allDocumentsPromise;
}
