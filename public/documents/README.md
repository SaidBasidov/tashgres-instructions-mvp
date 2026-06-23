# Original document files

Original and preview files are stored by document ID:

```text
public/documents/
└── document-id/
    ├── original.doc
    ├── original.docx
    ├── original.pdf
    └── preview.pdf
```

Rules:

- Keep the original file unchanged.
- A stored filename may be standardized as `original.ext`; the user-facing name belongs in document metadata.
- A DOC or DOCX document may additionally provide `preview.pdf` for browser viewing.
- For a PDF document, `original.pdf` may also be used as its preview file.
- Files are optional. Missing original or preview files must not prevent the web document from opening.
- Do not add a path to document metadata until the corresponding file actually exists.
