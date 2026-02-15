"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { PiTreeStructureLight } from "react-icons/pi";
import { searchSkills, ALL_SKILLS } from "@/lib/skills-data";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SkillsCardProps {
  skills: string[];
  onEdit: () => void;
}

interface SkillsEditProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

// ─── Skill Tag ──────────────────────────────────────────────────────────────────

function SkillTag({
  skill,
  onRemove,
}: {
  skill: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-sm font-medium">
      {skill}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
          aria-label={`Remove ${skill}`}
        >
          <HiOutlineXMark className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// ─── Skills Display (Read-only) ─────────────────────────────────────────────────

export const SkillsCard: React.FC<SkillsCardProps> = ({ skills, onEdit }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PiTreeStructureLight className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-gray-900">Skills</h3>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          aria-label={skills.length > 0 ? "Edit skills" : "Add skills"}
        >
          <HiOutlinePencilSquare className="text-base" />
          {skills.length > 0 ? "Edit" : "Add Skills"}
        </button>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <PiTreeStructureLight className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">No skills added yet</p>
          <p className="text-gray-400 text-xs">
            Click &quot;Add Skills&quot; above to add your first skill
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Skills Edit Form (for EditDialog) ──────────────────────────────────────────

export const SkillsEditForm: React.FC<SkillsEditProps> = ({
  skills,
  onSkillsChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Max skills allowed
  const MAX_SKILLS = 25;
  const isAtMax = skills.length >= MAX_SKILLS;

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.trim()) {
      const results = searchSkills(inputValue, skills, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, skills]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted suggestion into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll("li");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (!trimmed) return;
      if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
      if (isAtMax) return;

      onSkillsChange([...skills, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [skills, onSkillsChange, isAtMax],
  );

  const removeSkill = useCallback(
    (skillToRemove: string) => {
      onSkillsChange(skills.filter((s) => s !== skillToRemove));
      inputRef.current?.focus();
    },
    [skills, onSkillsChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        addSkill(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Show popular suggestions when input is focused but empty
  const handleFocus = () => {
    if (!inputValue.trim() && skills.length === 0) {
      // Show a curated starter set
      const starters = ALL_SKILLS.slice(0, 8).filter(
        (s) => !skills.includes(s),
      );
      setSuggestions(starters);
      setShowSuggestions(starters.length > 0);
    } else if (inputValue.trim()) {
      setShowSuggestions(suggestions.length > 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current skills */}
      {skills.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Skills ({skills.length}/{MAX_SKILLS})
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillTag
                key={skill}
                skill={skill}
                onRemove={() => removeSkill(skill)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input with autocomplete */}
      <div ref={containerRef} className="relative">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {skills.length > 0 ? "Add More Skills" : "Add Skills"}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            disabled={isAtMax}
            className="form-input pr-10"
            placeholder={
              isAtMax
                ? `Maximum ${MAX_SKILLS} skills reached`
                : "Type to search skills (e.g., Project Management)..."
            }
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="skills-suggestions"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `skill-option-${highlightedIndex}`
                : undefined
            }
            autoComplete="off"
          />
          {inputValue && !isAtMax && (
            <button
              type="button"
              onClick={() => addSkill(inputValue)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-primary-hover cursor-pointer"
              aria-label="Add skill"
              title="Add skill"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && (
          <ul
            id="skills-suggestions"
            ref={suggestionsRef}
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto py-1"
          >
            {suggestions.map((suggestion, idx) => (
              <li
                key={suggestion}
                id={`skill-option-${idx}`}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  highlightedIndex === idx
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => addSkill(suggestion)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-400">
        Type to search from our skills library, or enter your own custom skills.
        Press Enter or click + to add. Use Backspace to remove the last skill.
      </p>
    </div>
  );
};
