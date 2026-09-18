import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { Pagination } from "./Pagination";

/**
 * Numbered page controls, with the middle collapsed to an ellipsis once there
 * are more than seven pages.
 *
 * The window logic is the interesting part and it is hard to eyeball from the
 * code: first and last are always reachable, plus the current page and its
 * two neighbours. The stories below sit at the start, middle and end of a
 * long board so the three shapes can be compared without clicking.
 *
 * The buttons are `min-w-11 h-11`, both px, inside a nav whose summary text
 * is rem. At 125% the numbers stay put while the sentence beside them grows,
 * which is worth seeing before someone reports it.
 */
const meta = {
  title: "UI/Pagination",
  component: Pagination,
  args: {
    page: 1,
    totalPages: 5,
    onPageChange: () => {},
  },
  argTypes: {
    onPageChange: { control: false },
  },
  render: function Live(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return <Pagination {...args} onPageChange={(page) => updateArgs({ page })} />;
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Seven or fewer pages renders every number, no ellipsis. */
export const ShortBoard: Story = {};

export const WithSummary: Story = {
  args: { page: 2, summary: "Showing 11 to 20 of 49" },
};

/** First page: previous is disabled, and the gap sits on the right. */
export const LongBoardAtStart: Story = {
  args: { page: 1, totalPages: 42, summary: "Showing 1 to 10 of 418" },
};

/** Middle: a gap either side, which is the widest the control ever gets. */
export const LongBoardInMiddle: Story = {
  args: { page: 21, totalPages: 42, summary: "Showing 201 to 210 of 418" },
};

/** Last page: next is disabled, and the gap moves to the left. */
export const LongBoardAtEnd: Story = {
  args: { page: 42, totalPages: 42, summary: "Showing 411 to 418 of 418" },
};

/**
 * One page renders nothing at all. An empty frame here is the pass, and it is
 * the case a caller most often forgets to check before wrapping this in a
 * border of its own.
 */
export const SinglePageRendersNothing: Story = {
  args: { totalPages: 1 },
};
