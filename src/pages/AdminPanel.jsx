import { useEffect, useMemo, useState } from "react";
import { getLocalizedDocument } from "../data/documentTranslations.js";
import { loadAllDocuments } from "../data/loadDocuments.js";
import { useLanguage } from "../i18n/useLanguage.js";

const filterGroups = [
  {
    titleKey: "purpose",
    key: "purpose",
    options: [
      { value: "accident-response", labelKey: "accidentResponse" },
      { value: "reference", labelKey: "reference" },
      { value: "operation-rules", labelKey: "operationRules" },
      { value: "other", labelKey: "other" },
    ],
  },
  {
    titleKey: "category",
    key: "category",
    options: [
      { value: "boiler", labelKey: "boiler" },
      { value: "turbine", labelKey: "turbine" },
      { value: "electrical", labelKey: "electrical" },
      { value: "auxiliary-power", labelKey: "auxiliaryPower" },
      { value: "pgu", labelKey: "pgu" },
      { value: "pte", labelKey: "pte" },
      { value: "other", labelKey: "other" },
    ],
  },
];

const purposeLabelKeys = Object.fromEntries(filterGroups[0].options.map(({ value, labelKey }) => [value, labelKey]));
const categoryLabelKeys = Object.fromEntries(filterGroups[1].options.map(({ value, labelKey }) => [value, labelKey]));

function AdminPanel({ navigate }) {
  const { selectedLanguage, messages } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({ purpose: [], category: [] });

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

  const localizedDocuments = useMemo(() => documents.map((source) => ({
    source,
    localized: getLocalizedDocument(source, selectedLanguage),
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
    setSelectedFilters({ purpose: [], category: [] });
  }

  const filteredDocuments = localizedDocuments.filter(({ source }) => {
    const matchesPurpose = selectedFilters.purpose.length === 0 || selectedFilters.purpose.includes(source.purpose);
    const matchesCategory = selectedFilters.category.length === 0 || selectedFilters.category.includes(source.category);
    return matchesPurpose && matchesCategory;
  });

  const activeFiltersCount = selectedFilters.purpose.length + selectedFilters.category.length;
  const visibleSectionCount = filteredDocuments.reduce(
    (total, { localized }) => total + (localized?.blocks?.length || 0), 0,
  );

  return (
    <main className="library-layout">
      <aside className="library-sidebar">
        <div className="library-sidebar__header">
          <h2 className="library-sidebar__title">{messages.filters.title}</h2>
          {activeFiltersCount > 0 && (
            <button type="button" className="library-sidebar__reset" onClick={resetFilters}>
              {messages.filters.reset}
            </button>
          )}
        </div>

        {filterGroups.map((group) => (
          <section className="library-filter-group" key={group.key}>
            <h3 className="library-filter-group__title">{messages.filters[group.titleKey]}</h3>
            <div className="library-filter-group__options">
              {group.options.map((option) => (
                <label className="library-filter-option" key={option.value}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[group.key].includes(option.value)}
                    onChange={() => toggleFilter(group.key, option.value)}
                  />
                  <span>{messages.filters[option.labelKey]}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
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
          ) : filteredDocuments.map(({ source, localized }) => {
            const translationAvailable = localized?.translationAvailable;
            return (
              <article className="library-card" key={source.id}>
                <div className="library-card__header">
                  <div>
                    <p className="library-card__code">{source.code}</p>
                    <h2 className="library-card__title">{translationAvailable ? localized.title : (source.title || source.code)}</h2>
                  </div>
                  {translationAvailable && <span className="library-card__badge">{localized.blocks.length} {messages.library.sections}</span>}
                </div>

                <div className="library-card__tags">
                  <span>{messages.filters[purposeLabelKeys[source.purpose]] || source.purposeLabel}</span>
                  <span>{messages.filters[categoryLabelKeys[source.category]] || source.categoryLabel}</span>
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

                <p className={translationAvailable ? "library-card__summary" : "library-card__translation-message"}>
                  {translationAvailable
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
