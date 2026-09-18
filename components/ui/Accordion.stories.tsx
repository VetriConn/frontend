import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useArgs } from "storybook/preview-api";
import { Accordion } from "./Accordion";

const ANSWER =
  "Yes. Vetriconn is free for people looking for work, and always will be. " +
  "Employers pay to post, which is what keeps the board running.";

/**
 * A disclosure row, controlled by its parent rather than owning its own open
 * state.
 *
 * The panel opens by transitioning grid-template-rows from 0fr to 1fr, which
 * reaches the content's real height without measuring anything in JS. That
 * makes it worth watching rather than reading about, particularly at extra
 * large where the content is taller and the transition has further to go. The
 * content also stays mounted while collapsed, so find-in-page and screen
 * readers still reach it.
 *
 * `className` carries the whole surface here, exactly as the FAQ section
 * passes it, because the component itself only owns the disclosure behaviour.
 */
const meta = {
  title: "UI/Accordion",
  component: Accordion,
  args: {
    className: "bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-0 w-full hover:shadow-md",
    title: "Is Vetriconn free for job seekers?",
    symbol: <HiOutlineChevronDown className="h-4 w-4" />,
    content: ANSWER,
    open: false,
    onToggle: () => {},
  },
  argTypes: {
    onToggle: { control: false },
    symbol: { control: false },
    children: { control: false },
  },
  render: function Live(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <div className="max-w-3xl">
        <Accordion {...args} onToggle={() => updateArgs({ open: !args.open })} />
      </div>
    );
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  args: { open: true },
};

/**
 * A long answer, because the 0fr to 1fr transition is the only part of this
 * component that can surprise you, and it surprises you on height.
 */
export const LongAnswer: Story = {
  args: {
    open: true,
    title: "What happens after I apply?",
    content:
      "Your application goes straight to the employer, who sees your profile " +
      "as you have written it. Most employers on the board reply within a " +
      "week. You can track everything under Applied Jobs, and if you saved a " +
      "draft part way through, it waits for you under Application Drafts " +
      "rather than disappearing. Nothing is shared with anyone else, and no " +
      "recruiter can contact you unless you have said you are open to it.",
  },
};

/**
 * The group, which is how it ships: one open at a time, and the FAQ section
 * owns which. Worth opening at extra large to see whether the stack still
 * reads as a list rather than a wall.
 */
export const Group: Story = {
  render: function Group() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const faqs = [
      { q: "Is Vetriconn free for job seekers?", a: ANSWER },
      {
        q: "Do I need a resume to apply?",
        a: "No. Your Vetriconn profile is enough for most listings, and you can attach a resume later if an employer asks for one.",
      },
      {
        q: "Can I make my profile larger to read?",
        a: "Yes. The accessibility panel scales the whole site, and every page honours it, including this one.",
      },
    ];
    return (
      <div className="flex max-w-3xl flex-col gap-5">
        {faqs.map((faq, index) => (
          <Accordion
            key={faq.q}
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-0 shadow-sm hover:shadow-md"
            title={faq.q}
            symbol={<HiOutlineChevronDown className="h-4 w-4" />}
            content={faq.a}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    );
  },
};
