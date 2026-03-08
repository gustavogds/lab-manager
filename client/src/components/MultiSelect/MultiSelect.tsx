import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import "./MultiSelect.scss";

export type Option = {
  id: number;
  name: string;
  email?: string;
  profile_image?: string | null;
};

interface MultiSelectProps<T extends Option = Option> {
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  singleSelect?: boolean;
  hideSearch?: boolean;
}

const MultiSelect = <T extends Option = Option>({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  label,
  disabled = false,
  singleSelect = false,
  hideSearch = false,
}: MultiSelectProps<T>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map((s) => s.id));

  const filteredOptions = options.filter((option) => {
    const isNotSelected = singleSelect || !selectedIds.has(option.id);
    const matchesSearch =
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  const handleSelect = (option: T) => {
    if (singleSelect) {
      onChange([option]);
      setIsOpen(false);
    } else {
      onChange([...selected, option]);
    }
    setSearchTerm("");
  };

  const handleRemove = (optionId: number) => {
    onChange(selected.filter((s) => s.id !== optionId));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="multi-select-wrapper" onClick={(e) => e.stopPropagation()}>
      {label && <label className="multi-select-label">{label}</label>}
      <div className="multi-select-container">
        <div 
          className={`multi-select-input ${singleSelect ? "single-select" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="selected-items">
            {selected.length > 0 ? (
              selected.map((item) => (
                <div key={item.id} className={`selected-item ${singleSelect ? "single" : ""}`}>
                  {item.profile_image && (
                    <img
                      src={item.profile_image}
                      alt={item.name}
                      className="item-avatar"
                    />
                  )}
                  <span>{item.name}</span>
                  {!singleSelect && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      disabled={disabled}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="placeholder">{placeholder}</span>
            )}
          </div>
          <div className="dropdown-arrow">▼</div>
        </div>

        {isOpen && !disabled && (
          <div className="multi-select-dropdown">
            {!hideSearch && (
              <input
                type="text"
                className="search-input"
                placeholder={t("Search...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            )}
            <div className="options-list">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`option-item ${selectedIds.has(option.id) ? "selected" : ""}`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.profile_image && (
                      <img
                        src={option.profile_image}
                        alt={option.name}
                        className="option-avatar"
                      />
                    )}
                    <div className="option-info">
                      <div className="option-name">{option.name}</div>
                      {option.email && (
                        <div className="option-email">{option.email}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-options">
                  {searchTerm
                    ? t("No results found")
                    : t("All users have already been added")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
