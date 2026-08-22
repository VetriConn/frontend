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
  toE164,
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

  it("should expose the country picker as a custom listbox trigger, not a native select", () => {
    const { container } = render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Phone Number country",
    });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // A native <select> is exactly what this replaces — 250 OS-drawn rows.
    expect(container.querySelector("select")).toBeNull();
  });

  it("should default the country picker to Canada", () => {
    render(
      <PhoneField
        label="Phone Number"
        name="phone_number"
        value=""
        onChange={() => {}}
      />,
    );

    // The trigger shows the flag for the default country.
    expect(
      screen.getByRole("button", { name: "Phone Number country" }),
    ).toHaveAttribute("title", "Canada");
    expect(DEFAULT_PHONE_COUNTRY).toBe("CA");
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

describe("legacy stored values", () => {
  // Rows written before this field existed hold free-form text. Passing those
  // to PhoneInput unparsed logs an error and blanks the field.
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  const renderWith = (value: string) => {
    render(<PhoneInputControl name="phone" value={value} onChange={() => {}} />);
    return screen.getByRole("textbox") as HTMLInputElement;
  };

  it.each([
    ["formatted national", "(613) 555-0178"],
    ["dashed national", "613-555-0178"],
    ["bare national digits", "6135550178"],
    ["spaced international", "+1 613 555 0178"],
  ])("should display a %s value", (_label, stored) => {
    const input = renderWith(stored);

    expect(input.value.replace(/\D/g, "")).toContain("6135550178");
  });

  it.each([
    ["formatted national", "(613) 555-0178"],
    ["bare national digits", "6135550178"],
  ])("should not log a library error for a %s value", (_label, stored) => {
    renderWith(stored);

    const complaints = errorSpy.mock.calls.filter((call) =>
      String(call[0]).includes("E.164"),
    );
    expect(complaints).toHaveLength(0);
  });

  it("should leave an already-E.164 value untouched", () => {
    const input = renderWith("+16135550178");

    expect(input.value.replace(/\D/g, "")).toContain("6135550178");
  });

  it("should keep an incomplete E.164 value editable rather than blanking it", () => {
    const input = renderWith("+1613");

    expect(input.value).not.toBe("");
  });

  // In `international` mode the field seeds the default country's calling
  // code, so "empty" means "+1" here rather than "".
  it("should drop unparseable text back to an empty number", () => {
    const input = renderWith("not a phone number");

    expect(input.value).toBe("+1");
  });

  it("should render an empty number for an empty value", () => {
    const input = renderWith("");

    expect(input.value).toBe("+1");
  });
});

describe("toE164", () => {
  it("should normalize a legacy national value to E.164", () => {
    expect(toE164("(613) 555-0178")).toBe("+16135550178");
  });

  it("should pass a valid E.164 value through unchanged", () => {
    expect(toE164("+16135550178")).toBe("+16135550178");
  });

  it("should pass an incomplete E.164 value through unchanged", () => {
    expect(toE164("+1613")).toBe("+1613");
  });

  it("should trim surrounding whitespace", () => {
    expect(toE164("  +16135550178  ")).toBe("+16135550178");
  });

  it.each([
    ["empty string", ""],
    ["whitespace only", "   "],
    ["null", null],
    ["undefined", undefined],
    ["unparseable text", "not a phone number"],
  ])("should return undefined for %s", (_label, input) => {
    expect(toE164(input)).toBeUndefined();
  });

  it("should parse a foreign number written in international form", () => {
    expect(toE164("+234 902 168 0875")).toBe("+2349021680875");
  });
});

describe("country picker dropdown", () => {
  const openPicker = async () => {
    const user = userEvent.setup();
    render(<PhoneInputControl name="phone" value="" onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Country" }));
    return user;
  };

  it("should stay closed until the trigger is clicked", () => {
    render(<PhoneInputControl name="phone" value="" onChange={() => {}} />);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should open a listbox with a search box", async () => {
    await openPicker();

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByLabelText("Search countries")).toBeInTheDocument();
  });

  it("should cap the option list height so it cannot run the page", async () => {
    await openPicker();

    // The native select rendered ~250 rows tall; this list scrolls instead.
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveClass("overflow-y-auto");
    expect(listbox.style.maxHeight).toBe("236px");
  });

  it("should filter options by the search query", async () => {
    const user = await openPicker();

    const before = screen.getAllByRole("option").length;
    expect(before).toBeGreaterThan(50);

    await user.type(screen.getByLabelText("Search countries"), "Nigeria");

    const after = screen.getAllByRole("option");
    expect(after.length).toBeLessThan(before);
    expect(after[0]).toHaveTextContent("Nigeria");
  });

  it("should show an empty state when nothing matches", async () => {
    const user = await openPicker();

    await user.type(screen.getByLabelText("Search countries"), "zzzzzz");

    expect(screen.getByText("No countries found")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("should select a country and close the menu", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<PhoneInputControl name="phone" value="" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Country" }));
    await user.type(screen.getByLabelText("Search countries"), "Nigeria");
    await user.click(screen.getByRole("option", { name: /Nigeria/ }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should close on Escape", async () => {
    const user = await openPicker();

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should reset the search query between openings", async () => {
    const user = await openPicker();

    await user.type(screen.getByLabelText("Search countries"), "Nigeria");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Country" }));

    expect(screen.getByLabelText("Search countries")).toHaveValue("");
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
