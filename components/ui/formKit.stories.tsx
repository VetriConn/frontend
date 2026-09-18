import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { JOB_TYPES, JOB_TYPE_LABELS, toOptions } from "@/lib/job-fields";
import {
  ChipGroup,
  FieldError,
  FieldLabel,
  HelperText,
  SelectField,
  ToggleRow,
  errorInputClasses,
  inputClasses,
} from "./formKit";

/**
 * The richest field kit in the product, and the one people should reach for
 * before hand-writing a label.
 *
 * It is a module of small parts rather than one component, so there is no
 * `component` here and each story stands for one export. They are grouped
 * because that is how they are used: a label, a box, a helper and an error
 * are one field, and the thing worth checking is whether they still line up
 * as one at 112% and 125%.
 */
const meta: Meta = {
  title: "UI/formKit",
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "pa", label: "Punjabi" },
  { value: "zh", label: "Mandarin" },
  { value: "tl", label: "Tagalog" },
  { value: "ar", label: "Arabic" },
] as const;

/**
 * The label alone, plain and required. RequiredMark is what the asterisk
 * comes from, and it carries a screen-reader-only "(required)" beside it, so
 * the marker is not the only thing saying so.
 */
export const Label: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FieldLabel htmlFor="plain">Job title</FieldLabel>
      <FieldLabel htmlFor="needed" required>
        Job title
      </FieldLabel>
    </div>
  ),
};

/** Helper below the box, and the error that replaces it. */
export const HelperAndError: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <FieldLabel htmlFor="salary">Salary range</FieldLabel>
        <input id="salary" className={inputClasses} placeholder="45,000 to 55,000" />
        <HelperText>
          Listings that state pay get roughly twice the applications.
        </HelperText>
      </div>
      <div>
        <FieldLabel htmlFor="salary-bad" required>
          Salary range
        </FieldLabel>
        <input id="salary-bad" className={errorInputClasses} defaultValue="lots" />
        <FieldError message="Enter a number or a range, for example 45,000 to 55,000." />
      </div>
    </div>
  ),
};

/**
 * SelectField is CustomDropdown with hideHeader and a (field, value)
 * signature, which is the adapter the job builder wanted. Worth opening
 * beside UI/CustomDropdown to confirm they are still the same control.
 */
export const Select: Story = {
  render: function Select() {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-sm">
        <SelectField
          id="employment_type"
          label="Employment type"
          value={value}
          onChange={setValue}
          required
          options={toOptions(JOB_TYPES, JOB_TYPE_LABELS)}
          helperText="Shown on the card candidates see first."
        />
      </div>
    );
  },
};

/**
 * Chips are real toggle buttons with aria-pressed and a 44px floor. The floor
 * is px and the padding is rem, so the row reflows at 125% rather than simply
 * getting taller, which is the kind of thing that only shows up on screen.
 */
export const Chips: Story = {
  render: function Chips() {
    const [selected, setSelected] = useState<string[]>(["en", "fr"]);
    const toggle = (value: string) =>
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    return (
      <div className="max-w-xl">
        <FieldLabel>Languages spoken</FieldLabel>
        <ChipGroup
          options={LANGUAGES}
          selected={selected}
          onToggle={toggle}
          ariaLabel="Languages spoken"
        />
      </div>
    );
  },
};

/**
 * The whole row is the label, so the tap target is the full width rather than
 * the checkbox. Two rows here because the description is optional and the
 * pair should still stack evenly without it.
 */
export const Toggles: Story = {
  render: function Toggles() {
    const [veteran, setVeteran] = useState(true);
    const [remote, setRemote] = useState(false);
    return (
      <div className="flex max-w-xl flex-col gap-3">
        <ToggleRow
          id="veteran_friendly"
          checked={veteran}
          onChange={setVeteran}
          label="Veteran friendly"
          description="Shows a badge on the listing and surfaces it in the veterans feed."
        />
        <ToggleRow
          id="remote_ok"
          checked={remote}
          onChange={setRemote}
          label="Can be done remotely"
        />
      </div>
    );
  },
};

/**
 * The kit assembled into the form it was extracted from. This is the entry to
 * open when the question is "does a whole step still hold together at extra
 * large", which no single-part story can answer.
 */
export const WholeStep: Story = {
  render: function WholeStep() {
    const [type, setType] = useState("full-time");
    const [languages, setLanguages] = useState<string[]>(["en"]);
    const [veteran, setVeteran] = useState(true);
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <FieldLabel htmlFor="title" required>
            Job title
          </FieldLabel>
          <input id="title" className={inputClasses} defaultValue="Warehouse Associate" />
          <HelperText>Say the role, not the seniority ladder.</HelperText>
        </div>

        <SelectField
          id="employment_type"
          label="Employment type"
          value={type}
          onChange={setType}
          required
          options={toOptions(JOB_TYPES, JOB_TYPE_LABELS)}
        />

        <div>
          <FieldLabel>Languages spoken</FieldLabel>
          <ChipGroup
            options={LANGUAGES}
            selected={languages}
            onToggle={(value) =>
              setLanguages((prev) =>
                prev.includes(value)
                  ? prev.filter((v) => v !== value)
                  : [...prev, value],
              )
            }
            ariaLabel="Languages spoken"
          />
        </div>

        <ToggleRow
          id="veteran_friendly_step"
          checked={veteran}
          onChange={setVeteran}
          label="Veteran friendly"
          description="Shows a badge on the listing and surfaces it in the veterans feed."
        />
      </div>
    );
  },
};
