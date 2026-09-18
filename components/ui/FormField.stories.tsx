import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { FormField } from "./FormField";

/**
 * The plain text field, and the quickest look at fieldStyles.
 *
 * Every box in the product is meant to be FIELD_BASE, so if this and
 * CustomDropdown ever drift back into looking like different controls, these
 * two entries opened one after the other are where it shows.
 */
const meta = {
  title: "UI/FormField",
  component: FormField,
  args: {
    label: "Email address",
    name: "email",
    value: "",
    onChange: () => {},
    placeholder: "you@example.com",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["text", "email", "tel", "select"] },
    onChange: { control: false },
  },
  /**
   * The field is controlled, so a story that did not write `value` back would
   * look broken the moment anyone typed in it. Routing through useArgs rather
   * than local state also keeps the Controls panel honest: edit the value
   * there and the box updates, type in the box and the panel updates.
   */
  render: function Live(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return <FormField {...args} onChange={(value) => updateArgs({ value })} />;
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: { value: "margaret.chen@example.ca" },
};

export const Required: Story = {
  args: { required: true },
};

export const Optional: Story = {
  args: { optional: true, label: "Phone number", name: "phone", type: "tel" },
};

export const WithHelperText: Story = {
  args: { helperText: "We only use this to send application updates." },
};

/**
 * Error and helper are mutually exclusive by design, so this sets both. The
 * helper should vanish rather than stack underneath the message.
 */
export const WithError: Story = {
  args: {
    value: "not-an-address",
    error: "Enter a valid email address.",
    helperText: "We only use this to send application updates.",
  },
};

export const Disabled: Story = {
  args: { value: "locked@example.ca", disabled: true },
};

/**
 * type="select" is the one case that renders a native select. Everything else
 * in the product routes through CustomDropdown, so this is worth reading next
 * to that entry rather than on its own.
 */
export const SelectType: Story = {
  args: {
    type: "select",
    label: "Years of experience",
    name: "experience",
    placeholder: "Select a range",
    options: [
      { value: "0-2", label: "Less than 2 years" },
      { value: "2-5", label: "2 to 5 years" },
      { value: "5-10", label: "5 to 10 years" },
      { value: "10+", label: "More than 10 years" },
    ],
  },
};

/**
 * A stack, which is what a form actually is. FIELD_WRAPPER owns the gap
 * between fields, so this is the story that catches spacing drift at 125%.
 */
export const StackedForm: Story = {
  render: function StackedForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    return (
      <div className="max-w-xl">
        <FormField
          label="Full name"
          name="full_name"
          value={name}
          onChange={setName}
          placeholder="Margaret Chen"
          required
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
          helperText="We only use this to send application updates."
        />
        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="(416) 555-0134"
          optional
        />
      </div>
    );
  },
};
