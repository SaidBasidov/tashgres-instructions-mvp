import { useEffect, useRef, useState } from "react";
import { getSearchSuggestions, searchSuggestions } from "../data/searchSuggestions.js";
import { useLanguage } from "../i18n/useLanguage.js";
import { interpolate } from "../i18n/messages.js";
import { getSearchableDocumentCount, searchDocuments } from "../utils/searchDocuments";

function groupResultsByDocument(results, maxMatchesPerDocument = 4) {
    const groups = {};

    results.forEach((result) => {
        groups[result.documentId] ??= {
            documentId: result.documentId,
            documentCode: result.documentCode,
            documentTitle: result.documentTitle,
            matches: [],
            totalMatches: 0,
        };

        groups[result.documentId].totalMatches += 1;
        if (groups[result.documentId].matches.length < maxMatchesPerDocument) {
            groups[result.documentId].matches.push(result);
        }
    });

    return Object.values(groups);
}

function SearchLoadingState({ title, description }) {
    return (
        <div className="search-loading" role="status" aria-live="polite">
            <span className="search-loading__spinner" aria-hidden="true" />
            <div>
                <p className="search-loading__title">{title}</p>
                <p className="search-loading__description">
                    {description}
                    <span className="search-loading__dots" aria-hidden="true">
                        <span>.</span><span>.</span><span>.</span>
                    </span>
                </p>
            </div>
            <div className="search-loading__skeletons" aria-hidden="true">
                <span className="search-loading__skeleton" />
                <span className="search-loading__skeleton search-loading__skeleton--short" />
            </div>
        </div>
    );
}

function SearchPage({ navigate }) {
    const { selectedLanguage, messages } = useLanguage();
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchStatus, setSearchStatus] = useState("idle");
    const [searchableDocumentCount, setSearchableDocumentCount] = useState(null);
    const [resultsLanguage, setResultsLanguage] = useState(selectedLanguage);
    const [suggestionOffset, setSuggestionOffset] = useState(0);
    const latestSearchRequestId = useRef(0);
    const groupedResults = groupResultsByDocument(
        resultsLanguage === selectedLanguage ? searchResults : [],
    );
    const shouldShowSuggestions = query.trim() === "";
    const visibleSuggestions = getSearchSuggestions(selectedLanguage, suggestionOffset, 6);

    useEffect(() => {
        let isCurrent = true;

        getSearchableDocumentCount(selectedLanguage).then((count) => {
            if (isCurrent) setSearchableDocumentCount(count);
        });

        return () => { isCurrent = false; };
    }, [selectedLanguage]);

    useEffect(() => {
        const trimmedQuery = query.trim();
        const requestId = latestSearchRequestId.current + 1;
        latestSearchRequestId.current = requestId;

        if (!trimmedQuery) {
            setSearchStatus("idle");
            setSearchResults([]);
            setResultsLanguage(selectedLanguage);
            return undefined;
        }

        setSearchStatus("loading");
        setSearchResults([]);
        setResultsLanguage(selectedLanguage);

        const timeoutId = window.setTimeout(async () => {
            const startedAt = window.performance.now();

            try {
                const searchResponse = await searchDocuments(trimmedQuery, selectedLanguage);
                const elapsed = window.performance.now() - startedAt;
                const minimumLoadingTime = 280;

                if (elapsed < minimumLoadingTime) {
                    await new Promise((resolve) => {
                        window.setTimeout(resolve, minimumLoadingTime - elapsed);
                    });
                }

                if (latestSearchRequestId.current !== requestId) return;

                setSearchResults(searchResponse.results);
                setResultsLanguage(selectedLanguage);
                setSearchableDocumentCount(searchResponse.searchableDocumentCount);
                setSearchStatus(
                    searchResponse.searchableDocumentCount > 0 && searchResponse.results.length > 0
                        ? "success"
                        : "empty",
                );
            } catch {
                if (latestSearchRequestId.current !== requestId) return;

                setSearchResults([]);
                setResultsLanguage(selectedLanguage);
                setSearchStatus("error");
            }
        }, 150);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [query, selectedLanguage]);

    useEffect(() => {
        setSuggestionOffset(0);
    }, [selectedLanguage]);

    function createSnippet(text, maxLength = 180) {
        if (!text || text.length <= maxLength) return text || "";
        return `${text.slice(0, maxLength).trim()}...`;
    }

    function handleQueryChange(event) {
        const nextQuery = event.target.value;
        setQuery(nextQuery);

        if (!nextQuery.trim()) {
            setSearchResults([]);
            setSearchStatus("idle");
        }
    }

    return (
        <main className="search-page">
            <section className="search-panel">
                <h1 className="search-panel__title">{messages.search.title}</h1>
                <p className="search-panel__description">{messages.search.description}</p>
                <input
                    className="search-panel__input"
                    type="search"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder={messages.search.placeholder}
                />
            </section>

            {shouldShowSuggestions && (
                <section className="search-suggestions">
                    <div className="search-suggestions__header">
                        <p className="search-suggestions__title">{messages.search.suggestions}</p>
                        <button
                            type="button"
                            className="search-suggestions__refresh"
                            onClick={() => setSuggestionOffset((currentOffset) => (
                                (currentOffset + 6) % searchSuggestions.length
                            ))}
                        >
                            {messages.search.moreSuggestions}
                        </button>
                    </div>
                    <div className="search-suggestions__list">
                        {visibleSuggestions.map((suggestion) => (
                            <button key={suggestion.id} type="button" className="search-suggestions__button" onClick={() => setQuery(suggestion.searchQuery)}>
                                {suggestion.label}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <section className="search-results" aria-live="polite">
                {searchStatus === "loading" && (
                    <SearchLoadingState
                        title={messages.search.searchLoadingTitle}
                        description={messages.search.searchLoadingDescription}
                    />
                )}

                {searchStatus === "success" && (
                    <p>{interpolate(messages.search.found, { count: groupedResults.length })}</p>
                )}

                {searchStatus === "empty" && searchableDocumentCount === 0 && (
                    <div className="empty-message">{messages.search.translationUnavailable}</div>
                )}
                {searchStatus === "empty" && searchableDocumentCount > 0 && (
                    <div className="empty-message">
                        <h2 className="empty-message__title">{messages.search.searchEmptyTitle}</h2>
                        <p className="empty-message__description">{messages.search.searchEmptyDescription}</p>
                    </div>
                )}

                {searchStatus === "error" && (
                    <div className="empty-message empty-message--error" role="alert">
                        <h2 className="empty-message__title">{messages.search.searchErrorTitle}</h2>
                        <p className="empty-message__description">{messages.search.searchErrorDescription}</p>
                    </div>
                )}

                {searchStatus === "success" && groupedResults.map((group) => (
                    <article className="search-document-card" key={group.documentId}>
                        <h2>{group.documentCode}</h2>
                        <p>{group.documentTitle}</p>
                        <small>{interpolate(messages.search.matches, { count: group.totalMatches })}</small>
                        <div className="search-document-card__matches">
                            {group.matches.map((match) => (
                                <button
                                    key={match.blockId}
                                    type="button"
                                    className="search-match-button"
                                    onClick={() => navigate(`/documents/${encodeURIComponent(match.documentId)}?block=${encodeURIComponent(match.blockId)}`)}
                                >
                                    <span className="search-match-button__type">
                                        {messages.search.blockTypes[match.blockType] || messages.search.blockTypes.fallback}
                                    </span>
                                    <span className="search-match-button__text">{createSnippet(match.blockText)}</span>
                                </button>
                            ))}
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default SearchPage;
