import Fuse from "fuse.js";
import { documents } from "../data/documents.js";

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .trim();
}

function getBlockText(block) {
  if (block.text) return block.text;
  if (block.items) return block.items.join(" ");
  return "";
}

function getSearchableBlocks() {
  return documents.flatMap((document) =>
    document.blocks.map((block) => {
      const blockText = getBlockText(block);
      const blockKeywords = block.keywords?.join(" ") || "";

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

        normalizedDocumentTitle: normalize(document.title),
        normalizedDocumentCode: normalize(document.code),
        normalizedBlockTitle: normalize(block.title || ""),
        normalizedBlockText: normalize(blockText),
        normalizedBlockKeywords: normalize(blockKeywords),
      };
    })
  );
}

const searchableBlocks = getSearchableBlocks();

const fuse = new Fuse(searchableBlocks, {
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
  ],
});

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

  return null;
}

function getExactResults(normalizedQuery) {
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

function getFuseResults(query) {
  return fuse.search(query).map((result) => ({
    ...result.item,
    score: result.score ?? 1,
    matchType: "fuzzy",
  }));
}

function removeDuplicates(results) {
  const resultMap = new Map();

  results.forEach((result) => {
    const existingResult = resultMap.get(result.blockId);

    if (!existingResult || result.score < existingResult.score) {
      resultMap.set(result.blockId, result);
    }
  });

  return Array.from(resultMap.values());
}

export function searchDocuments(query) {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalize(trimmedQuery);

  if (!normalizedQuery) {
    return [];
  }

  const exactResults = getExactResults(normalizedQuery);
  const fuzzyResults = getFuseResults(trimmedQuery);

  const mergedResults = removeDuplicates([...exactResults, ...fuzzyResults]);

  return mergedResults.sort((a, b) => {
    if (a.matchType === "exact" && b.matchType !== "exact") return -1;
    if (a.matchType !== "exact" && b.matchType === "exact") return 1;

    return a.score - b.score;
  });
}