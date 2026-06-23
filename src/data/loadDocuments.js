import { prepareDocumentTranslations } from "./documentTranslations.js";
import {
  loadAllImportedDocuments,
  loadImportedDocument,
} from "./importedDocuments/index.js";

const documentLoaders = {
  "kn-205-523-2024": () => import("./documents.js").then(({ documents }) => documents[0]),
  "kn-205-139-2023": () => import("./documents.js").then(({ documents }) => documents[1]),
  "kst-205-013-2018": () => import("./documents.js").then(({ documents }) => documents[2]),
  "parovaya-turbina-k-160-130-htgz": () =>
    import("./parovayaTurbina/index.js").then(({ parovayaTurbinaDocument }) => parovayaTurbinaDocument),
  "pte-teplomehanicheskaya-chast-posobie": () =>
    import("./pteThermomechanical/index.js").then(({ pteThermomechanicalDocument }) => pteThermomechanicalDocument),
  "kn-205-131-2023": () =>
    import("./kn205131TurbineAccidents/index.js").then(({ kn205131TurbineAccidentsDocument }) => kn205131TurbineAccidentsDocument),
  "kn-205-132-2023": () =>
    import("./kn205132BoilerAccidents/index.js").then(({ kn205132BoilerAccidentsDocument }) => kn205132BoilerAccidentsDocument),
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
