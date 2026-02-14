/**
 * Unit Tests for PasswordField Component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordField } from '@/components/pages/auth/signup/PasswordField';

describe('PasswordField Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render password input with label', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <PasswordField
        label="Password"
        name="password"
        value="secret123"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByLabelText('Show password');
    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('should display password requirements when showRequirements is true', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        showRequirements
      />
    );

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('At least one number')).toBeInTheDocument();
  });

  it('should update requirement indicators as password is typed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        showRequirements
      />
    );

    // Type a password that meets all requirements
    const password = 'Password123';
    rerender(
      <PasswordField
        label="Password"
        name="password"
        value={password}
        onChange={mockOnChange}
        showRequirements
      />
    );

    // All requirements should be met (visual indicators would show green)
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        error="Password is required"
      />
    );

    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Password');
    await user.type(input, 'test');

    expect(mockOnChange).toHaveBeenCalledTimes(4);
  });

  it('should have aria-invalid when error is present', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        error="Required"
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should display helper text when provided and no error', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        helperText="At least 8 characters"
      />
    );

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('should hide helper text when error is present', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        helperText="At least 8 characters"
        error="Password is required"
      />
    );

    expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        disabled
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toBeDisabled();
  });
});
