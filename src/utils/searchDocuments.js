import Fuse from "fuse.js";
import { loadAllDocuments } from "../data/loadDocuments.js";
import { getLocalizedDocument } from "../data/documentTranslations.js";

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .trim();
}

function getBlockText(block) {
  if (block.text) return block.text;
  if (block.items) return block.items.join(" ");
  if (block.rows) return block.rows.flat().join(" ");
  return "";
}

function getSearchableBlocks(documents, language) {
  return documents.flatMap((document) =>
    document.blocks.map((block) => {
      const blockText = getBlockText(block);
      const blockKeywords = block.keywords?.join(" ") || "";
      const documentKeywords = document.searchMetadata?.[language]?.keywords?.join(" ") || "";
      const documentAliases = document.searchMetadata?.[language]?.aliases?.join(" ") || "";

      return {
        documentId: document.id,
        documentCode: document.code,
        documentTitle: document.title,

        blockId: block.id,
        blockType: block.type,
        blockNumber: block.number || "",
        blockTitle: block.title || "",
        blockText,
        blockKeywords,
        documentKeywords,
        documentAliases,

        normalizedDocumentTitle: normalize(document.title),
        normalizedDocumentCode: normalize(document.code),
        normalizedBlockTitle: normalize(block.title || ""),
        normalizedBlockText: normalize(blockText),
        normalizedBlockKeywords: normalize(blockKeywords),
        normalizedDocumentKeywords: normalize(documentKeywords),
        normalizedDocumentAliases: normalize(documentAliases),
      };
    })
  );
}

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 3,
  keys: [
    {
      name: "documentTitle",
      weight: 0.4,
    },
    {
      name: "blockTitle",
      weight: 0.3,
    },
    {
      name: "blockKeywords",
      weight: 0.15,
    },
    {
      name: "blockText",
      weight: 0.1,
    },
    {
      name: "documentCode",
      weight: 0.05,
    },
    {
      name: "documentKeywords",
      weight: 0.1,
    },
    {
      name: "documentAliases",
      weight: 0.1,
    },
  ],
};

function getExactMatchScore(block, normalizedQuery) {
  if (block.normalizedDocumentTitle.includes(normalizedQuery)) {
    return 0.01;
  }

  if (block.normalizedBlockTitle.includes(normalizedQuery)) {
    return 0.05;
  }

  if (block.normalizedBlockKeywords.includes(normalizedQuery)) {
    return 0.08;
  }

  if (block.normalizedBlockText.includes(normalizedQuery)) {
    return 0.12;
  }

  if (block.normalizedDocumentCode.includes(normalizedQuery)) {
    return 0.15;
  }

  if (block.normalizedDocumentKeywords.includes(normalizedQuery)) {
    return 0.09;
  }

  if (block.normalizedDocumentAliases.includes(normalizedQuery)) {
    return 0.1;
  }

  return null;
}

function getExactResults(searchableBlocks, normalizedQuery) {
  return searchableBlocks
    .map((block) => {
      const exactScore = getExactMatchScore(block, normalizedQuery);

      if (exactScore === null) {
        return null;
      }

      return {
        ...block,
        score: exactScore,
        matchType: "exact",
      };
    })
    .filter(Boolean);
}

function getFuseResults(fuse, query) {
  return fuse.search(query).map((result) => ({
    ...result.item,
    score: result.score ?? 1,
    matchType: "fuzzy",
  }));
}

function removeDuplicates(results) {
  const resultMap = new Map();

  results.forEach((result) => {
    const resultKey = `${result.documentId}:${result.blockId}`;
    const existingResult = resultMap.get(resultKey);

    if (!existingResult || result.score < existingResult.score) {
      resultMap.set(resultKey, result);
    }
  });

  return Array.from(resultMap.values());
}

const searchIndexPromises = new Map();

async function getSearchIndex(language) {
  if (!searchIndexPromises.has(language)) {
    searchIndexPromises.set(language, loadAllDocuments().then((documents) => {
      const localizedDocuments = documents
        .map((documentData) => getLocalizedDocument(documentData, language))
        .filter((documentData) => documentData?.translationAvailable && documentData.blocks);
      const searchableBlocks = getSearchableBlocks(localizedDocuments, language);

      return {
        searchableBlocks,
        searchableDocumentCount: localizedDocuments.length,
        fuse: new Fuse(searchableBlocks, fuseOptions),
      };
    }));
  }

  return searchIndexPromises.get(language);
}

export async function getSearchableDocumentCount(language = "ru") {
  const { searchableDocumentCount } = await getSearchIndex(language);
  return searchableDocumentCount;
}

export async function searchDocuments(query, language = "ru") {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalize(trimmedQuery);

  if (!normalizedQuery) {
    return { results: [], searchableDocumentCount: 0 };
  }

  const { searchableBlocks, searchableDocumentCount, fuse } = await getSearchIndex(language);
  const exactResults = getExactResults(searchableBlocks, normalizedQuery);
  const fuzzyResults = getFuseResults(fuse, trimmedQuery);

  const mergedResults = removeDuplicates([...exactResults, ...fuzzyResults]);

  const results = mergedResults.sort((a, b) => {
    if (a.matchType === "exact" && b.matchType !== "exact") return -1;
    if (a.matchType !== "exact" && b.matchType === "exact") return 1;

    return a.score - b.score;
  });

  return { results, searchableDocumentCount };
}
