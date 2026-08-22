/**
 * Tests for SkillsInput — the pill multi-select that replaced the free-text
 * skills field. Covers picking a suggestion, adding a custom skill, removing a
 * pill, and the max cap.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsInput } from "@/components/ui/SkillsInput";

const setup = (props: Partial<React.ComponentProps<typeof SkillsInput>> = {}) => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  render(<SkillsInput value={[]} onChange={onChange} {...props} />);
  return { onChange, user };
};

describe("SkillsInput", () => {
  it("renders selected skills as removable pills", () => {
    setup({ value: ["Project Management"] });
    expect(screen.getByText("Project Management")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Project Management" }),
    ).toBeInTheDocument();
  });

  it("adds a skill picked from the suggestions", async () => {
    const { onChange, user } = setup();
    await user.type(screen.getByRole("combobox"), "Project");
    await user.click(
      screen.getByRole("button", { name: "Project Management" }),
    );
    expect(onChange).toHaveBeenCalledWith(["Project Management"]);
  });

  it("adds a custom skill that isn't in the collection", async () => {
    const { onChange, user } = setup();
    await user.type(screen.getByRole("combobox"), "Underwater Basket Weaving");
    await user.click(
      screen.getByRole("button", { name: /Underwater Basket Weaving/ }),
    );
    expect(onChange).toHaveBeenCalledWith(["Underwater Basket Weaving"]);
  });

  it("removes a pill", async () => {
    const { onChange, user } = setup({ value: ["React", "Node"] });
    await user.click(screen.getByRole("button", { name: "Remove React" }));
    expect(onChange).toHaveBeenCalledWith(["Node"]);
  });

  it("does not add a duplicate skill", async () => {
    const { onChange, user } = setup({ value: ["Data Analysis"] });
    await user.type(screen.getByRole("combobox"), "Data Analysis");
    // The already-selected skill is filtered out of the suggestions.
    expect(
      screen.queryByRole("button", { name: "Data Analysis" }),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables input once the max is reached", () => {
    setup({ value: ["A", "B"], max: 2 });
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
