import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { SkillsInput } from "./SkillsInput";

/**
 * A pill multi-select for skills, dependency-free and themed to fieldStyles.
 *
 * Type into it: suggestions come from the shared client list, and anything
 * that is not already there can be added as a custom skill. The menu is
 * portaled to <body> and repositioned from the box's measured rect on every
 * scroll and resize, which is exactly the arrangement that goes wrong when
 * the box grows, so the story with many skills already selected is the one
 * worth opening at extra large.
 *
 * `fetchSuggestions` is left unset on purpose. It is the hook for the shared
 * backend collection, and wiring a fake one here would make the story a story
 * about the fake.
 */
const meta = {
  title: "UI/SkillsInput",
  component: SkillsInput,
  args: {
    id: "skills",
    label: "Skills",
    value: [],
    onChange: () => {},
  },
  argTypes: {
    onChange: { control: false },
    fetchSuggestions: { control: false },
  },
  render: function Live(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <div className="max-w-xl">
        <SkillsInput {...args} onChange={(value) => updateArgs({ value })} />
      </div>
    );
  },
} satisfies Meta<typeof SkillsInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSkills: Story = {
  args: { value: ["Forklift Operation", "Inventory Management", "WHMIS"] },
};

export const WithHelperText: Story = {
  args: {
    value: ["Customer Service"],
    helperText: "Add the ones you would be happy to be asked about.",
  },
};

export const WithError: Story = {
  args: { value: [], error: "Add at least one skill." },
};

/**
 * At the cap, which changes the component rather than just disabling it: the
 * input stops offering to add, and the custom-skill row disappears from the
 * menu.
 */
export const AtMaximum: Story = {
  args: {
    max: 3,
    value: ["Forklift Operation", "Inventory Management", "WHMIS"],
    helperText: "Three is the cap on this form.",
  },
};

/**
 * Enough pills to wrap onto several rows, which is when the portaled menu has
 * to keep up with a box that has changed height. Open the suggestions here at
 * 125% rather than trusting it.
 */
export const ManySkillsWrapping: Story = {
  args: {
    value: [
      "Forklift Operation",
      "Inventory Management",
      "WHMIS",
      "Customer Service",
      "Shipping and Receiving",
      "Order Picking",
      "Safety Inspection",
      "Team Leadership",
    ],
  },
};
