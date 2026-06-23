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

  return {
    ...documentData,
    translations: {
      ...documentData.translations,
      ru: {
        title: documentData.title,
        summary: documentData.summary,
        blocks: documentData.blocks,
      },
    },
  };
}

export function getLocalizedDocument(documentData, language) {
  if (!documentData) return null;

  const translation = documentData.translations?.[language];

  if (language === "ru") {
    const russianTitle = translation?.title ?? documentData.title;
    const russianBlocks = translation?.blocks ?? documentData.blocks;

    return {
      ...documentData,
      title: russianTitle,
      summary: translation?.summary ?? documentData.summary,
      blocks: russianBlocks,
      translationAvailable: Boolean(russianTitle && russianBlocks?.length),
    };
  }

  if (!translation) {
    return { ...documentData, title: null, summary: null, blocks: null, translationAvailable: false };
  }

  return {
    ...documentData,
    title: translation.title ?? null,
    summary: translation.summary ?? null,
    blocks: translation.blocks ?? null,
    translationAvailable: Boolean(translation.title && translation.blocks),
  };
}
