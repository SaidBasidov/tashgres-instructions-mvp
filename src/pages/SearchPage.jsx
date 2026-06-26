import { useEffect, useState } from "react";
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

function SearchPage({ navigate }) {
    const { selectedLanguage, messages } = useLanguage();
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchableDocumentCount, setSearchableDocumentCount] = useState(null);
    const [resultsLanguage, setResultsLanguage] = useState(selectedLanguage);
    const [suggestionOffset, setSuggestionOffset] = useState(0);
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
        let isCurrent = true;
        const trimmedQuery = query.trim();

        if (!trimmedQuery) return undefined;

        const timeoutId = window.setTimeout(async () => {
            setIsSearching(true);
            const searchResponse = await searchDocuments(trimmedQuery, selectedLanguage);

            if (isCurrent) {
                setSearchResults(searchResponse.results);
                setResultsLanguage(selectedLanguage);
                setSearchableDocumentCount(searchResponse.searchableDocumentCount);
                setIsSearching(false);
            }
        }, 150);

        return () => {
            isCurrent = false;
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
            setIsSearching(false);
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
                <p>{isSearching
                    ? messages.search.searching
                    : interpolate(messages.search.found, { count: groupedResults.length })}</p>

                {!isSearching && query.trim() && searchableDocumentCount === 0 && (
                    <div className="empty-message">{messages.search.translationUnavailable}</div>
                )}
                {!isSearching && query.trim() && searchableDocumentCount > 0 && groupedResults.length === 0 && (
                    <div className="empty-message">{messages.search.noResults}</div>
                )}

                {groupedResults.map((group) => (
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
