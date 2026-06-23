export function getPublicFileUrl(relativePath) {
  if (!relativePath) return null;

  const path = String(relativePath).trim();
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.split("/").includes("..")) {
    return null;
  }

  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, "")}/`;
  const normalizedPath = path.replace(/^(?:\.\/|\/)+/, "");

  return `${normalizedBaseUrl}${normalizedPath}`;
}
