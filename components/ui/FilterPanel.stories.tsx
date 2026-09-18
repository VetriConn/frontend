import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { FilterPanel } from "./FilterPanel";

/**
 * The job board's filter sidebar, and the clearest panelStyles consumer that
 * is not wired to a fetch.
 *
 * It renders two entirely different things at once and hides one of them with
 * `md:`: a PANEL_SURFACE sidebar above 768px, and a button that opens a
 * bottom drawer below it. Both are worth looking at, and switching the
 * viewport is the only way to see the second, which is precisely the harness
 * page people kept building by hand.
 *
 * Its dropdowns are `fixed` rather than `absolute`, because the panel sits in
 * a column with overflow-y-auto that would otherwise clip them. Open one at
 * extra large and check it still meets its trigger.
 */
const meta = {
  title: "UI/FilterPanel",
  component: FilterPanel,
  args: {
    filters: {
      location: "",
      jobType: "",
      experienceLevel: "",
      arrangement: "",
    },
    onFilterChange: () => {},
    onApplyFilters: () => {},
    onClearFilters: () => {},
  },
  argTypes: {
    onFilterChange: { control: false },
    onApplyFilters: { control: false },
    onClearFilters: { control: false },
  },
  /**
   * The panel is fully controlled, so a story that ignored onFilterChange
   * would render four dropdowns that refuse to change. Clearing writes the
   * empty filter set back rather than calling a no-op, so the Clear all link
   * does what it says here too.
   */
  render: function Live(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <div className="max-w-sm">
        <FilterPanel
          {...args}
          onFilterChange={(filters) => updateArgs({ filters })}
          onClearFilters={() =>
            updateArgs({
              filters: {
                location: "",
                jobType: "",
                experienceLevel: "",
                arrangement: "",
              },
            })
          }
        />
      </div>
    );
  },
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const SomeFiltersApplied: Story = {
  args: {
    filters: {
      location: "ON",
      jobType: "full-time",
      experienceLevel: "",
      arrangement: "",
    },
  },
};

/**
 * All four set, which is the only way to see the count badge on the mobile
 * toggle. Switch the viewport to the phone width to find it.
 */
export const AllFiltersApplied: Story = {
  args: {
    filters: {
      location: "BC",
      jobType: "part-time",
      experienceLevel: "entry",
      arrangement: "remote",
    },
  },
};

/**
 * The sidebar as it sits on the board, beside the results it filters. The
 * panel is a fixed column and the results are fluid, so this is where the
 * two-column layout either survives 125% or does not.
 */
export const BesideResults: Story = {
  render: function BesideResults(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-80 md:shrink-0">
          <FilterPanel
            {...args}
            onFilterChange={(filters) => updateArgs({ filters })}
          />
        </div>
        <div className="flex-1 space-y-4">
          {["Warehouse Associate", "Security Guard", "Shuttle Driver"].map(
            (title) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-4 md:p-6"
              >
                <h3 className="font-semibold leading-snug tracking-tight text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Mississauga, Ontario &middot; Full time &middot; 22 to 26 an hour
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    );
  },
};
