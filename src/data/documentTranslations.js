/**
 * Supported document shape:
 * translations: {
 *   ru: { title, summary, blocks },
 *   uzLatn: { title, summary, blocks },
 *   uzCyrl: { title, summary, blocks },
 * }
 * Existing top-level title, summary and blocks remain the Russian fallback.
 * Optional file metadata remains language-independent:
 * originalFile: { name, path, mimeType, extension }
 * previewFile: { name, path, mimeType: "application/pdf" }
 */
export function prepareDocumentTranslations(documentData) {
  if (!documentData || documentData.translations) return documentData;

  const sourceLanguage = documentData.sourceLanguage || documentData.language || "ru";

  return {
    ...documentData,
    sourceLanguage,
    translationStatus: {
      ...documentData.translationStatus,
      [sourceLanguage]: "source",
    },
    translations: {
      ...documentData.translations,
      [sourceLanguage]: {
        status: "source",
        title: documentData.title,
        summary: documentData.summary,
        sections: documentData.sections,
        blocks: documentData.blocks,
        richContent: documentData.richContent,
        searchMetadata: documentData.searchMetadata?.[sourceLanguage],
      },
    },
  };
}

export function getLocalizedDocument(documentData, language) {
  if (!documentData) return null;

  const translation = documentData.translations?.[language];
  const sourceLanguage = documentData.sourceLanguage || documentData.language || "ru";
  const isSourceLanguage = language === sourceLanguage;

  if (translation || isSourceLanguage) {
    const russianTitle = translation?.title ?? documentData.title;
    const russianBlocks = translation?.blocks ?? documentData.blocks;

    return {
      ...documentData,
      title: russianTitle,
      summary: translation?.summary ?? documentData.summary,
      sections: translation?.sections ?? (isSourceLanguage ? documentData.sections : null),
      blocks: russianBlocks,
      richContent: translation?.richContent ?? (isSourceLanguage ? documentData.richContent : null),
      activeTranslationStatus: translation?.status || documentData.translationStatus?.[language],
      searchMetadata: {
        ...documentData.searchMetadata,
        ...(translation?.searchMetadata ? { [language]: translation.searchMetadata } : {}),
      },
      translationAvailable: Boolean(russianTitle && (russianBlocks?.length || translation?.sections?.length || translation?.richContent)),
    };
  }

  return { ...documentData, title: null, summary: null, sections: null, blocks: null, richContent: null, translationAvailable: false };
}
