import { documents } from "../data/documents.js";

function AdminPanel({
  setCurrentPage,
  setSelectedDocumentId,
  setTargetBlockId,
}) {
  function openDocument(documentData) {
    const firstBlockId = documentData.blocks?.[0]?.id || null;

    setSelectedDocumentId(documentData.id);
    setTargetBlockId(firstBlockId);
    setCurrentPage("instruction");
  }

  return (
    <main className="library-page">
      <section className="library-hero">
        <p className="library-hero__eyebrow">База инструкций</p>

        <h1 className="library-hero__title">Библиотека документов</h1>

        <p className="library-hero__description">
          Здесь собраны инструкции и технические документы, подключенные к
          mock-базе MVP. Документы доступны для просмотра и поиска по разделам.
        </p>

        <div className="library-stats">
          <div className="library-stat">
            <span className="library-stat__value">{documents.length}</span>
            <span className="library-stat__label">документов</span>
          </div>

          <div className="library-stat">
            <span className="library-stat__value">
              {documents.reduce(
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
        {documents.map((documentData) => (
          <article className="library-card" key={documentData.id}>
            <div className="library-card__header">
              <div>
                <p className="library-card__code">{documentData.code}</p>
                <h2 className="library-card__title">{documentData.title}</h2>
              </div>

              <span className="library-card__badge">
                {documentData.blocks?.length || 0} разделов
              </span>
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
                <span>Источник:</span> {documentData.sourceFile || "Не указан"}
              </p>
            </div>

            {documentData.summary && (
              <p className="library-card__summary">{documentData.summary}</p>
            )}

            <button
              className="library-card__button"
              onClick={() => openDocument(documentData)}
            >
              Открыть документ
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminPanel;