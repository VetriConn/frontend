/**
 * Tests for ContactInfoEditForm.
 *
 * This form moved from a hand-rolled phone regex to libphonenumber-backed
 * validation, which is stricter — the cases that changed are pinned below.
 * It also exposes `validate()` / `getData()` by attaching them to its own
 * DOM node, an unusual contract worth locking down.
 */

import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ContactInfoEditForm,
  type ContactInfoFormData,
} from "@/components/pages/profile/ContactInfoEditForm";

const baseData: ContactInfoFormData = {
  phone_number: "+16135550178",
  state_province: "ON",
    city: "Ottawa",
  country: "Canada",
};

/** Reach the imperative handles the component hangs off its container. */
const formHandle = () => {
  const el = document.getElementById("contact-info-form") as
    | (HTMLElement & { validate?: () => boolean; getData?: () => unknown })
    | null;
  return el;
};

const runValidate = () => {
  let result = false;
  act(() => {
    result = formHandle()?.validate?.() ?? false;
  });
  return result;
};

describe("ContactInfoEditForm", () => {
  describe("rendering", () => {
    it("should render phone, city and country fields", () => {
      render(<ContactInfoEditForm initialData={baseData} />);

      expect(screen.getByRole("textbox", { name: /Phone Number/ })).toBeInTheDocument();
      expect(screen.getByLabelText(/City/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country/)).toBeInTheDocument();
    });

    it("should not render an email field, which is immutable", () => {
      render(<ContactInfoEditForm initialData={baseData} />);

      expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument();
    });

    it("should use the custom country picker rather than a native select", () => {
      const { container } = render(
        <ContactInfoEditForm initialData={baseData} />,
      );

      expect(
        screen.getByRole("button", { name: "Phone Number country" }),
      ).toBeInTheDocument();
      expect(container.querySelector("select")).toBeNull();
    });

    it("should seed the phone field from initialData", () => {
      render(<ContactInfoEditForm initialData={baseData} />);

      const phone = screen.getByRole("textbox", { name: /Phone Number/ }) as HTMLInputElement;
      expect(phone.value.replace(/\D/g, "")).toContain("6135550178");
    });
  });

  describe("validate()", () => {
    it("should pass for fully valid data", () => {
      render(<ContactInfoEditForm initialData={baseData} />);

      expect(runValidate()).toBe(true);
    });

    it("should fail and surface an error when the phone is empty", () => {
      render(
        <ContactInfoEditForm
          initialData={{ ...baseData, phone_number: "" }}
        />,
      );

      expect(runValidate()).toBe(false);
      expect(screen.getByText("Phone number is required")).toBeInTheDocument();
    });

    it("should reject a ten-digit string that the old regex accepted", () => {
      // The previous check passed anything with 10+ digits.
      render(
        <ContactInfoEditForm
          initialData={{ ...baseData, phone_number: "0000000000" }}
        />,
      );

      expect(runValidate()).toBe(false);
      expect(
        screen.getByText("Please enter a valid phone number"),
      ).toBeInTheDocument();
    });

    it("should reject a number with too few digits", () => {
      render(
        <ContactInfoEditForm
          initialData={{ ...baseData, phone_number: "+1613555" }}
        />,
      );

      expect(runValidate()).toBe(false);
    });

    it("should accept a valid non-Canadian number", () => {
      render(
        <ContactInfoEditForm
          initialData={{ ...baseData, phone_number: "+2349021680875" }}
        />,
      );

      expect(runValidate()).toBe(true);
    });

    it("should fail and surface an error when the city is empty", () => {
      render(<ContactInfoEditForm initialData={{ ...baseData, state_province: "ON",
    city: "" }} />);

      expect(runValidate()).toBe(false);
      expect(screen.getByText("City is required")).toBeInTheDocument();
    });

    it("should fail and surface an error when the country is empty", () => {
      render(
        <ContactInfoEditForm initialData={{ ...baseData, country: "" }} />,
      );

      expect(runValidate()).toBe(false);
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });

    it("should report every invalid field at once", () => {
      render(
        <ContactInfoEditForm
          initialData={{ phone_number: "", state_province: "ON",
    city: "", country: "" }}
        />,
      );

      expect(runValidate()).toBe(false);
      expect(screen.getByText("Phone number is required")).toBeInTheDocument();
      expect(screen.getByText("City is required")).toBeInTheDocument();
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });
  });

  describe("getData()", () => {
    it("should return the current form data", () => {
      render(<ContactInfoEditForm initialData={baseData} />);

      expect(formHandle()?.getData?.()).toEqual(baseData);
    });

    it("should reflect edits made after mount", async () => {
      const user = userEvent.setup();
      render(<ContactInfoEditForm initialData={baseData} />);

      await user.clear(screen.getByLabelText(/City/));
      await user.type(screen.getByLabelText(/City/), "Toronto");

      expect(formHandle()?.getData?.()).toMatchObject({ state_province: "ON",
    city: "Toronto" });
    });
  });

  describe("onDataChange", () => {
    it("should notify the parent when a field changes", async () => {
      const user = userEvent.setup();
      const onDataChange = jest.fn();
      render(
        <ContactInfoEditForm
          initialData={baseData}
          onDataChange={onDataChange}
        />,
      );

      await user.type(screen.getByLabelText(/City/), "!");

      expect(onDataChange).toHaveBeenCalled();
      expect(onDataChange.mock.calls.at(-1)?.[0]).toMatchObject({
        state_province: "ON",
    city: "Ottawa!",
      });
    });

    it("should validate a field live as the user edits it", async () => {
      const user = userEvent.setup();
      render(<ContactInfoEditForm initialData={baseData} />);

      await user.clear(screen.getByLabelText(/City/));

      expect(screen.getByText("City is required")).toBeInTheDocument();
    });
  });
});
