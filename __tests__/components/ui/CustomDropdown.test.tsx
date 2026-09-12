/**
 * Tests for CustomDropdown — the shared portal-positioned select used across
 * dashboard forms. Previously uncovered.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

const OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
];

const setup = (props: Partial<React.ComponentProps<typeof CustomDropdown>> = {}) => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  render(
    <CustomDropdown
      name="work_type"
      placeholder="Select work type"
      value=""
      onChange={onChange}
      options={OPTIONS}
      {...props}
    />,
  );
  return { onChange, user };
};

describe("CustomDropdown", () => {
  describe("trigger", () => {
    it("should show the placeholder when nothing is selected", () => {
      setup();

      expect(screen.getByRole("combobox")).toHaveTextContent("Select work type");
    });

    it("should show the selected option's label", () => {
      setup({ value: "hybrid" });

      expect(screen.getByRole("combobox")).toHaveTextContent("Hybrid");
    });

    it("should advertise itself as a combobox for a listbox", () => {
      setup();

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should render an optional label with a required marker", () => {
      setup({ label: "Work type", required: true });

      expect(screen.getByText("Work type")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("opening and closing", () => {
    it("should start closed", () => {
      setup();

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should open on click and list every option", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);
    });

    it("should mark the trigger expanded while open", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("combobox"));

      expect(
        screen.getByRole("combobox"),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("should close when the trigger is clicked again", async () => {
      const { user } = setup();
      const trigger = screen.getByRole("combobox");

      await user.click(trigger);
      await user.click(trigger);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should close when clicking outside", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should cap the option list height so long lists scroll", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("combobox"));

      const list = screen.getByRole("option", { name: "Remote" }).parentElement;
      expect(list).toHaveClass("max-h-60", "overflow-y-auto");
    });
  });

  describe("selection", () => {
    it("should emit the chosen option's value", async () => {
      const { user, onChange } = setup();

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Hybrid" }));

      expect(onChange).toHaveBeenCalledWith("hybrid");
    });

    it("should close after selecting", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Hybrid" }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should mark the current option as selected", async () => {
      const { user } = setup({ value: "remote" });

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("option", { name: "Remote" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("option", { name: "Hybrid" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });
  });

  describe("menu position", () => {
    /**
     * The menu used to open at `rect.top + 36`, where 36 stood in for the
     * height of the trigger. The trigger is FIELD_BASE, which is rem: 50px at
     * the default text size, 62px at the accessibility panel's 125% step. So
     * the menu opened inside its own trigger, and further inside it the
     * larger the reader had set their text. It anchors to the measured bottom
     * edge now, which holds at every size.
     */
    const triggerRect = (top: number, height: number): DOMRect => ({
      top,
      bottom: top + height,
      height,
      left: 24,
      right: 324,
      width: 300,
      x: 24,
      y: top,
      toJSON: () => ({}),
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each([
      ["the default text size", 50],
      ["the 125% text size", 62],
    ])("should open flush under the trigger at %s", async (_label, height) => {
      jest
        .spyOn(HTMLButtonElement.prototype, "getBoundingClientRect")
        .mockReturnValue(triggerRect(120, height));
      const { user } = setup();

      await user.click(screen.getByRole("combobox"));

      const menu = screen.getByRole("listbox").parentElement;
      expect(menu).toHaveStyle({
        top: `${120 + height}px`,
        left: "24px",
        width: "300px",
      });
    });
  });

  describe("disabled state", () => {
    it("should not open when disabled", async () => {
      const { user } = setup({ disabled: true });

      await user.click(screen.getByRole("combobox"));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should disable the trigger", () => {
      setup({ disabled: true });

      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });

  describe("helper text and errors", () => {
    it("should render helper text when there is no error", () => {
      setup({ helperText: "Pick one" });

      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    it("should render the error and hide helper text", () => {
      setup({ helperText: "Pick one", error: "Work type is required" });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Work type is required",
      );
      expect(screen.queryByText("Pick one")).not.toBeInTheDocument();
    });
  });
});
