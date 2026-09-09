/**
 * The postings row: one menu, and a row that opens the posting.
 *
 * It was four unlabelled icons abreast — edit, open, eye-slash, trash — on a
 * board whose audience is 45+, where the eye/eye-slash pair asked you to know
 * which of two near-identical glyphs meant "publish". They are named items in
 * a menu now, and the row itself opens the public posting.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import KebabMenu, { type KebabAction } from "@/components/pages/admin/KebabMenu";

const actionsFor = (published: boolean, onToggle: () => void, onDelete: () => void): KebabAction[] => [
  { label: "Edit posting", onClick: () => {} },
  { label: "View public posting", onClick: () => {} },
  published
    ? { label: "Move to drafts", onClick: onToggle }
    : { label: "Publish posting", onClick: onToggle },
  { label: "Delete posting", danger: true, onClick: onDelete },
];

describe("postings row actions", () => {
  it("hides the actions behind one labelled trigger", async () => {
    const user = userEvent.setup();
    render(<KebabMenu label="Actions for Software Engineer" actions={actionsFor(true, () => {}, () => {})} />);

    const trigger = screen.getByRole("button", { name: "Actions for Software Engineer" });
    expect(screen.queryByText("Delete posting")).not.toBeInTheDocument();

    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    // Words, not glyphs. The four icons carried only title attributes, which
    // never appear on touch and are not read by every screen reader.
    for (const label of ["Edit posting", "View public posting", "Move to drafts", "Delete posting"]) {
      expect(within(menu).getByText(label)).toBeInTheDocument();
    }
  });

  it("names the publish action for the state it will move the job to", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<KebabMenu actions={actionsFor(true, () => {}, () => {})} />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    expect(await screen.findByText("Move to drafts")).toBeInTheDocument();
    unmount();

    render(<KebabMenu actions={actionsFor(false, () => {}, () => {})} />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    expect(await screen.findByText("Publish posting")).toBeInTheDocument();
  });

  it("runs the action that was chosen", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<KebabMenu actions={actionsFor(true, () => {}, onDelete)} />);

    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Delete posting"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("is reachable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<KebabMenu actions={actionsFor(true, () => {}, () => {})} />);

    // The four icons were reachable but unlabelled; a menu is only an
    // improvement if it opens without a mouse.
    await user.tab();
    expect(screen.getByRole("button", { name: "Row actions" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });
});
