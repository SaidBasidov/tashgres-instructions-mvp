import { useState } from "react";
import { documents } from "../data/documents.js";

const filterGroups = [
  {
    title: "Назначение документа",
    key: "purpose",
    options: [
      {
        value: "accident-response",
        label: "Ликвидация / предупреждение аварий",
      },
      {
        value: "reference",
        label: "Справочное описание",
      },
      {
        value: "operation-rules",
        label: "Правила эксплуатации",
      },
    ],
  },
  {
    title: "Направление",
    key: "category",
    options: [
      {
        value: "boiler",
        label: "Котельное оборудование",
      },
      {
        value: "turbine",
        label: "Турбинное оборудование",
      },
      {
        value: "electrical",
        label: "Электрическая часть",
      },
      {
        value: "auxiliary-power",
        label: "Собственные нужды",
      },
      {
        value: "pgu",
        label: "ПГУ-370 MW",
      },
      {
        value: "pte",
        label: "Общие тепломеханические / ПТЭ",
      },
    ],
  },
];

function AdminPanel({
  setCurrentPage,
  setSelectedDocumentId,
  setTargetBlockId,
}) {
  const [selectedFilters, setSelectedFilters] = useState({
    purpose: [],
    category: [],
  });

  function openDocument(documentData) {
    const firstBlockId = documentData.blocks?.[0]?.id || null;

    setSelectedDocumentId(documentData.id);
    setTargetBlockId(firstBlockId);
    setCurrentPage("instruction");
  }

  function toggleFilter(groupKey, value) {
    setSelectedFilters((currentFilters) => {
      const currentGroupValues = currentFilters[groupKey];

      const isAlreadySelected = currentGroupValues.includes(value);

      return {
        ...currentFilters,
        [groupKey]: isAlreadySelected
          ? currentGroupValues.filter((item) => item !== value)
          : [...currentGroupValues, value],
      };
    });
  }

  function resetFilters() {
    setSelectedFilters({
      purpose: [],
      category: [],
    });
  }

  function checkDocumentMatchesFilters(documentData) {
    const hasPurposeFilters = selectedFilters.purpose.length > 0;
    const hasCategoryFilters = selectedFilters.category.length > 0;

    const matchesPurpose =
      !hasPurposeFilters || selectedFilters.purpose.includes(documentData.purpose);

    const matchesCategory =
      !hasCategoryFilters ||
      selectedFilters.category.includes(documentData.category);

    return matchesPurpose && matchesCategory;
  }

  const filteredDocuments = documents.filter(checkDocumentMatchesFilters);

  const activeFiltersCount =
    selectedFilters.purpose.length + selectedFilters.category.length;

  return (
    <main className="library-layout">
      <aside className="library-sidebar">
        <div className="library-sidebar__header">
          <h2 className="library-sidebar__title">Фильтры</h2>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              className="library-sidebar__reset"
              onClick={resetFilters}
            >
              Сбросить
            </button>
          )}
        </div>

        {filterGroups.map((group) => (
          <section className="library-filter-group" key={group.key}>
            <h3 className="library-filter-group__title">{group.title}</h3>

            <div className="library-filter-group__options">
              {group.options.map((option) => (
                <label className="library-filter-option" key={option.value}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[group.key].includes(option.value)}
                    onChange={() => toggleFilter(group.key, option.value)}
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </aside>

      <section className="library-page">
        <section className="library-hero">
          <p className="library-hero__eyebrow">База инструкций</p>

          <h1 className="library-hero__title">Библиотека документов</h1>

          <p className="library-hero__description">
            Здесь собраны инструкции и технические документы, подключенные к
            mock-базе MVP. Документы можно фильтровать по назначению и
            направлению оборудования.
          </p>

          <div className="library-stats">
            <div className="library-stat">
              <span className="library-stat__value">{documents.length}</span>
              <span className="library-stat__label">всего документов</span>
            </div>

            <div className="library-stat">
              <span className="library-stat__value">
                {filteredDocuments.length}
              </span>
              <span className="library-stat__label">показано</span>
            </div>

            <div className="library-stat">
              <span className="library-stat__value">
                {filteredDocuments.reduce(
                  (total, documentData) =>
                    total + (documentData.blocks?.length || 0),
                  0
                )}
              </span>
              <span className="library-stat__label">разделов</span>
            </div>
          </div>
        </section>

        <section className="library-list">
          {filteredDocuments.length === 0 ? (
            <div className="library-empty">
              <h2 className="library-empty__title">Документы не найдены</h2>
              <p className="library-empty__description">
                По выбранным фильтрам нет документов. Сбрось фильтры или выбери
                другую комбинацию.
              </p>
            </div>
          ) : (
            filteredDocuments.map((documentData) => (
              <article className="library-card" key={documentData.id}>
                <div className="library-card__header">
                  <div>
                    <p className="library-card__code">{documentData.code}</p>
                    <h2 className="library-card__title">
                      {documentData.title}
                    </h2>
                  </div>

                  <span className="library-card__badge">
                    {documentData.blocks?.length || 0} разделов
                  </span>
                </div>

                <div className="library-card__tags">
                  <span>{documentData.purposeLabel}</span>
                  <span>{documentData.categoryLabel}</span>
                </div>

                <div className="library-card__meta">
                  <p>
                    <span>Тип:</span> {documentData.type || "Не указан"}
                  </p>

                  <p>
                    <span>Направление:</span>{" "}
                    {documentData.equipmentArea || "Не указано"}
                  </p>

                  <p>
                    <span>Подразделение:</span>{" "}
                    {documentData.department || "Не указано"}
                  </p>

                  <p>
                    <span>Источник:</span>{" "}
                    {documentData.sourceFile || "Не указан"}
                  </p>
                </div>

                {documentData.summary && (
                  <p className="library-card__summary">
                    {documentData.summary}
                  </p>
                )}

                <button
                  className="library-card__button"
                  onClick={() => openDocument(documentData)}
                >
                  Открыть документ
                </button>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminPanel;