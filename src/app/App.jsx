import { useState } from "react";
import SearchPage from "../pages/SearchPage";
import AdminPanel from "../pages/AdminPanel";
import Header from "../components/Header";
import InstructionPage from "../pages/InstructionPage";


function App() {
  const [currentPage, setCurrentPage] = useState("search");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [targetBlockId, setTargetBlockId] = useState(null);

  return (
    <div className="app">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="app__content">
        {currentPage === "admin" ? <AdminPanel />
          : currentPage === "instruction" ? <InstructionPage
            selectedDocumentId={selectedDocumentId}
            targetBlockId={targetBlockId}
            setCurrentPage={setCurrentPage} />
            : <SearchPage
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setSelectedDocumentId={setSelectedDocumentId}
              setTargetBlockId={setTargetBlockId}
            />}
      </div>

    </div>
  );
}

export default App;