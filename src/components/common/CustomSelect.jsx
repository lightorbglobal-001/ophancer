import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - Classic, elevated dropdown replacing native browser <select>
 * Supports both flat options array and grouped options ({ label: string, options: [] }).
 * 
 * @param {string|number} value - Selected value
 * @param {function} onChange - Callback on selection (receives new value)
 * @param {Array} options - List of { value, label, icon } or grouped { group: string, options: [] }
 * @param {string} placeholder - Placeholder text
 * @param {ReactNode} icon - Optional leading icon
 * @param {string} variant - 'pill' (default, rounded-full) | 'form' (rounded-2xl/rounded-xl)
 * @param {string} className - Additional CSS classes for trigger container
 * @param {string} menuClassName - Additional CSS classes for dropdown panel
 * @param {boolean} disabled - Disabled state
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  icon = null,
  variant = 'pill',
  className = '',
  menuClassName = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Flatten options to easily look up current selected label
  const flatOptions = React.useMemo(() => {
    const list = [];
    options.forEach((item) => {
      if (item && item.options && Array.isArray(item.options)) {
        item.options.forEach((sub) => {
          if (typeof sub === 'object') {
            list.push(sub);
          } else {
            list.push({ value: sub, label: String(sub) });
          }
        });
      } else if (typeof item === 'object') {
        list.push(item);
      } else {
        list.push({ value: item, label: String(item) });
      }
    });
    return list;
  }, [options]);

  const selectedOption = flatOptions.find((o) => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (val) => {
    if (onChange) {
      // Support both raw value or synthetic event target for compatibility
      onChange(val);
    }
    setIsOpen(false);
  };

  const isFormVariant = variant === 'form';

  return (
    <div 
      ref={containerRef} 
      className={`relative inline-block text-left ${isOpen ? 'z-[100]' : 'z-20'} ${isFormVariant ? 'w-full' : 'w-full sm:w-auto'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center justify-between gap-2 transition-all outline-none select-none text-xs font-medium cursor-pointer ${
          isFormVariant
            ? 'w-full bg-[#F8F9FE] hover:bg-white focus:bg-white border border-[#EBEFF5] hover:border-[#6962F1]/50 focus:border-[#6962F1] rounded-2xl px-4 py-3 text-[#0E121B]'
            : 'w-full sm:w-auto bg-white hover:bg-[#F8F9FE] border border-[#EBEFF5] hover:border-[#6962F1]/60 focus:border-[#6962F1] rounded-full px-4 py-2.5 sm:py-3 text-[#0E121B] shadow-xs hover:shadow-sm'
        } ${isOpen ? 'border-[#6962F1] ring-2 ring-[#6962F1]/10 bg-white' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate text-left min-w-0 pr-1">
          {icon && (
            <span className="text-[#99A0AE] group-hover:text-[#6962F1] transition-colors shrink-0">
              {icon}
            </span>
          )}
          <span className="truncate font-semibold text-[#0E121B]">
            {displayLabel}
          </span>
        </div>

        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#99A0AE] group-hover:text-[#0E121B] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#6962F1]' : ''
          }`} 
        />
      </button>

      {/* Floating Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 z-[100] mt-1.5 min-w-[210px] w-full max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto rounded-2xl bg-white border border-[#E8ECF2] p-1.5 shadow-[0_16px_36px_rgba(14,18,27,0.16)] animate-scale-in origin-top scrollbar-thin ${menuClassName}`}
        >
          {options.map((item, idx) => {
            // Grouped Options (Optgroup equivalent)
            if (item && item.options && Array.isArray(item.options)) {
              return (
                <div key={item.group || idx} className="py-1">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#99A0AE] select-none">
                    {item.group}
                  </div>
                  <div className="space-y-0.5">
                    {item.options.map((subItem) => {
                      const opt = typeof subItem === 'object' ? subItem : { value: subItem, label: String(subItem) };
                      const isSelected = String(opt.value) === String(value);

                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl transition-colors text-left ${
                            isSelected
                              ? 'bg-[#EEF0FD] text-[#6962F1] font-bold'
                              : 'text-[#0E121B] hover:bg-[#F8F9FE] hover:text-[#6962F1]'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#6962F1] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Flat Option
            const opt = typeof item === 'object' ? item : { value: item, label: String(item) };
            const isSelected = String(opt.value) === String(value);

            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl transition-colors text-left ${
                  isSelected
                    ? 'bg-[#EEF0FD] text-[#6962F1] font-bold'
                    : 'text-[#0E121B] hover:bg-[#F8F9FE] hover:text-[#6962F1]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#6962F1] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
