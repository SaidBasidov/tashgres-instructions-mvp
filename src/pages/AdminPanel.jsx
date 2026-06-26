import { useEffect, useMemo, useState } from "react";
import { getLocalizedDocument } from "../data/documentTranslations.js";
import { getDocumentTaxonomy } from "../data/documentTaxonomyMap.js";
import { loadAllDocuments } from "../data/loadDocuments.js";
import { getLocalizedTaxonomyItem, libraryGroups, workTypeFilters } from "../data/libraryTaxonomy.js";
import { useLanguage } from "../i18n/useLanguage.js";
import { isDocumentAvailableInLanguage } from "../utils/isDocumentAvailableInLanguage.js";

const availabilityStorageKey = "library-show-only-available";

function AdminPanel({ navigate }) {
  const { selectedLanguage, messages } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({ groups: [], workTypes: [] });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(() => {
    try {
      const storedValue = localStorage.getItem(availabilityStorageKey);
      return storedValue === null ? true : storedValue === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let isCurrent = true;

    loadAllDocuments().then((loadedDocuments) => {
      if (isCurrent) {
        setDocuments(loadedDocuments);
        setIsLoading(false);
      }
    });

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(availabilityStorageKey, String(showOnlyAvailable));
    } catch {
      // The filter still works when storage is unavailable.
    }
  }, [showOnlyAvailable]);

  const localizedDocuments = useMemo(() => documents.map((source) => ({
    source,
    localized: getLocalizedDocument(source, selectedLanguage),
    available: isDocumentAvailableInLanguage(source, selectedLanguage),
    taxonomy: getDocumentTaxonomy(source.id),
  })), [documents, selectedLanguage]);

  function openDocument(documentData) {
    navigate(`/documents/${encodeURIComponent(documentData.id)}`);
  }

  function toggleFilter(groupKey, value) {
    setSelectedFilters((currentFilters) => {
      const currentGroupValues = currentFilters[groupKey];
      return {
        ...currentFilters,
        [groupKey]: currentGroupValues.includes(value)
          ? currentGroupValues.filter((item) => item !== value)
          : [...currentGroupValues, value],
      };
    });
  }

  function resetFilters() {
    setSelectedFilters({ groups: [], workTypes: [] });
    setShowOnlyAvailable(true);
  }

  const categoryFilteredDocuments = localizedDocuments.filter(({ taxonomy }) => {
    const matchesGroups = selectedFilters.groups.length === 0
      || selectedFilters.groups.some((groupId) => taxonomy?.groups?.includes(groupId));
    const matchesWorkTypes = selectedFilters.workTypes.length === 0
      || selectedFilters.workTypes.some((workTypeId) => taxonomy?.workTypes?.includes(workTypeId));
    return matchesGroups && matchesWorkTypes;
  });
  const availableDocumentsCount = categoryFilteredDocuments.filter(({ available }) => available).length;
  const filteredDocuments = categoryFilteredDocuments.filter(({ available }) => (
    !showOnlyAvailable || available
  ));

  const activeFiltersCount = selectedFilters.groups.length + selectedFilters.workTypes.length;
  const hasNonDefaultFilters = activeFiltersCount > 0 || !showOnlyAvailable;
  const visibleSectionCount = filteredDocuments.reduce(
    (total, { localized }) => total + (localized?.blocks?.length || 0), 0,
  );
  const groupCounts = useMemo(() => Object.fromEntries(
    libraryGroups.map((group) => [
      group.id,
      localizedDocuments.filter(({ taxonomy, available }) => (
        taxonomy?.groups?.includes(group.id) && (!showOnlyAvailable || available)
      )).length,
    ]),
  ), [localizedDocuments, showOnlyAvailable]);
  const workTypeCounts = useMemo(() => Object.fromEntries(
    workTypeFilters.map((workType) => [
      workType.id,
      localizedDocuments.filter(({ taxonomy, available }) => (
        taxonomy?.workTypes?.includes(workType.id) && (!showOnlyAvailable || available)
      )).length,
    ]),
  ), [localizedDocuments, showOnlyAvailable]);
  const visibleGroupFilters = libraryGroups.filter((group) => groupCounts[group.id] > 0);
  const visibleWorkTypeFilters = workTypeFilters.filter((workType) => workTypeCounts[workType.id] > 0);

  return (
    <main className="library-layout">
      <aside className="library-sidebar">
        <div className="library-sidebar__header">
          <h2 className="library-sidebar__title">{messages.filters.title}</h2>
          {hasNonDefaultFilters && (
            <button type="button" className="library-sidebar__reset" onClick={resetFilters}>
              {messages.filters.reset}
            </button>
          )}
        </div>

        <section className="library-filter-group library-availability">
          <h3 className="library-filter-group__title">{messages.filters.availability}</h3>
          <label className="library-availability__option">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(event) => setShowOnlyAvailable(event.target.checked)}
              aria-label={messages.filters.onlyAvailable}
            />
            <span className="library-availability__switch" aria-hidden="true">
              <span className="library-availability__thumb" />
            </span>
            <span className="library-availability__copy">
              <span>{messages.filters.onlyAvailable}</span>
              <small>
                {messages.library.availableOnSelectedLanguage}: {availableDocumentsCount} {messages.library.availableOf} {categoryFilteredDocuments.length}
              </small>
            </span>
          </label>
        </section>

        <section className="library-filter-group">
          <h3 className="library-filter-group__title">{messages.filters.topic}</h3>
          <div className="library-filter-group__options">
            {visibleGroupFilters.map((group) => {
              const localizedGroup = getLocalizedTaxonomyItem(libraryGroups, group.id, selectedLanguage);
              return (
                <label className="library-filter-option" key={group.id} title={localizedGroup.description}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.groups.includes(group.id)}
                    onChange={() => toggleFilter("groups", group.id)}
                  />
                  <span>{localizedGroup.label}</span>
                  <small>{groupCounts[group.id]}</small>
                </label>
              );
            })}
          </div>
        </section>

        <section className="library-filter-group">
          <h3 className="library-filter-group__title">{messages.filters.workType}</h3>
            <div className="library-filter-group__options">
              {visibleWorkTypeFilters.map((workType) => {
                const localizedWorkType = getLocalizedTaxonomyItem(workTypeFilters, workType.id, selectedLanguage);
                return (
                <label className="library-filter-option" key={workType.id}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.workTypes.includes(workType.id)}
                    onChange={() => toggleFilter("workTypes", workType.id)}
                  />
                  <span>{localizedWorkType.label}</span>
                  <small>{workTypeCounts[workType.id]}</small>
                </label>
                );
              })}
            </div>
        </section>
      </aside>

      <section className="library-page">
        <section className="library-hero">
          <p className="library-hero__eyebrow">{messages.library.eyebrow}</p>
          <h1 className="library-hero__title">{messages.library.title}</h1>
          <p className="library-hero__description">{messages.library.description}</p>
          <div className="library-stats">
            <div className="library-stat"><span className="library-stat__value">{documents.length}</span><span className="library-stat__label">{messages.library.total}</span></div>
            <div className="library-stat"><span className="library-stat__value">{filteredDocuments.length}</span><span className="library-stat__label">{messages.library.shown}</span></div>
            <div className="library-stat"><span className="library-stat__value">{visibleSectionCount}</span><span className="library-stat__label">{messages.library.sections}</span></div>
          </div>
        </section>

        <section className="library-list">
          {isLoading ? (
            <div className="library-empty"><p>{messages.library.loading}</p></div>
          ) : filteredDocuments.length === 0 ? (
            <div className="library-empty">
              <h2 className="library-empty__title">{messages.library.emptyTitle}</h2>
              <p className="library-empty__description">{messages.library.emptyDescription}</p>
            </div>
          ) : filteredDocuments.map(({ source, localized, available, taxonomy }) => {
            const displayedTitle = available && localized?.title
              ? localized.title
              : (source.title || source.code || messages.meta.unspecified);
            const displayedContentCount = localized?.blocks?.length || localized?.sections?.length || 0;
            const primaryGroup = getLocalizedTaxonomyItem(libraryGroups, taxonomy?.primaryGroup, selectedLanguage);
            const secondaryWorkTypes = (taxonomy?.workTypes || [])
              .map((workTypeId) => getLocalizedTaxonomyItem(workTypeFilters, workTypeId, selectedLanguage))
              .filter(Boolean);
            return (
              <article className="library-card" key={source.id}>
                <div className="library-card__header">
                  <div>
                    <p className="library-card__code">{source.code}</p>
                    <h2 className="library-card__title">{displayedTitle}</h2>
                  </div>
                  {available
                    ? <span className="library-card__badge">{displayedContentCount} {messages.library.sections}</span>
                    : <span className="library-card__badge library-card__badge--unavailable">{messages.library.noSelectedLanguageVersion}</span>}
                </div>

                <div className="library-card__tags">
                  {primaryGroup && <span>{primaryGroup.label}</span>}
                  {secondaryWorkTypes.slice(0, 2).map((workType) => (
                    <span key={workType.id}>{workType.label}</span>
                  ))}
                </div>

                <div className="library-card__meta">
                  <p><span>{messages.meta.type}:</span> {source.type || messages.meta.unspecified}</p>
                  <p><span>{messages.meta.area}:</span> {source.equipmentArea || messages.meta.unspecified}</p>
                  <p><span>{messages.meta.department}:</span> {source.department || messages.meta.unspecified}</p>
                  <p><span>{messages.meta.source}:</span> {source.sourceFile || messages.meta.unspecified}</p>
                  <p><span>{messages.meta.originalLanguage}:</span> {messages.languageNames[source.sourceLanguage || "ru"] || messages.languageNames.unknown}</p>
                  <p><span>{messages.meta.originalFile}:</span> {source.originalFile?.path ? messages.meta.available : messages.meta.unavailable}</p>
                  <p><span>{messages.meta.pdfPreview}:</span> {source.previewFile?.path ? messages.meta.available : messages.meta.unavailable}</p>
                </div>

                <p className={available ? "library-card__summary" : "library-card__translation-message"}>
                  {available
                    ? (localized.summary || "")
                    : `${messages.library.translationUnavailable} ${messages.library.originalAvailable}: ${messages.languageNames[source.sourceLanguage] || messages.languageNames.unknown}.`}
                </p>

                <button className="library-card__button" onClick={() => openDocument(source)}>
                  {messages.buttons.openDocument}
                </button>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

export default AdminPanel;
