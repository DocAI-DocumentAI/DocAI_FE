"use client";
import React, { useState, useRef, useEffect } from "react";

// Type definition for option objects
interface Option {
  id: string;
  name: string;
  value: string;
  description?: string;
  color?: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedOptions: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  isLoading?: boolean;
}

// Icon for the close button on tags (lucide-react style)
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Icon for the checkmark on selected items (lucide-react style)
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Tag icon for visual enhancement
const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3"
  >
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

// Default colors for options without color
const DEFAULT_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
];

/**
 * A colorful tag-based multi-select component styled for dark theme
 */
const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedOptions,
  onChange,
  placeholder = "Select options...",
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      !selectedOptions.some((selected) => selected.id === option.id) &&
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: Option) => {
    const newSelected = selectedOptions.some((o) => o.id === option.id)
      ? selectedOptions.filter((o) => o.id !== option.id)
      : [...selectedOptions, option];

    onChange(newSelected);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const removeOption = (option: Option) => {
    onChange(selectedOptions.filter((o) => o.id !== option.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      searchTerm === "" &&
      selectedOptions.length > 0
    ) {
      removeOption(selectedOptions[selectedOptions.length - 1]);
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          toggleOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen, searchTerm]);

  const getOptionColor = (option: Option, index: number) => {
    return option.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popover-in {
          transform-origin: top;
          animation: popover-in 0.1s ease-out forwards;
        }
      `}</style>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-2 p-3 min-h-[48px] text-sm border border-gray-600 bg-gray-700 text-white rounded-lg shadow-sm cursor-text transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          {selectedOptions.map((option, index) => (
            <div
              key={option.id}
              className={`flex items-center gap-1.5 ${getOptionColor(
                option,
                index
              )} font-medium px-2 py-1 rounded-full text-xs`}
            >
              <TagIcon />
              {option.name}
              <button
                type="button"
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:ring-offset-1"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  removeOption(option);
                }}
              >
                <XIcon />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            className="flex-grow p-0 text-sm text-white placeholder-gray-400 bg-transparent border-none outline-none"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="w-4 h-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin" />
          )}
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 animate-popover-in">
            <ul className="p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.id}
                    className={`flex items-center justify-between p-3 cursor-pointer rounded-md transition-colors duration-150 ${
                      highlightedIndex === index
                        ? "bg-gray-600 text-white"
                        : "text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                    onClick={() => toggleOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          getOptionColor(option, index).split(" ")[0]
                        }`}
                      ></div>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        {option.description && (
                          <span className="text-sm text-gray-400">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedOptions.some((o) => o.id === option.id) && (
                      <CheckIcon />
                    )}
                  </li>
                ))
              ) : (
                <li className="p-3 text-center text-gray-400">
                  {isLoading ? "Loading..." : "No options found."}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
export type { Option };
