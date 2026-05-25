import { useState } from "react";
import { searchDocuments } from "../utils/searchDocuments";

function SearchPage({
    setCurrentPage,
    setSelectedDocumentId,
    setTargetBlockId,

}) {
    const [query, setQuery] = useState("");

    function groupResultsByDocument(results, maxMatchesPerDocument = 4) {
        const groups = {};

        results.forEach((result) => {
            if (!groups[result.documentId]) {
                groups[result.documentId] = {
                    documentId: result.documentId,
                    documentCode: result.documentCode,
                    documentTitle: result.documentTitle,
                    matches: [],
                    totalMatches: 0,
                };
            }

            groups[result.documentId].totalMatches += 1;

            if (groups[result.documentId].matches.length < maxMatchesPerDocument) {
                groups[result.documentId].matches.push(result);
            }
        });

        return Object.values(groups);
    }

    const searchResults = searchDocuments(query);
    const groupedResults = groupResultsByDocument(searchResults);

    function createSnippet(text, maxLength = 180) {
        if (!text) return "";

        if (text.length <= maxLength) {
            return text;
        }

        return text.slice(0, maxLength).trim() + "...";
    }

    function getBlockTypeLabel(type) {
        const labels = {
            heading: "Заголовок",
            paragraph: "Абзац",
            list: "Список",
        };

        return labels[type] || "Блок";
    }

    return (
        <main className="search-page">
            <section className="search-panel">
                <h2 className="search-panel__title">Поиск по базе инструкций</h2>

                <p className="search-panel__description">
                    Опишите ситуацию. Система будет искать подходящие
                    разделы инструкций.
                </p>

                <input
                    className="search-panel__input"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Например: потеря собственных нужд, вибрация турбины..."
                />

                <p className="search-panel__debug">
                    Текущий запрос: {query || "пусто"}
                </p>
            </section>

            <div className="search-results">
                <p>Найдено документов: {groupedResults.length}</p>

                {groupedResults.map((group) => (
                    <article className="search-document-card" key={group.documentId}>
                        <h3>{group.documentCode}</h3>
                        <p>{group.documentTitle}</p>
                        <small>Совпадений: {group.matches.length}</small>

                        <div className="search-document-card__matches">
                            {group.matches.map((match) => (
                                <button
                                    key={match.blockId}
                                    className="search-match-button"
                                    onClick={() => {
                                        setSelectedDocumentId(match.documentId);
                                        setTargetBlockId(match.blockId);
                                        setCurrentPage("instruction");
                                    }}
                                >
                                    <span className="search-match-button__type">
                                        {getBlockTypeLabel(match.blockType)}
                                    </span>

                                    <span className="search-match-button__text">
                                        {createSnippet(match.blockText)}
                                    </span>

                                    <small>Score: {match.score?.toFixed(3)}</small>
                                </button>
                            ))}
                        </div>
                    </article>
                ))}
            </div>

        </main>
    );
}

export default SearchPage;