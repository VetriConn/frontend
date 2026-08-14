/**
 * Tests for PhoneField / PhoneInputControl / validatePhone.
 *
 * The value contract matters most here: callers all store a `string`, so the
 * onChange callback must emit E.164 or "" and never `undefined`.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PhoneField,
  PhoneInputControl,
  validatePhone,
  DEFAULT_PHONE_COUNTRY,
} from "@/components/ui/PhoneField";

describe("validatePhone", () => {
  describe("optional fields", () => {
    it("should accept an empty value", () => {
      expect(validatePhone("")).toBeUndefined();
    });

    it("should accept a whitespace-only value", () => {
      expect(validatePhone("   ")).toBeUndefined();
    });

    it("should still reject a malformed non-empty value", () => {
      expect(validatePhone("12")).toBe("Please enter a valid phone number");
    });
  });

  describe("required fields", () => {
    it("should reject an empty value", () => {
      expect(validatePhone("", { required: true })).toBe(
        "Phone number is required",
      );
    });

    it("should reject a whitespace-only value", () => {
      expect(validatePhone("   ", { required: true })).toBe(
        "Phone number is required",
      );
    });
  });

  describe("number validity", () => {
    it("should accept a valid Canadian number in E.164", () => {
      expect(validatePhone("+16135550178", { required: true })).toBeUndefined();
    });

    it("should accept a valid UK number in E.164", () => {
      expect(validatePhone("+442071838750")).toBeUndefined();
    });

    it("should reject a number with too few digits", () => {
      expect(validatePhone("+1613555")).toBe(
        "Please enter a valid phone number",
      );
    });

    it("should reject letters", () => {
      expect(validatePhone("not-a-phone")).toBe(
        "Please enter a valid phone number",
      );
    });

    it("should reject a digit string with no country context", () => {
      // The old hand-rolled check passed any 10+ digits; libphonenumber
      // requires a resolvable country.
      expect(validatePhone("0000000000")).toBe(
        "Please enter a valid phone number",
      );
    });

    it("should tolerate surrounding whitespace on a valid number", () => {
      expect(validatePhone("  +16135550178  ")).toBeUndefined();
    });
  });
});

describe("PhoneField", () => {
  it("should render the label and associate it with the input", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Phone Number")).toBeInTheDocument();
  });

  it("should mark the field optional when asked", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
        optional
      />,
    );

    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("should render helper text when there is no error", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
        helperText="Employers may use this to contact you."
      />,
    );

    expect(
      screen.getByText("Employers may use this to contact you."),
    ).toBeInTheDocument();
  });

  it("should replace helper text with the error message", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
        helperText="Employers may use this to contact you."
        error="Please enter a valid phone number"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a valid phone number",
    );
    expect(
      screen.queryByText("Employers may use this to contact you."),
    ).not.toBeInTheDocument();
  });

  it("should expose the country selector with an accessible name", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByLabelText("Phone Number country"),
    ).toBeInTheDocument();
  });

  it("should default the country selector to Canada", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Phone Number country")).toHaveValue(
      DEFAULT_PHONE_COUNTRY,
    );
  });

  it("should render an existing E.164 value in national format", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value="+16135550178"
        onChange={() => {}}
      />,
    );

    // The library reformats E.164 for display; the digits must survive.
    const input = screen.getByRole("textbox");
    expect((input as HTMLInputElement).value.replace(/\D/g, "")).toContain(
      "6135550178",
    );
  });

  it("should mark the input invalid when an error is present", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
        error="Please enter a valid phone number"
      />,
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should disable the input when disabled", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
        disabled
      />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("PhoneInputControl value contract", () => {
  it("should emit a string, never undefined, when cleared", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <PhoneInputControl
        name="phone"
        value="+16135550178"
        onChange={onChange}
      />,
    );

    await user.clear(screen.getByRole("textbox"));

    expect(onChange).toHaveBeenCalled();
    onChange.mock.calls.forEach(([value]) => {
      expect(typeof value).toBe("string");
    });
  });

  it("should emit E.164 as the user types a national number", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PhoneInputControl name="phone" value="" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "6135550178");

    expect(onChange).toHaveBeenCalled();
    const lastValue = onChange.mock.calls.at(-1)?.[0];
    expect(typeof lastValue).toBe("string");
    expect(lastValue).toBe("+16135550178");
  });

  it("should apply caller-supplied box classes instead of the default", () => {
    const { container } = render(
      <PhoneInputControl
        name="phone"
        value=""
        onChange={() => {}}
        className="form-input"
      />,
    );

    const wrapper = container.querySelector(".PhoneInput");
    expect(wrapper).toHaveClass("form-input");
    expect(wrapper).not.toHaveClass("rounded-10");
  });
});
