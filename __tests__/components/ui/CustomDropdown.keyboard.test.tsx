/**
 * The select-only combobox contract. This component replaced native selects
 * across signup, applications, settings and the job builder - and shipped
 * with no arrow-key support at all, which made most forms keyboard-hostile.
 * These tests pin the contract so it cannot regress silently.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

const OPTIONS = [
  { value: "on", label: "Ontario" },
  { value: "qc", label: "Quebec" },
  { value: "ns", label: "Nova Scotia" },
];

function setup(value = "") {
  const onChange = jest.fn();
  render(
    <CustomDropdown
      label="Province"
      name="province"
      placeholder="Select a province"
      value={value}
      onChange={onChange}
      options={OPTIONS}
    />,
  );
  return { trigger: screen.getByRole("combobox"), onChange };
}

describe("CustomDropdown - keyboard contract", () => {
  it("opens on ArrowDown with the first option already highlighted", () => {
    const { trigger } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    // APG: opening highlights immediately - no second keypress needed.
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-0",
    );
  });

  it("moves the highlight with arrows and wraps at the ends", () => {
    const { trigger } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // open -> 0
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // -> 1
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-1",
    );
    fireEvent.keyDown(trigger, { key: "ArrowUp" }); // -> 0
    fireEvent.keyDown(trigger, { key: "ArrowUp" }); // wraps -> 2
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-2",
    );
  });

  it("selects the highlighted option with Enter and closes", () => {
    const { trigger, onChange } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // open -> 0
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // -> 1
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("qc");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens highlighting the currently selected value", () => {
    const { trigger } = setup("ns");
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // open
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-2",
    );
  });

  it("closes on Escape without selecting", () => {
    const { trigger, onChange } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("jumps by type-ahead on short lists", () => {
    const { trigger } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // open
    fireEvent.keyDown(trigger, { key: "n" });
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-2",
    );
  });

  it("Home and End reach the extremes", () => {
    const { trigger } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // open
    fireEvent.keyDown(trigger, { key: "End" });
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-2",
    );
    fireEvent.keyDown(trigger, { key: "Home" });
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "province-option-0",
    );
  });
});
