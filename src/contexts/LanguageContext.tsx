import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import no from '@/locales/no';
import en from '@/locales/en';

export type Language = 'en' | 'no';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Both dictionaries are bundled with the app rather than imported on demand.
// They are ~30 kB each and every visible string on first paint comes from
// them: loading them asynchronously meant the whole page rendered raw keys
// ("hero.title", "nav.home", ...) for the first few hundred milliseconds, and
// longer on a slow connection. Bundling them also makes switching language
// synchronous, so there is no window where the page is half-translated.
const DICTIONARIES: Record<Language, Record<string, string>> = { no, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

const readInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('language');
    if (saved === 'no' || saved === 'en') return saved;
  } catch {
    // Private modes can throw on storage access; fall through to the default.
  }
  // Norwegian is the primary market - only open in English when the browser
  // explicitly asks for it.
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'no';
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch {
      // Not being able to remember the choice is not worth breaking the page.
    }
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    const dictionary = DICTIONARIES[language];
    return {
      language,
      setLanguage,
      t: (key: string) => dictionary[key] ?? key,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
