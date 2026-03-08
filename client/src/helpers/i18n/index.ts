import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pt from "./locales/pt.json";

const getDefaultLanguage = (): string => {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    return savedLanguage;
  }
  
  const labDefaultLanguage = localStorage.getItem("labDefaultLanguage");
  if (labDefaultLanguage) {
    return labDefaultLanguage;
  }
  
  return "en";
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        translation: pt,
      },
    },
    lng: getDefaultLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
  });

export const setLabDefaultLanguage = (language: string) => {
  localStorage.setItem("labDefaultLanguage", language);
};

export const getLabDefaultLanguage = (): string => {
  return localStorage.getItem("labDefaultLanguage") || "en";
};

export default i18n;
