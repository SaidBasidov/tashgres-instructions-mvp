import { useEffect, useState } from "react";
import { getPublicFileUrl } from "../utils/getPublicFileUrl.js";
import "../styles/rich-document.css";

const blockedElements = "script, iframe, object, embed, link, meta, base, form, input, button, textarea, select";

function sanitizeBlockHtml(html, assetBasePath) {
  const template = document.createElement("template");
  template.innerHTML = html || "";
  template.content.querySelectorAll(blockedElements).forEach((element) => element.remove());

  template.content.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value.trim();

      if (attributeName.startsWith("on") || ["srcdoc", "data-original-src"].includes(attributeName)) {
        element.removeAttribute(attribute.name);
      }

      if (attributeName === "style" && /url\s*\(|expression\s*\(|javascript:/i.test(attributeValue)) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.hasAttribute("src")) {
      const source = element.getAttribute("src");
      const isLocalAsset = source?.startsWith("assets/");
      const resolvedSource = isLocalAsset
        ? getPublicFileUrl(`${assetBasePath}${source}`)
        : null;

      if (resolvedSource) element.setAttribute("src", resolvedSource);
      else element.removeAttribute("src");
    }

    if (element.hasAttribute("href")) {
      const href = element.getAttribute("href");
      if (!href?.startsWith("#")) element.removeAttribute("href");
    }

    if (element.tagName === "IMG") {
      element.setAttribute("loading", "lazy");
      element.setAttribute("decoding", "async");
    }
  });

  return template.innerHTML;
}

function RichDocumentRenderer({
  documentPath,
  activeBlockId,
  highlightedBlockId,
  printSelectedBlockIds,
  printContextBlockIds,
  onReady,
  loadingLabel,
  errorLabel,
}) {
  const [richDocument, setRichDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    const documentUrl = getPublicFileUrl(documentPath);

    setRichDocument(null);
    setError(null);

    fetch(documentUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((documentData) => {
        if (!isCurrent) return;

        const sanitizedBlocks = documentData.blocks.map((block) => ({
          ...block,
          sanitizedHtml: sanitizeBlockHtml(block.html, documentData.assetBasePath || ""),
        }));
        setRichDocument({ ...documentData, blocks: sanitizedBlocks });
      })
      .catch((reason) => {
        if (isCurrent) setError(reason);
      });

    return () => { isCurrent = false; };
  }, [documentPath]);

  useEffect(() => {
    if (!richDocument) return undefined;
    const frameId = window.requestAnimationFrame(onReady);
    return () => window.cancelAnimationFrame(frameId);
  }, [onReady, richDocument]);

  if (error) return <p className="rich-document__status">{errorLabel}: {error.message}</p>;
  if (!richDocument) return <p className="rich-document__status">{loadingLabel}</p>;

  return (
    <article className="document-viewer rich-document" data-document-path={documentPath}>
      {richDocument.blocks.map((block) => {
        const className = [
          "rich-document__block",
          `rich-document__block--${block.type}`,
          "document-viewer__block",
          block.id === activeBlockId ? "document-viewer__block--active" : "",
          block.id === highlightedBlockId ? "document-viewer__block--search-highlight" : "",
          printSelectedBlockIds.has(block.id) ? "document-viewer__block--print-selected" : "",
          printContextBlockIds.has(block.id) ? "document-viewer__block--print-context" : "",
        ].filter(Boolean).join(" ");

        return (
          <div
            key={block.id}
            id={block.id}
            className={className}
            data-section-ids={block.sectionIds?.join(" ") || undefined}
            dangerouslySetInnerHTML={{ __html: block.sanitizedHtml }}
          />
        );
      })}
    </article>
  );
}

export default RichDocumentRenderer;
