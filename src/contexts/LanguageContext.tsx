import { createContext, useContext, useState } from "react";

export type Lang = "en" | "jp";

interface LangCtx {
  lang: Lang;
  toggleLang: () => void;
}

const LanguageContext = createContext<LangCtx>({ lang: "jp", toggleLang: () => {} });
export const useLang = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("jp");
  const toggleLang = () => setLang((l) => (l === "jp" ? "en" : "jp"));
  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
