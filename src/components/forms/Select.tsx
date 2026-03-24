import React, { useState, useRef, useEffect } from 'react';
import { SelectOption } from '../../types/forms.types';

type SelectProps = {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
  name?: string;
  id?: string;
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  disabled = false,
  className = '',
  hasError,
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
    }
  };

  const borderColor = hasError ? 'border-red-300' : 'border-gray-300';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        name={name}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <ul 
            role="listbox"
            className="overflow-y-auto max-h-48"
            aria-labelledby={id}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 text-center">No options found</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    option.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : focusedIndex === index || option.value === value
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
