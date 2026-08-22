"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  HiOutlineBold,
  HiOutlineItalic,
  HiOutlineUnderline,
  HiOutlineListBullet,
  HiOutlineNumberedList,
  HiOutlineLink,
} from "react-icons/hi2";
import { FIELD_BASE, fieldBorder } from "./fieldStyles";

/**
 * A lightweight rich-text editor for the job Brief — bold, italic, underline,
 * lists and links, no external editor library. It emits HTML; the server keeps
 * only a safe formatting subset (see the jobs-router sanitizer), so what's
 * stored is always safe to render.
 *
 * contentEditable is controlled carefully: the DOM is only re-seeded from the
 * `value` prop when it genuinely differs from what's on screen, so typing never
 * loses the caret.
 */

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
  hasError?: boolean;
  ariaLabel?: string;
}

interface ToolButton {
  cmd: string;
  arg?: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const BUTTONS: ToolButton[] = [
  { cmd: "bold", label: "Bold", Icon: HiOutlineBold },
  { cmd: "italic", label: "Italic", Icon: HiOutlineItalic },
  { cmd: "underline", label: "Underline", Icon: HiOutlineUnderline },
  { cmd: "insertUnorderedList", label: "Bulleted list", Icon: HiOutlineListBullet },
  { cmd: "insertOrderedList", label: "Numbered list", Icon: HiOutlineNumberedList },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write a brief…",
  id,
  hasError = false,
  ariaLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(!value);

  // Seed / re-seed the DOM only when the incoming value differs from what's
  // already rendered — otherwise every keystroke would reset the caret.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || "";
      setEmpty(!el.textContent?.trim());
    }
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    setEmpty(!el.textContent?.trim());
    onChange(el.innerHTML);
  };

  const run = (cmd: string, arg?: string) => {
    ref.current?.focus();
    // execCommand is deprecated but still the simplest cross-browser way to do
    // a small formatting toolbar without pulling in an editor framework.
    document.execCommand(cmd, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url && /^https?:\/\//i.test(url)) run("createLink", url);
  };

  return (
    <div>
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 px-2 py-1.5"
      >
        {BUTTONS.map(({ cmd, arg, label, Icon }) => (
          <button
            key={cmd}
            type="button"
            aria-label={label}
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(cmd, arg)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Add link"
          title="Add link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addLink}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
        >
          <HiOutlineLink className="h-5 w-5" />
        </button>
      </div>

      <div className="relative">
        <div
          id={id}
          ref={ref}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel ?? "Job brief"}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          className={`${FIELD_BASE} ${fieldBorder(hasError)} min-h-[9rem] rounded-t-none prose-editor`}
          style={{ whiteSpace: "pre-wrap" }}
        />
        {empty && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400 md:left-4 md:top-3 md:text-base"
          >
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
