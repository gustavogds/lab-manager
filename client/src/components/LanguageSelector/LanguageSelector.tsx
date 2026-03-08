import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaChevronDown } from "react-icons/fa";
import "./LanguageSelector.scss";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("language", languageCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <FaGlobe className="language-selector__icon" />
        <span className="language-selector__flag">{currentLanguage.flag}</span>
        <FaChevronDown className={`language-selector__arrow ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="language-selector__dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-selector__option ${lang.code === i18n.language ? "active" : ""}`}
              onClick={() => handleLanguageChange(lang.code)}
              type="button"
            >
              <span className="language-selector__option-flag">{lang.flag}</span>
              <span className="language-selector__option-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
