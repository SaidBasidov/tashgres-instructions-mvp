import { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./languageContextStore.js";
import { languages, messages } from "./messages.js";

const STORAGE_KEY = "tashgres-selected-language";
function getInitialLanguage() {
  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return languages.some(({ id }) => id === storedLanguage) ? storedLanguage : "ru";
}

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguageState] = useState(getInitialLanguage);

  const setSelectedLanguage = useCallback((language) => {
    if (!languages.some(({ id }) => id === language)) return;
    setSelectedLanguageState(language);
    window.localStorage.setItem(STORAGE_KEY, language);
  }, []);

  useEffect(() => {
    const htmlLanguages = { ru: "ru", uzLatn: "uz-Latn", uzCyrl: "uz-Cyrl" };
    document.documentElement.lang = htmlLanguages[selectedLanguage];
  }, [selectedLanguage]);

  const value = useMemo(() => ({
    selectedLanguage,
    setSelectedLanguage,
    messages: messages[selectedLanguage],
  }), [selectedLanguage, setSelectedLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
