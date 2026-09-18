import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardSkeleton, Skeleton } from "./Skeleton";
import { PANEL_SURFACE } from "./panelStyles";

/**
 * The loading bar, and the panel it usually sits inside.
 *
 * Skeleton itself takes CSS lengths rather than classes, which is the trap
 * worth seeing: a height in px stays put while the content it stands in for
 * grows with the text setting, so a skeleton built in px reserves the wrong
 * amount of space for anyone who has scaled their text. Switch to extra
 * large and compare the px and rem rows.
 */
const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  args: {
    width: "240px",
    height: "20px",
    borderRadius: "4px",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {};

export const Circle: Story = {
  args: { width: "3rem", height: "3rem", borderRadius: "9999px" },
};

/**
 * The same bar twice, once sized in px and once in rem. They match at normal
 * and separate at 125%, which is the whole argument for rem in a skeleton.
 */
export const PixelsVersusRem: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton width="240px" height="20px" />
        <span className="text-xs text-gray-500">20px tall, frozen</span>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton width="15rem" height="1.25rem" />
        <span className="text-xs text-gray-500">1.25rem tall, scales</span>
      </div>
    </div>
  ),
};

/**
 * CardSkeleton is the container only, and deliberately so. It shipped once
 * owning its own fixed bars, which is why twenty-seven loading.tsx files
 * hand-wrote the box instead of importing it: no two of them wanted the same
 * bars inside. Padding stays with the caller too, because Tailwind resolves
 * `p-6 p-5` by stylesheet order rather than by which one was appended last.
 */
export const Card: Story = {
  render: () => (
    <CardSkeleton className="max-w-md p-4 md:p-6">
      <div className="flex items-start gap-4">
        <Skeleton width="3rem" height="3rem" borderRadius="9999px" />
        <div className="flex-1">
          <Skeleton width="60%" height="1.25rem" className="mb-2" />
          <Skeleton width="90%" height="1rem" className="mb-1.5" />
          <Skeleton width="75%" height="1rem" />
        </div>
      </div>
    </CardSkeleton>
  ),
};

/**
 * The skeleton beside the panel it stands in for. They share PANEL_SURFACE,
 * so the border, radius and ground should be indistinguishable, and any
 * difference in height is space the reader will watch jump when the data
 * arrives.
 */
export const AgainstTheRealPanel: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      <CardSkeleton className="p-4 md:p-6">
        <Skeleton width="45%" height="1.25rem" className="mb-3" />
        <Skeleton width="100%" height="1rem" className="mb-1.5" />
        <Skeleton width="100%" height="1rem" className="mb-1.5" />
        <Skeleton width="60%" height="1rem" />
      </CardSkeleton>

      <div className={`${PANEL_SURFACE} p-4 md:p-6`}>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          About this role
        </h3>
        <p className="text-sm leading-relaxed text-gray-600">
          Receiving, sorting and staging inbound freight on the afternoon
          shift. Forklift certification is provided. Steel-toed boots
          required, everything else supplied.
        </p>
      </div>
    </div>
  ),
};

/** A list of them, which is how a loading route actually looks. */
export const ListOfCards: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <CardSkeleton key={i} className="p-4 md:p-6">
          <Skeleton width="55%" height="1.25rem" className="mb-3" />
          <Skeleton width="35%" height="0.875rem" className="mb-1.5" />
          <Skeleton width="45%" height="0.875rem" />
        </CardSkeleton>
      ))}
    </div>
  ),
};
