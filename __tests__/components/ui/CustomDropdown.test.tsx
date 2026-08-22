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

      expect(screen.getByRole("button")).toHaveTextContent("Select work type");
    });

    it("should show the selected option's label", () => {
      setup({ value: "hybrid" });

      expect(screen.getByRole("button")).toHaveTextContent("Hybrid");
    });

    it("should advertise itself as a listbox trigger", () => {
      setup();

      const trigger = screen.getByRole("button");
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

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);
    });

    it("should mark the trigger expanded while open", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("button", { name: /Select work type/ }));

      expect(
        screen.getByRole("button", { name: /Select work type/ }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("should close when the trigger is clicked again", async () => {
      const { user } = setup();
      const trigger = screen.getByRole("button", { name: /Select work type/ });

      await user.click(trigger);
      await user.click(trigger);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should close when clicking outside", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("button", { name: /Select work type/ }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should cap the option list height so long lists scroll", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("button"));

      const list = screen.getByRole("option", { name: "Remote" }).parentElement;
      expect(list).toHaveClass("max-h-60", "overflow-y-auto");
    });
  });

  describe("selection", () => {
    it("should emit the chosen option's value", async () => {
      const { user, onChange } = setup();

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "Hybrid" }));

      expect(onChange).toHaveBeenCalledWith("hybrid");
    });

    it("should close after selecting", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "Hybrid" }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should mark the current option as selected", async () => {
      const { user } = setup({ value: "remote" });

      await user.click(screen.getByRole("button", { name: /Remote/ }));

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

  describe("disabled state", () => {
    it("should not open when disabled", async () => {
      const { user } = setup({ disabled: true });

      await user.click(screen.getByRole("button"));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should disable the trigger", () => {
      setup({ disabled: true });

      expect(screen.getByRole("button")).toBeDisabled();
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
