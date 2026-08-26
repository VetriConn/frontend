"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiXMark, HiPlus } from "react-icons/hi2";
import { searchSkills, ALL_SKILLS } from "@/lib/skills-data";
import { FIELD_LABEL, FIELD_HELPER, FIELD_ERROR, fieldBorder } from "./fieldStyles";

/**
 * A pill multi-select for skills. Suggestions come from the shared skills
 * collection (lib/skills-data), and anything the user types that isn't already
 * there can be added as a custom skill — which is how the collection grows.
 * Emits a plain string[]; the caller decides how to store it.
 *
 * Kept dependency-free and themed so it can stand in for a native control
 * anywhere skills are collected (job builder, profile, screening).
 */

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  /** Cap the number of skills; omit for no cap. */
  max?: number;
  id?: string;
  /**
   * Optional async source (the shared backend collection). Its results are
   * merged ahead of the curated client list, so custom skills others have
   * added surface too. Omit to run purely on the client list.
   */
  fetchSuggestions?: (query: string) => Promise<string[]>;
}

export const SkillsInput: React.FC<SkillsInputProps> = ({
  value,
  onChange,
  label,
  helperText,
  error,
  placeholder = "Type to search skills…",
  max,
  id = "skills",
  fetchSuggestions,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [remote, setRemote] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  // The suggestion menu is portaled to <body> and positioned off this box, so
  // it overlays surrounding content (e.g. a modal's footer) instead of being
  // clipped by an ancestor's overflow or growing the layout.
  const boxRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const atMax = max !== undefined && value.length >= max;

  const selectedLower = useMemo(
    () => new Set(value.map((s) => s.toLowerCase())),
    [value],
  );

  // Pull matches from the shared backend collection (debounced), if wired.
  useEffect(() => {
    if (!fetchSuggestions) return;
    const q = query.trim();
    if (!q) {
      setRemote([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const results = await fetchSuggestions(q);
      if (!cancelled) setRemote(results);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, fetchSuggestions]);

  // Suggestions: backend collection first, then the curated client list,
  // deduped and with already-chosen skills removed. Capped at 8.
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const merged: string[] = [];
    const seen = new Set(value.map((s) => s.toLowerCase()));
    for (const s of [...remote, ...searchSkills(query, value, 8)]) {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(s);
      }
    }
    return merged.slice(0, 8);
  }, [query, value, remote]);

  // Offer a custom add when the typed value isn't an exact match anywhere.
  const trimmed = query.trim();
  const exactExists =
    !!trimmed &&
    (selectedLower.has(trimmed.toLowerCase()) ||
      ALL_SKILLS.some((s) => s.toLowerCase() === trimmed.toLowerCase()));
  const canAddCustom = !!trimmed && !exactExists && !atMax;

  // The menu is suggestions plus, optionally, the "Add …" row at the end.
  const menuCount = suggestions.length + (canAddCustom ? 1 : 0);

  // Keep the portaled menu pinned to the box. Recompute while it's open, and on
  // scroll/resize, so it tracks the input as pills wrap or the page moves.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const el = boxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, value.length, menuCount]);

  const addSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean || atMax) return;
    if (!selectedLower.has(clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setQuery("");
    setHighlight(0);
    inputRef.current?.focus();
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
    inputRef.current?.focus();
  };

  const commitHighlight = () => {
    if (highlight < suggestions.length) {
      addSkill(suggestions[highlight]);
    } else if (canAddCustom) {
      addSkill(trimmed);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (menuCount > 0) commitHighlight();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(menuCount - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && (
        <label htmlFor={id} className={FIELD_LABEL}>
          {label}
        </label>
      )}

      <div className="relative">
        <div
          ref={boxRef}
          className={`flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${fieldBorder(
            !!error,
          )}`}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-primary/20 px-2.5 py-1 text-sm font-medium text-primary"
            >
              {skill}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(skill);
                }}
                aria-label={`Remove ${skill}`}
                className="rounded-full p-0.5 hover:bg-primary/10"
              >
                <HiXMark className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            disabled={atMax}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlight(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            placeholder={
              atMax ? `Up to ${max} skills` : value.length ? "" : placeholder
            }
            aria-label="Search or add a skill"
            aria-expanded={open}
            role="combobox"
            aria-controls={`${id}-listbox`}
            className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {open && menuCount > 0 && typeof document !== "undefined" &&
          createPortal(
            <ul
              id={`${id}-listbox`}
              role="listbox"
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                width: coords.width,
                zIndex: 9999,
              }}
              className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            >
            {suggestions.map((s, i) => (
              <li key={s} role="option" aria-selected={highlight === i}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addSkill(s)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm ${
                    highlight === i
                      ? "bg-red-50 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
            {canAddCustom && (
              <li
                role="option"
                aria-selected={highlight === suggestions.length}
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addSkill(trimmed)}
                  onMouseEnter={() => setHighlight(suggestions.length)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                    highlight === suggestions.length
                      ? "bg-red-50 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <HiPlus className="h-4 w-4 shrink-0" />
                  Add &ldquo;{trimmed}&rdquo;
                </button>
              </li>
            )}
            </ul>,
            document.body,
          )}
      </div>

      {helperText && !error && <p className={FIELD_HELPER}>{helperText}</p>}
      {error && (
        <p className={FIELD_ERROR} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default SkillsInput;
