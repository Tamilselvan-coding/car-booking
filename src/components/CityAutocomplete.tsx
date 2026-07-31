'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  type LocationSuggestion,
  normalizeLocationSearch,
  searchLocalLocations,
  searchRemoteLocations,
} from '../content';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: LocationSuggestion | null) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Text input with a live, type-ahead suggestion dropdown drawn from the
 * local city/landmark list plus live address search. Supports mouse click
 * and keyboard (arrow/enter/esc).
 */
export function CityAutocomplete({ value, onChange, onSelect, label, placeholder, required = false }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [remoteSuggestions, setRemoteSuggestions] = useState<LocationSuggestion[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const localSuggestions = useMemo(() => searchLocalLocations(value), [value]);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 3) {
      setRemoteSuggestions([]);
      setRemoteLoading(false);
      setRemoteError(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setRemoteLoading(true);
      setRemoteError(false);

      searchRemoteLocations(query, controller.signal)
        .then((results) => setRemoteSuggestions(results))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setRemoteSuggestions([]);
          setRemoteError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setRemoteLoading(false);
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();

    return [...localSuggestions, ...remoteSuggestions]
      .filter((suggestion) => {
        const key = normalizeLocationSearch(suggestion.label);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [localSuggestions, remoteSuggestions]);

  const showDropdown =
    open && (suggestions.length > 0 || remoteLoading || remoteError || value.trim().length >= 3);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLocation = (location: LocationSuggestion) => {
    onChange(location.label);
    onSelect?.(location);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault();
        selectLocation(suggestions[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        className="h-12 w-full rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        required={required}
        onChange={(event) => {
          onChange(event.target.value);
          onSelect?.(null);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {showDropdown ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-56 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-xl"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.label} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectLocation(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold transition ${
                  index === activeIndex ? 'bg-teal-50 text-teal-700' : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="min-w-0">
                  <span className="block truncate">{suggestion.label}</span>
                  <span className="block text-xs font-medium text-zinc-500">
                    {suggestion.detail} - {suggestion.city}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {remoteLoading ? (
            <li className="px-3 py-2 text-xs font-bold text-zinc-500">Searching addresses...</li>
          ) : null}
          {!remoteLoading && remoteError ? (
            <li className="px-3 py-2 text-xs font-bold text-red-600">Live address search unavailable.</li>
          ) : null}
          {!remoteLoading && !remoteError && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-xs font-bold text-zinc-500">No address found.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
