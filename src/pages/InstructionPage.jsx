import { useEffect, useMemo, useRef, useState } from "react";
import DocumentActions from "../components/DocumentActions.jsx";
import { getLocalizedDocument } from "../data/documentTranslations.js";
import { loadDocument } from "../data/loadDocuments.js";
import { useLanguage } from "../i18n/useLanguage.js";
import { interpolate } from "../i18n/messages.js";

function getNavigationTitle(block, pageLabel) {
    if (block.type === "section") {
        return [block.number, block.title].filter(Boolean).join(". ");
    }

    if (block.type === "heading") return block.text;
    if (block.type === "page") return interpolate(pageLabel, { number: block.pageNumber });
    return null;
}

function getBlockPrintLabel(block, pageLabel, maxLength = 64) {
    if (!block) return "";

    let label = "";
    if (block.type === "section") label = [block.number, block.title].filter(Boolean).join(". ");
    else if (block.type === "heading") label = block.text || "";
    else if (block.type === "page") label = interpolate(pageLabel, { number: block.pageNumber });
    else if (block.title) label = [block.number, block.title].filter(Boolean).join(". ");
    else if (block.text) label = block.text;
    else if (block.items) label = block.items.join(" ");
    else if (block.rows) label = block.rows.flat().join(" ");

    const normalizedLabel = label.replace(/\s+/g, " ").trim();
    return normalizedLabel.length > maxLength
        ? `${normalizedLabel.slice(0, maxLength - 1).trim()}…`
        : normalizedLabel;
}

function getParentSectionId(blocks, blockId) {
    const blockIndex = blocks.findIndex((block) => block.id === blockId);
    if (blockIndex < 0 || blocks[blockIndex].type === "section") return null;

    const block = blocks[blockIndex];
    const explicitParentId = block.parentId || block.sectionId;
    if (explicitParentId && blocks.some((candidate) => candidate.id === explicitParentId)) {
        return explicitParentId;
    }

    for (let index = blockIndex - 1; index >= 0; index -= 1) {
        if (["section", "heading"].includes(blocks[index].type)) return blocks[index].id;
    }

    return null;
}

