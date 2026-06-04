import { documents } from "../data/documents";
import { useEffect } from "react";

function InstructionPage({
    selectedDocumentId,
    targetBlockId,
    setCurrentPage,
}) {
    const documentData = documents.find(
        (document) => document.id === selectedDocumentId
    );

    useEffect(() => {
        if (!targetBlockId) return;

        const element = document.getElementById(targetBlockId);

        if (element) {
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 300);

        }
    }, [targetBlockId]);

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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

    if (!documentData) {
        return (
            <main className="instruction-page">
                <section className="instruction-panel">
                    <h2 className="instruction-panel__title">Документ не найден</h2>
                    <p className="instruction-panel__description">
                        Выбранный документ отсутствует в mock-базе.
                    </p>
                </section>

                <button onClick={() => setCurrentPage("search")}>Назад</button>
            </main>
        );
    }

    return (
        <main className="instruction-page">
            <button onClick={() => setCurrentPage("search")}>Назад</button>

            <section className="instruction-panel">
                <p>{documentData.code}</p>
                <h2 className="instruction-panel__title">{documentData.title}</h2>
                <p className="instruction-panel__description">
                    Источник: {documentData.sourceFile}
                </p>
            </section>

            <article className="document-viewer">
                {documentData.blocks.map((block) => {
                    const isTarget = block.id === targetBlockId;

                    if (block.type === "heading") {
                        if (block.level === 1) {
                            return (
                                <h1
                                    key={block.id}
                                    id={block.id}
                                    className={
                                        isTarget
                                            ? "document-viewer__heading document-viewer__block--highlighted"
                                            : "document-viewer__heading"
                                    }
                                >
                                    {block.text}
                                </h1>
                            );
                        }

                        return (
                            <h2
                                key={block.id}
                                id={block.id}
                                className={
                                    isTarget
                                        ? "document-viewer__subheading document-viewer__block--highlighted"
                                        : "document-viewer__subheading"
                                }
                            >
                                {block.text}
                            </h2>
                        );
                    }

                    if (block.type === "paragraph") {
                        return (
                            <p
                                key={block.id}
                                id={block.id}
                                className={
                                    isTarget
                                        ? "document-viewer__paragraph document-viewer__block--highlighted"
                                        : "document-viewer__paragraph"
                                }
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
                                className={
                                    isTarget
                                        ? "document-viewer__list document-viewer__block--highlighted"
                                        : "document-viewer__list"
                                }
                            >
                                {block.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ol>
                        );
                    }

                    if (block.type === "page") {
                        return (
                            <section
                                key={block.id}
                                id={block.id}
                                className={
                                    isTarget
                                        ? "document-viewer__page document-viewer__block--highlighted"
                                        : "document-viewer__page"
                                }
                            >
                                <h3 className="document-viewer__page-title">
                                    Страница {block.pageNumber}
                                </h3>

                                <pre className="document-viewer__page-text">
                                    {block.text}
                                </pre>
                            </section>
                        );
                    }

                    if (block.type === "section") {
                        return (
                            <section
                                key={block.id}
                                id={block.id}
                                className={
                                    isTarget
                                        ? "document-viewer__section document-viewer__block--highlighted"
                                        : "document-viewer__section"
                                }
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
                                            <span key={keyword} className="document-viewer__keyword">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    }

                    return null;
                })}
            </article>
        </main>
    );
}

export default InstructionPage;