import { lazy, Suspense, useEffect, useState } from "react";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage.js";

const SearchPage = lazy(() => import("../pages/SearchPage"));
const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const InstructionPage = lazy(() => import("../pages/InstructionPage"));

function readRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/search";
  const [path, queryString = ""] = hash.split("?");
  const documentMatch = path.match(/^\/documents\/([^/]+)$/);

  if (documentMatch) {
    return {
      page: "instruction",
      documentId: decodeURIComponent(documentMatch[1]),
      blockId: new URLSearchParams(queryString).get("block"),
    };
  }

  if (path === "/library") return { page: "admin" };
  return { page: "search" };
}

function navigate(path) {
  window.location.hash = path;
}

function App() {
  const [route, setRoute] = useState(readRoute);
  const { messages } = useLanguage();

  useEffect(() => {
    function handleRouteChange() {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    }

    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  return (
    <div className="app">
      <Header currentPage={route.page} navigate={navigate} />
      <div className={route.page === "instruction"
        ? "app__content app__content--document"
        : "app__content"}
      >
        <Suspense fallback={<p className="page-status">{messages.common.loading}</p>}>
          {route.page === "admin" ? (
            <AdminPanel navigate={navigate} />
          ) : route.page === "instruction" ? (
            <InstructionPage
              selectedDocumentId={route.documentId}
              targetBlockId={route.blockId}
              navigate={navigate}
            />
          ) : (
            <SearchPage navigate={navigate} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
