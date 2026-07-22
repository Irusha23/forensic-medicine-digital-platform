import React, { useState, useEffect, useRef } from 'react';

export interface Option {
  label: string;
  value: string;
  data?: any;
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string, opt?: Option) => void;
  options?: Option[]; // For static lists
  fetchOptions?: (query: string) => Promise<Option[]>; // For dynamic lists (API)
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  fetchOptions,
  placeholder = 'Select...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayOptions, setDisplayOptions] = useState<Option[]>(options || []);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Revert query to selected label if closed without selection
        setQuery(selectedLabel);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedLabel]);

  // Load initial label based on value (if value exists on mount)
  useEffect(() => {
    const initializeLabel = async () => {
      if (!value) {
        setSelectedLabel('');
        setQuery('');
        return;
      }
      
      if (options) {
        const found = options.find(o => o.value === value);
        if (found) {
          setSelectedLabel(found.label);
          setQuery(found.label);
        }
      } else if (fetchOptions) {
        // If we only have an ID but it's dynamic, we do an empty fetch to try and resolve it,
        // or we expect the parent to pass the correct label. To keep it simple, we just show the value
        // if we can't find it immediately. (In a perfect world, parent passes initial label or object).
        setSelectedLabel(value);
        setQuery(value);
      }
    };
    initializeLabel();
  }, [value, options]);

  // Handle debounced search for dynamic options
  useEffect(() => {
    if (!fetchOptions) {
      // Static filtering
      if (options) {
        setDisplayOptions(
          options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        );
      }
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchOptions(query);
        setDisplayOptions(results);
      } catch (error) {
        console.error('Failed to fetch options', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, fetchOptions, options]);

  const handleSelect = (option: Option) => {
    onChange(option.value, option);
    setSelectedLabel(option.label);
    setQuery(option.label);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <input
        type="text"
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          // If they clear the input, clear the value
          if (e.target.value === '') {
            onChange('');
            setSelectedLabel('');
          }
        }}
        onClick={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Loading...</div>
          ) : displayOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No results found</div>
          ) : (
            <ul>
              {displayOptions.map((opt, i) => (
                <li
                  key={`${opt.value}-${i}`}
                  className="p-2 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-gray-800"
                  onMouseDown={(e) => {
                    // use onMouseDown instead of onClick to fire before input onBlur (if we added it)
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
