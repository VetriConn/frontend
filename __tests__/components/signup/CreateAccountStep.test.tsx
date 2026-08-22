/**
 * Tests for the deferred password checklist: hidden by default, revealed only
 * when Continue is attempted with a password that doesn't meet the rules, then
 * hidden again the moment it does. Keeps the form clean while preserving help
 * exactly when it's needed.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateAccountStep } from "@/components/pages/auth/signup/steps/CreateAccountStep";
import { INITIAL_FORM_DATA } from "@/types/signup";
import type { StepProps } from "@/types/signup";

// Stub the debounced availability hook so these tests stay offline and
// deterministic — its own logic is exercised separately.
jest.mock("@/hooks/useEmailAvailability", () => ({
  useEmailAvailability: jest.fn(() => "idle"),
}));
import { useEmailAvailability } from "@/hooks/useEmailAvailability";
const mockAvailability = useEmailAvailability as jest.Mock;
beforeEach(() => mockAvailability.mockReturnValue("idle"));

function makeProps(overrides: Partial<StepProps> = {}): StepProps {
  return {
    formData: {
      ...INITIAL_FORM_DATA,
      full_name: "Adele",
      email: "adele@example.com",
      password: "abc",
      confirmPassword: "abc",
    },
    errors: {},
    onFieldChange: jest.fn(),
    onNext: jest.fn(),
    onBack: jest.fn(),
    currentStep: 1,
    totalSteps: 5,
    ...overrides,
  };
}

const RULE = /At least 8 characters/i;
const continueButton = () =>
  screen.getByRole("button", { name: /continue/i });

describe("CreateAccountStep — deferred password checklist", () => {
  it("hides the checklist until Continue is attempted", () => {
    render(<CreateAccountStep {...makeProps()} />);
    expect(screen.queryByText(RULE)).toBeNull();
  });

  it("reveals the checklist on a Continue with a weak password", () => {
    const onNext = jest.fn();
    render(<CreateAccountStep {...makeProps({ onNext })} />);
    fireEvent.click(continueButton());
    expect(onNext).toHaveBeenCalled();
    expect(screen.getByText(RULE)).toBeInTheDocument();
  });

  it("hides the checklist again once the password is valid", () => {
    const props = makeProps();
    const { rerender } = render(<CreateAccountStep {...props} />);
    fireEvent.click(continueButton());
    expect(screen.getByText(RULE)).toBeInTheDocument();

    rerender(
      <CreateAccountStep
        {...makeProps({
          formData: {
            ...props.formData,
            password: "TestPass123",
            confirmPassword: "TestPass123",
          },
        })}
      />,
    );
    expect(screen.queryByText(RULE)).toBeNull();
  });

  it("disables Continue until every field has content", () => {
    render(
      <CreateAccountStep
        {...makeProps({
          formData: { ...INITIAL_FORM_DATA, full_name: "Adele" },
        })}
      />,
    );
    expect(continueButton()).toBeDisabled();
  });

  it("warns, links to sign in, and blocks Continue when the email is taken", () => {
    mockAvailability.mockReturnValue("taken");
    render(<CreateAccountStep {...makeProps()} />);

    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign in instead/i }),
    ).toHaveAttribute("href", "/signin");
    expect(continueButton()).toBeDisabled();
  });
});
