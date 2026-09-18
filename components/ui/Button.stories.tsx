import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HiOutlineArrowRight, HiOutlinePlus } from "react-icons/hi2";
import { Button } from "./Button";

/**
 * Every variant sits on one page on purpose.
 *
 * The five variants are the whole reason this component exists, and the thing
 * worth checking is that they still read as one family. That is a comparison,
 * not five separate looks, so AllVariants is the story to open first.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Apply now",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
};

/**
 * The three sizes stacked, which is where the text-size toolbar earns its
 * keep: padding is rem and the 44px touch-target floor is not, so at 125% the
 * small button stops being the one the floor applies to.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} leftIcon={<HiOutlinePlus />}>
        Post a job
      </Button>
      <Button {...args} variant="outline" rightIcon={<HiOutlineArrowRight />}>
        See all jobs
      </Button>
    </div>
  ),
};

/** Loading swaps the label for a spinner, so the width changes. */
export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * Width is the surprise in this component: the default is `w-full md:w-auto`,
 * so a button with no fullWidth prop still fills its container below 768px.
 * Worth seeing next to the explicit fullWidth story rather than discovering
 * on a phone.
 */
export const FullWidth: Story = {
  args: { fullWidth: true },
};
