import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import {
  JOB_TYPES,
  JOB_TYPE_LABELS,
  PROVINCES,
  toOptions,
} from "@/lib/job-fields";
import { CustomDropdown } from "./CustomDropdown";
import { FIELD_BASE, FIELD_LABEL, fieldBorder } from "./fieldStyles";
import { JOB_SEEKING_STATUS_OPTIONS } from "./JobSeekingStatusBadge";

/**
 * The product's select. Native selects are not used anywhere a person sees,
 * so this is the control that has to hold up.
 *
 * Two things here are worth watching at a scaled text size rather than
 * reasoning about. The menu is portaled to <body> and positioned from the
 * trigger's measured bottom edge, because the trigger is rem all the way down
 * and stands 50px tall at 100%, 56px at 112% and 62px at 125%. And the menu
 * only grows a search box past eight options, so the short and long stories
 * are genuinely different components to look at.
 */
const meta = {
  title: "UI/CustomDropdown",
  component: CustomDropdown,
  args: {
    name: "job_type",
    label: "Job type",
    placeholder: "Select a job type",
    value: "",
    onChange: () => {},
    // The shared vocabulary, not a plausible-looking copy of it. Seven job
    // types is also one short of the threshold where the menu grows a search
    // box, which is what makes the long-list story below a different thing.
    options: toOptions(JOB_TYPES, JOB_TYPE_LABELS),
  },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
  },
  render: function Live(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <div className="max-w-sm">
        <CustomDropdown {...args} onChange={(value) => updateArgs({ value })} />
      </div>
    );
  },
} satisfies Meta<typeof CustomDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Selected: Story = {
  args: { value: "part-time" },
};

/**
 * Past the eight-option threshold, so the menu grows a search box and a row
 * above the list. Open it at 125% to see where the top of the menu lands
 * relative to the trigger, which is the bug this component was fixed for.
 */
export const LongListWithSearch: Story = {
  args: {
    name: "province",
    label: "Province",
    placeholder: "Select a province",
    options: PROVINCES.map((p) => ({ value: p.code, label: p.name })),
  },
};

/**
 * Node labels, which is the reason `searchText` exists: the option renders a
 * badge, the trigger renders the plain text, and typing matches the plain
 * text. Choosing a status previews the badge the profile will show.
 */
export const NodeLabels: Story = {
  args: {
    name: "job_seeking_status",
    label: "Job seeking status",
    placeholder: "Select a status",
    value: "actively_looking",
    options: JOB_SEEKING_STATUS_OPTIONS,
  },
};

export const WithHelperText: Story = {
  args: { helperText: "Candidates filter on this, so pick the closest match." },
};

export const WithError: Story = {
  args: { required: true, error: "Choose a job type before continuing." },
};

export const Disabled: Story = {
  args: { value: "contract", disabled: true },
};

/**
 * hideHeader is what SelectField in formKit passes. Without it the menu wears
 * a solid primary bar repeating the placeholder, which suits a standalone
 * filter and reads as shouting inside a dense form.
 */
export const HeaderHidden: Story = {
  args: { hideHeader: true },
};

/**
 * A text input and a dropdown in the same row, which is the comparison
 * fieldStyles was written to settle. If the two boxes stop matching on
 * padding, radius, border or focus treatment, it is visible here first.
 */
export const BesideATextInput: Story = {
  render: function BesideATextInput(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="keyword"
            className={FIELD_LABEL}
          >
            Keyword
          </label>
          <input
            id="keyword"
            type="text"
            placeholder="Warehouse, driver, security"
            // The tokens, not a copy of them. A hand-written box here would
            // always match, which would make the comparison worthless.
            className={`${FIELD_BASE} ${fieldBorder(false)}`}
          />
        </div>
        <CustomDropdown {...args} onChange={(value) => updateArgs({ value })} />
      </div>
    );
  },
};
