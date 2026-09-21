/**
 * A part-typed number still has a country.
 *
 * react-phone-number-input picks the flag by asking whether the value could
 * belong to defaultCountry. A stored "+234" could not belong to CA, so it
 * chose no country and drew the generic globe, while the signup wizard's
 * "+1" drew a flag. One component, two different-looking controls, and the
 * difference was the data rather than the code.
 */
import { countryFromValue, DEFAULT_PHONE_COUNTRY } from "@/components/ui/PhoneField";

describe("countryFromValue", () => {
  it("reads the country off a bare calling code", () => {
    expect(countryFromValue("+234")).toBe("NG");
    expect(countryFromValue("+44")).toBe("GB");
  });

  it("keeps a full number's country", () => {
    expect(countryFromValue("+2349021680875")).toBe("NG");
  });

  it("keeps a shared code on the app default rather than whatever sorts first", () => {
    // "+1" is the whole NANP and every member country's calling code is
    // literally "1". Canada is the product's default and must win it.
    expect(countryFromValue("+1")).toBe(DEFAULT_PHONE_COUNTRY);
    expect(countryFromValue("+1613")).toBe(DEFAULT_PHONE_COUNTRY);
  });

  it("reads the country calling code, never an area code", () => {
    // Trinidad is "+1", not "+1868". Expecting TT here is the mistake this
    // test was written with, and the function is right to say Canada until
    // there are enough digits for a real parse.
    expect(countryFromValue("+1868")).toBe(DEFAULT_PHONE_COUNTRY);
  });

  it("falls back to the default for empty, blank or non-E164 values", () => {
    for (const value of ["", "   ", undefined, "0902", "not a number", "+"]) {
      expect(countryFromValue(value)).toBe(DEFAULT_PHONE_COUNTRY);
    }
  });
});
