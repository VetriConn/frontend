/**
 * Tests for the password validity helper the signup step uses to decide when
 * to reveal the requirements checklist.
 */
import { isPasswordValid } from "@/components/ui/PasswordField";

describe("isPasswordValid", () => {
  it("accepts a password meeting every rule", () => {
    expect(isPasswordValid("TestPass123")).toBe(true);
  });

  it("rejects a too-short password", () => {
    expect(isPasswordValid("Test12")).toBe(false);
  });

  it("rejects a password with no uppercase letter", () => {
    expect(isPasswordValid("testpass123")).toBe(false);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(isPasswordValid("TESTPASS123")).toBe(false);
  });

  it("rejects a password with no number", () => {
    expect(isPasswordValid("TestPassword")).toBe(false);
  });
});
