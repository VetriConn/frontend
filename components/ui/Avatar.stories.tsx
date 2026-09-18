import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./Avatar";

/**
 * Profile picture or company logo, with initials as the fallback.
 *
 * This is the clearest component in the set for what the text-size toolbar is
 * for. `size` is a number of pixels, but it is emitted as rem, deliberately,
 * because a px avatar inside a rem-sized button drifts apart the moment
 * someone scales their text. Switch to extra large and the avatars should
 * grow by a quarter, not stay put.
 */
const meta = {
  title: "UI/Avatar",
  component: Avatar,
  args: {
    name: "Margaret Chen",
  },
  argTypes: {
    size: { control: { type: "number", min: 16, step: 4 } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const SingleName: Story = {
  args: { name: "Vetriconn" },
};

/**
 * Empty name falls back to "U" rather than an empty circle, which is what
 * getInitials does with nothing to work with.
 */
export const NoName: Story = {
  args: { name: "" },
};

/**
 * An SVG on purpose. The Cloudinary loader hands SVGs straight through, while
 * a raster src is rewritten to /_next/image, and that endpoint is the Next
 * server rather than anything Storybook serves. A JPEG here would render a
 * broken image and teach you nothing about the component.
 */
export const WithImage: Story = {
  args: { src: "/logo.svg", size: 96, alt: "Vetriconn" },
};

/** Every size the product uses, in one row. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      {[24, 32, 40, 64, 96].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar {...args} size={size} />
          <span className="text-xs text-gray-500">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * When the caller sizes the box in classes, the component drops its inline
 * width and height entirely and lets the classes decide. It used to set both,
 * and inline beat the class silently: ProfileHeader asked for `w-full h-full`
 * and got 96px anyway.
 */
export const CallerSizedByClasses: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16">
        <Avatar {...args} className="h-full w-full" size={96} />
      </div>
      <p className="text-sm text-gray-600">
        16 rem-quarter box, size=96 ignored because the class states a size.
      </p>
    </div>
  ),
};

/**
 * Colours are overridable by class, and the component only supplies its own
 * defaults when the caller has not. Company logos land on white; people land
 * on grey.
 */
export const CustomColours: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Avatar {...args} size={64} />
      <Avatar {...args} size={64} className="bg-primary text-white" />
      <Avatar {...args} size={64} className="bg-red-50 text-primary" />
    </div>
  ),
};

/**
 * The reason the box is rem. An avatar beside text should keep its
 * relationship to that text at every setting, not shrink against it.
 */
export const BesideText: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} size={48} />
      <div>
        <p className="font-semibold text-gray-900">Margaret Chen</p>
        <p className="text-sm text-gray-500">Warehouse Associate, Toronto</p>
      </div>
    </div>
  ),
};