function InstructionPage({ selectedDocumentId, targetBlockId, navigate }) {
    const { selectedLanguage, messages } = useLanguage();
    const [sourceDocument, setSourceDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
    const [activeBlockId, setActiveBlockId] = useState(targetBlockId);
    const [highlightedBlockId, setHighlightedBlockId] = useState(null);
    const [printSelection, setPrintSelection] = useState({ mode: "all", blockId: null });
    const [isPrintRequested, setIsPrintRequested] = useState(false);
    const navigationRef = useRef(null);
    const navigationItemRefs = useRef({});

    const documentData = useMemo(
        () => getLocalizedDocument(sourceDocument, selectedLanguage),
        [sourceDocument, selectedLanguage],
    );
    const tableOfContents = useMemo(() => documentData?.translationAvailable && documentData.blocks
        ? documentData.blocks
            .map((block) => ({ id: block.id, title: getNavigationTitle(block, messages.document.page) }))
            .filter((item) => item.title)
        : [], [documentData, messages.document.page]);
    const targetBlock = useMemo(
        () => documentData?.blocks?.find((block) => block.id === targetBlockId) || null,
        [documentData, targetBlockId],
    );
    const printBlock = useMemo(
        () => documentData?.blocks?.find((block) => block.id === printSelection.blockId) || null,
        [documentData, printSelection.blockId],
    );
    const printContextBlockId = useMemo(
        () => documentData?.blocks
            ? getParentSectionId(documentData.blocks, printSelection.blockId)
            : null,
        [documentData, printSelection.blockId],
    );
    const searchResultLabel = getBlockPrintLabel(targetBlock, messages.document.page);
    const printSelectionLabel = getBlockPrintLabel(printBlock, messages.document.page);

    useEffect(() => {
        let isCurrent = true;

        loadDocument(selectedDocumentId).then((loadedDocument) => {
            if (isCurrent) {
                setSourceDocument(loadedDocument);
                setIsLoading(false);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [selectedDocumentId]);

    useEffect(() => {
        function handleScroll() {
            setIsScrollButtonVisible(window.scrollY > 500);
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!documentData?.translationAvailable || tableOfContents.length === 0) return undefined;

        const elements = tableOfContents
            .map((item) => document.getElementById(item.id))
            .filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

                if (visibleEntry) setActiveBlockId(visibleEntry.target.id);
            },
            { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [documentData, tableOfContents]);

    useEffect(() => {
        if (!documentData?.translationAvailable || !targetBlockId) return undefined;

        const element = document.getElementById(targetBlockId);
        if (!element) return undefined;

        let highlightTimeoutId;
        const timeoutId = window.setTimeout(() => {
            setActiveBlockId(targetBlockId);
            setHighlightedBlockId(targetBlockId);
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            highlightTimeoutId = window.setTimeout(() => {
                setHighlightedBlockId(null);
            }, 2800);
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearTimeout(highlightTimeoutId);
        };
    }, [documentData, targetBlockId]);

    useEffect(() => {
        const container = navigationRef.current;
        const activeItem = navigationItemRefs.current[activeBlockId];
        if (!container || !activeItem || container.scrollHeight <= container.clientHeight) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const safeOffset = 36;
        const isAboveSafeZone = itemRect.top < containerRect.top + safeOffset;
        const isBelowSafeZone = itemRect.bottom > containerRect.bottom - safeOffset;

        if (!isAboveSafeZone && !isBelowSafeZone) return;

        const nextScrollTop = isAboveSafeZone
            ? container.scrollTop + itemRect.top - containerRect.top - safeOffset
            : container.scrollTop + itemRect.bottom - containerRect.bottom + safeOffset;

        container.scrollTo({ top: nextScrollTop, behavior: "smooth" });
    }, [activeBlockId]);

    useEffect(() => {
        function handleAfterPrint() {
            setPrintSelection({ mode: "all", blockId: null });
            setIsPrintRequested(false);
        }

        window.addEventListener("afterprint", handleAfterPrint);
        return () => window.removeEventListener("afterprint", handleAfterPrint);
    }, []);

    useEffect(() => {
        if (!isPrintRequested) return undefined;

        let printFrameId;
        const renderFrameId = window.requestAnimationFrame(() => {
            printFrameId = window.requestAnimationFrame(() => {
                window.print();
                setIsPrintRequested(false);
            });
        });

        return () => {
            window.cancelAnimationFrame(renderFrameId);
            window.cancelAnimationFrame(printFrameId);
        };
    }, [isPrintRequested, printSelection]);

    function requestPrint(mode, blockId = null) {
        setPrintSelection({ mode, blockId });
        setIsPrintRequested(true);
    }

    function scrollToBlock(blockId) {
        const element = document.getElementById(blockId);
        if (!element) return;

        setActiveBlockId(blockId);
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function splitSectionText(text) {
        if (!text) return [];

        return text
            .replace(/\s+/g, " ")
            .replace(/ (?=\d+\.\d+(?:\.\d+)?\s)/g, "\n")
            .replace(/ (?=\d+\.\s)/g, "\n")
            .split("\n")
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
    }

    function blockClassName(baseClass, blockId) {
        return [
            baseClass,
            "document-viewer__block",
            blockId === activeBlockId ? "document-viewer__block--active" : "",
            blockId === highlightedBlockId ? "document-viewer__block--search-highlight" : "",
            printSelection.mode !== "all" && blockId === printSelection.blockId
                ? "document-viewer__block--print-selected"
                : "",
            printSelection.mode !== "all" && blockId === printContextBlockId
                ? "document-viewer__block--print-context"
                : "",
        ].filter(Boolean).join(" ");
    }

    if (isLoading) {
        return <main className="instruction-page"><p>{messages.document.loading}</p></main>;
    }

    if (!documentData) {
        return (
            <main className="instruction-page">
                <section className="instruction-panel">
                    <h2 className="instruction-panel__title">{messages.document.notFound}</h2>
                    <p className="instruction-panel__description">{messages.document.notFoundDescription}</p>
                </section>
                <button onClick={() => navigate("/search")}>{messages.buttons.back}</button>
            </main>
        );
    }

    if (!documentData.translationAvailable) {
        return (
            <main className="instruction-page">
                <button className="instruction-page__back" onClick={() => navigate("/search")}>{messages.buttons.back}</button>
                <section className="instruction-panel translation-unavailable">
                    <p>{sourceDocument.code}</p>
                    <h1 className="instruction-panel__title">{messages.document.translationUnavailable}</h1>
                    <p>{sourceDocument.title}</p>
                    <p>{messages.meta.originalLanguage}: {messages.languageNames[sourceDocument.sourceLanguage] || messages.languageNames.unknown}</p>
                    <DocumentActions
                        documentData={sourceDocument}
                        labels={messages.documentActions}
                        sections={[]}
                        searchResultLabel={null}
                        onPrintAll={() => requestPrint("all")}
                        onPrintSearchResult={() => {}}
                        onPrintSection={() => {}}
                    />
                </section>
            </main>
        );
    }

    return (
        <main className={printSelection.mode === "all"
            ? "instruction-page print-mode--all"
            : "instruction-page print-mode--selection"}
        >
            <button className="instruction-page__back" onClick={() => navigate("/search")}>{messages.buttons.back}</button>

            <header className="instruction-panel">
                <p>{documentData.code}</p>
                <h1 className="instruction-panel__title">{documentData.title}</h1>
                <p className="instruction-panel__description">
                    {messages.document.sourceFile}: {documentData.originalFile?.name || documentData.sourceFile}
                    {!documentData.originalFile?.path && ` (${messages.document.sourceUnavailable})`}
                </p>
                <div className="print-document-meta">
                    <p>{messages.document.language}: {messages.document.languageName}</p>
                    {printSelection.mode !== "all" && (
                        <p><strong>{messages.documentActions.printedSection}:</strong> {printSelectionLabel}</p>
                    )}
                </div>
                <DocumentActions
                    documentData={documentData}
                    labels={messages.documentActions}
                    sections={tableOfContents}
                    searchResultLabel={targetBlock ? searchResultLabel : null}
                    onPrintAll={() => requestPrint("all")}
                    onPrintSearchResult={() => requestPrint("search-result", targetBlockId)}
                    onPrintSection={(blockId) => requestPrint("section", blockId)}
                />
            </header>

            <div className="instruction-layout">
                <aside className="document-toc" aria-label={messages.document.contentsLabel}>
                    <h2 className="document-toc__title">{messages.document.contents}</h2>
                    <nav className="document-toc__nav" ref={navigationRef}>
                        {tableOfContents.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={item.id === activeBlockId
                                    ? "document-toc__link document-toc__link--active"
                                    : "document-toc__link"}
                                aria-current={item.id === activeBlockId ? "location" : undefined}
                                ref={(element) => {
                                    if (element) navigationItemRefs.current[item.id] = element;
                                    else delete navigationItemRefs.current[item.id];
                                }}
                                onClick={() => scrollToBlock(item.id)}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </aside>

                <article className="document-viewer">
                    {documentData.blocks.map((block) => {
                        if (block.type === "heading") {
                            const HeadingTag = block.level === 1 ? "h1" : "h2";
                            const headingClass = block.level === 1
                                ? "document-viewer__heading"
                                : "document-viewer__subheading";

                            return (
                                <HeadingTag
                                    key={block.id}
                                    id={block.id}
                                    className={blockClassName(headingClass, block.id)}
                                >
                                    {block.text}
                                </HeadingTag>
                            );
                        }

                        if (block.type === "paragraph") {
                            return (
                                <p
                                    key={block.id}
                                    id={block.id}
                                    className={blockClassName("document-viewer__paragraph", block.id)}
                                >
                                    {block.text}
                                </p>
                            );
                        }

                        if (block.type === "list") {
                            return (
                                <ol
                                    key={block.id}
                                    id={block.id}
                                    className={blockClassName("document-viewer__list", block.id)}
                                >
                                    {block.items.map((item) => <li key={item}>{item}</li>)}
                                </ol>
                            );
                        }

                        if (block.type === "page") {
                            return (
                                <section
                                    key={block.id}
                                    id={block.id}
                                    className={blockClassName("document-viewer__page", block.id)}
                                >
                                    <h2 className="document-viewer__page-title">{interpolate(messages.document.page, { number: block.pageNumber })}</h2>
                                    <pre className="document-viewer__page-text">{block.text}</pre>
                                </section>
                            );
                        }

                        if (block.type === "table") {
                            return (
                                <div
                                    key={block.id}
                                    id={block.id}
                                    className={blockClassName("document-viewer__table-wrapper", block.id)}
                                >
                                    <table>
                                        <tbody>
                                            {block.rows.map((row, rowIndex) => (
                                                <tr key={`${block.id}-row-${rowIndex}`}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={`${block.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        }

                        if (block.type === "section") {
                            return (
                                <section
                                    key={block.id}
                                    id={block.id}
                                    className={blockClassName("document-viewer__section", block.id)}
                                >
                                    <h2 className="document-viewer__subheading">
                                        {block.number}. {block.title}
                                    </h2>
                                    <div className="document-viewer__text">
                                        {splitSectionText(block.text).map((paragraph) => (
                                            <p className="document-viewer__paragraph" key={paragraph}>
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                    {block.keywords?.length > 0 && (
                                        <div className="document-viewer__keywords">
                                            {block.keywords.map((keyword) => (
                                                <span key={keyword} className="document-viewer__keyword">{keyword}</span>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            );
                        }

                        return null;
                    })}
                </article>
            </div>

            {isScrollButtonVisible && (
                <button type="button" className="scroll-top-button" onClick={scrollToTop}>
                    {messages.buttons.scrollTop}
                </button>
            )}
        </main>
    );
}

export default InstructionPage;
