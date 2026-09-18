import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  JobSeekingStatusBadge,
  type JobSeekingStatus,
} from "./JobSeekingStatusBadge";

/**
 * The status pill on a candidate's profile.
 *
 * Five tones that have to stay distinguishable from each other, which is a
 * comparison rather than five separate looks, so AllStatuses is the story
 * that matters. The dot is bg-current rather than an emoji, so it takes the
 * badge's own text colour, and the high-contrast toggle is the quickest way
 * to confirm that still holds.
 */
const meta = {
  title: "UI/JobSeekingStatusBadge",
  component: JobSeekingStatusBadge,
  args: { status: "actively_looking" },
  argTypes: {
    status: {
      control: "select",
      options: [
        "none",
        "actively_looking",
        "open_to_opportunities",
        "open_to_offers",
        "not_looking",
      ],
    },
  },
} satisfies Meta<typeof JobSeekingStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActivelyLooking: Story = {};

/**
 * `none` and `undefined` both render nothing at all, which is the correct
 * behaviour and an easy thing to break. An empty frame here is a pass.
 */
export const NoStatus: Story = {
  args: { status: "none" },
};

export const AllStatuses: Story = {
  render: () => {
    const statuses: JobSeekingStatus[] = [
      "actively_looking",
      "open_to_opportunities",
      "open_to_offers",
      "not_looking",
    ];
    return (
      <div className="flex flex-wrap items-center gap-3">
        {statuses.map((status) => (
          <JobSeekingStatusBadge key={status} status={status} />
        ))}
      </div>
    );
  },
};

/**
 * Where it actually lives: next to a name, at profile-header scale. The badge
 * is text-xs and the name is not, so the pair is worth seeing at extra large
 * rather than assuming they grow together.
 */
export const OnAProfileHeader: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-2xl font-bold text-gray-900">Margaret Chen</h2>
      <JobSeekingStatusBadge {...args} />
    </div>
  ),
};
