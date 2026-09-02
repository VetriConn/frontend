/**
 * Pins the APG menu-button keyboard contract on the admin row-actions menu.
 * The menu is portaled to <body>, so without these behaviours a keyboard user
 * could open it but never reach an item — Tab order put the portal after the
 * whole page.
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import KebabMenu, { KebabAction } from "@/components/pages/admin/KebabMenu";

jest.useFakeTimers();

const actions = (overrides: Partial<KebabAction>[] = []): KebabAction[] => {
  const base: KebabAction[] = [
    { label: "View details", onClick: jest.fn() },
    { label: "Suspend", onClick: jest.fn() },
    { label: "Delete", onClick: jest.fn(), danger: true },
  ];
  overrides.forEach((o, i) => Object.assign(base[i], o));
  return base;
};

const openMenu = (trigger: HTMLElement, key?: string) => {
  if (key) {
    fireEvent.keyDown(trigger, { key });
  } else {
    fireEvent.click(trigger);
  }
  // Initial focus is deferred a tick so the portal exists first.
  act(() => {
    jest.runAllTimers();
  });
};

describe("KebabMenu keyboard contract", () => {
  it("opens on click and focuses the first item", () => {
    render(<KebabMenu actions={actions()} />);
    openMenu(screen.getByRole("button", { name: "Row actions" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "View details" })).toHaveFocus();
  });

  it("ArrowDown on the trigger opens and focuses the first item", () => {
    render(<KebabMenu actions={actions()} />);
    openMenu(screen.getByRole("button", { name: "Row actions" }), "ArrowDown");

    expect(screen.getByRole("menuitem", { name: "View details" })).toHaveFocus();
  });

  it("ArrowUp on the trigger opens and focuses the last item", () => {
    render(<KebabMenu actions={actions()} />);
    openMenu(screen.getByRole("button", { name: "Row actions" }), "ArrowUp");

    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("arrows cycle through items with wrap, skipping disabled ones", () => {
    render(<KebabMenu actions={actions([{}, { disabled: true }])} />);
    openMenu(screen.getByRole("button", { name: "Row actions" }));

    const menu = screen.getByRole("menu");
    // Down from "View details" skips disabled "Suspend" to "Delete".
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    // Down again wraps to the first item.
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "View details" })).toHaveFocus();
    // Up wraps back to the last.
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("Home and End jump to the first and last enabled items", () => {
    render(<KebabMenu actions={actions()} />);
    openMenu(screen.getByRole("button", { name: "Row actions" }));

    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "End" });
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Home" });
    expect(screen.getByRole("menuitem", { name: "View details" })).toHaveFocus();
  });

  it("Escape closes the menu and returns focus to the trigger", () => {
    render(<KebabMenu actions={actions()} />);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    openMenu(trigger);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("activating an item runs it, closes the menu, and refocuses the trigger", () => {
    const acts = actions();
    render(<KebabMenu actions={acts} />);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    openMenu(trigger);

    fireEvent.click(screen.getByRole("menuitem", { name: "Suspend" }));
    expect(acts[1].onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("Tab closes the menu without trapping focus", () => {
    render(<KebabMenu actions={actions()} />);
    openMenu(screen.getByRole("button", { name: "Row actions" }));

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
