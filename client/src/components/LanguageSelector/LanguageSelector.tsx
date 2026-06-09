import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaChevronDown } from "react-icons/fa";
import "./LanguageSelector.scss";

// Inline SVG flags rather than emoji: Windows lacks the regional-indicator
// emoji glyphs and renders them as bare letter codes (e.g. "BR"), so the
// switcher looked broken there. SVGs render identically on every platform.
const BrazilFlag = () => (
  <svg viewBox="0 0 640 480" className="flag-svg" aria-hidden="true">
    <rect width="640" height="480" fill="#009b3a" />
    <path d="M320 48 592 240 320 432 48 240z" fill="#fedf00" />
    <circle cx="320" cy="240" r="96" fill="#002776" />
  </svg>
);

const USAFlag = () => (
  <svg viewBox="0 0 640 480" className="flag-svg" aria-hidden="true">
    <rect width="640" height="480" fill="#fff" />
    {[0, 2, 4, 6, 8, 10, 12].map((i) => (
      <rect
        key={i}
        y={(480 / 13) * i}
        width="640"
        height={480 / 13}
        fill="#b22234"
      />
    ))}
    <rect width="272" height={(480 / 13) * 7} fill="#3c3b6e" />
  </svg>
);

const languages = [
  { code: "en", name: "English", Flag: USAFlag },
  { code: "pt", name: "Português", Flag: BrazilFlag },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];
  const CurrentFlag = currentLanguage.Flag;

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
        <span className="language-selector__flag">
          <CurrentFlag />
        </span>
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
              <span className="language-selector__option-flag">
                <lang.Flag />
              </span>
              <span className="language-selector__option-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
