import { createContext, useContext, useEffect, useState } from 'react';
import { translations, type TranslationKey } from '../translations';

export type Language = 'en' | 'fr' | 'ar';

export type { TranslationKey };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations['en'];
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved as Language) || 'en';
    });

    const isRTL = language === 'ar';

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language, isRTL]);

    const value = {
        language,
        setLanguage,
        t: translations[language] as unknown as typeof translations['en'],
        isRTL,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
