const supportedLanguages = new Set(["ru", "uzLatn", "uzCyrl"]);
const availableTranslationStatuses = new Set(["source", "generated", "review_required", "approved"]);

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasRichContentPath(value) {
  if (!value || typeof value !== "object") return false;

  return [value.documentPath, value.htmlPath, value.fullHtmlPath, value.contentPath]
    .some((path) => typeof path === "string" && path.trim().length > 0);
}

function hasTranslationContent(translation) {
  return Boolean(
    translation
    && typeof translation === "object"
    && (
      hasItems(translation.blocks)
      || hasItems(translation.sections)
      || hasRichContentPath(translation.richContent)
    )
  );
}

export function isDocumentAvailableInLanguage(documentData, selectedLanguage) {
  if (!documentData || !supportedLanguages.has(selectedLanguage)) return false;

  const translationStatus = documentData.translationStatus?.[selectedLanguage];
  if (translationStatus === "pending") return false;
  if (translationStatus && !availableTranslationStatuses.has(translationStatus)) return false;

  const translation = documentData.translations?.[selectedLanguage];
  if (hasTranslationContent(translation)) return true;

  const localizedRichContent = documentData.localizedRichContent?.[selectedLanguage]
    || documentData.richContent?.translations?.[selectedLanguage]
    || documentData.richContent?.[selectedLanguage];
  if (hasRichContentPath(localizedRichContent)) return true;

  const sourceLanguage = documentData.sourceLanguage || documentData.language || "ru";
  if (selectedLanguage !== sourceLanguage) return false;

  return Boolean(
    hasItems(documentData.blocks)
    || hasItems(documentData.sections)
    || hasRichContentPath(documentData.richContent)
  );
}
