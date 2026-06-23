import { useEffect, useRef, useState } from "react";
import { getPublicFileUrl } from "../utils/getPublicFileUrl.js";

function DocumentActions({
  documentData,
  labels,
  sections,
  searchResultLabel,
  onPrintAll,
  onPrintSearchResult,
  onPrintSection,
}) {
  const originalUrl = getPublicFileUrl(documentData?.originalFile?.path);
  const previewUrl = getPublicFileUrl(documentData?.previewFile?.path);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const menuRootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isPrintMenuOpen) return undefined;

    function closeMenu({ restoreFocus = false } = {}) {
      setIsPrintMenuOpen(false);
      setIsSectionMenuOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    }

    function handlePointerDown(event) {
      if (!menuRootRef.current?.contains(event.target)) closeMenu();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") closeMenu({ restoreFocus: true });
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPrintMenuOpen]);

  function closeAndPrint(callback) {
    setIsPrintMenuOpen(false);
    setIsSectionMenuOpen(false);
    callback();
  }

  return (
    <div className="document-actions" aria-label={labels.actionsLabel}>
      {originalUrl && (
        <a className="document-actions__button" href={originalUrl} download={documentData.originalFile.name || true}>
          {labels.downloadOriginal}
        </a>
      )}

      {previewUrl && (
        <a className="document-actions__button" href={previewUrl} target="_blank" rel="noopener noreferrer">
          {labels.openPdf}
        </a>
      )}

      <div className="print-dropdown" ref={menuRootRef}>
        <button
          ref={triggerRef}
          className="document-actions__button document-actions__button--primary print-dropdown__trigger"
          type="button"
          aria-haspopup="menu"
          aria-expanded={isPrintMenuOpen}
          aria-label={isPrintMenuOpen ? `${labels.print}. ${labels.closePrintMenu}` : labels.print}
          onClick={() => {
            setIsPrintMenuOpen((isOpen) => !isOpen);
            if (isPrintMenuOpen) setIsSectionMenuOpen(false);
          }}
        >
          {labels.print} <span aria-hidden="true">▾</span>
        </button>

        {isPrintMenuOpen && (
          <div className="print-dropdown__menu" role="menu">
            <button type="button" role="menuitem" onClick={() => closeAndPrint(onPrintAll)}>
              {labels.printAllDocument}
            </button>

            {searchResultLabel && (
              <button type="button" role="menuitem" onClick={() => closeAndPrint(onPrintSearchResult)}>
                {labels.printSearchResult}: «{searchResultLabel}»
              </button>
            )}

            {sections.length > 0 && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={isSectionMenuOpen}
                  onClick={() => setIsSectionMenuOpen((isOpen) => !isOpen)}
                >
                  <span>{labels.printSelectSection}</span><span aria-hidden="true">›</span>
                </button>

                {isSectionMenuOpen && (
                  <div className="print-dropdown__sections" role="menu" aria-label={labels.printSelectSection}>
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        role="menuitem"
                        onClick={() => closeAndPrint(() => onPrintSection(section.id))}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentActions;
