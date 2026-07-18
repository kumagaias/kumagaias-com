import { createContext, useContext, useState } from "react";

export type Lang = "en" | "jp";

interface LangCtx {
  lang: Lang;
  toggleLang: () => void;
}

const LanguageContext = createContext<LangCtx>({ lang: "jp", toggleLang: () => {} });
const storageKey = "kumagaias.lang";

function detectLang(): Lang {
  if (typeof window === "undefined") return "jp";
  const saved = window.localStorage.getItem(storageKey);
  if (saved === "jp" || saved === "en") return saved;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => language.toLowerCase().startsWith("ja")) ? "jp" : "en";
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang);
  const toggleLang = () => {
    setLang((current) => {
      const next = current === "jp" ? "en" : "jp";
      window.localStorage.setItem(storageKey, next);
      return next;
    });
  };
  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
