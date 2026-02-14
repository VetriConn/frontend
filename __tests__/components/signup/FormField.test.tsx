/**
 * Unit Tests for FormField Component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from '@/components/pages/auth/signup/FormField';

describe('FormField Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render label and input correctly', () => {
    render(
      <FormField
        label="Full Name"
        name="fullName"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show optional marker when optional prop is true', () => {
    render(
      <FormField
        label="Phone Number"
        name="phone"
        value=""
        onChange={mockOnChange}
        optional
      />
    );

    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('should show required marker when required prop is true', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        helperText="We'll never share your email"
      />
    );

    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('should display error message with red border when error prop is present', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value="invalid"
        onChange={mockOnChange}
        error="Please enter a valid email address"
      />
    );

    const errorMessage = screen.getByText('Please enter a valid email address');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-500');
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    
    render(
      <FormField
        label="Full Name"
        name="fullName"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'John');

    expect(mockOnChange).toHaveBeenCalledTimes(4); // Once per character
  });

  it('should associate label with input via htmlFor', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
      />
    );

    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'field-email');
    expect(input).toHaveAttribute('id', 'field-email');
  });

  it('should render select dropdown when type is select', () => {
    const options = [
      { value: '0-1', label: '0-1 years' },
      { value: '1-3', label: '1-3 years' },
    ];

    render(
      <FormField
        label="Experience"
        name="experience"
        type="select"
        value=""
        onChange={mockOnChange}
        options={options}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('0-1 years')).toBeInTheDocument();
    expect(screen.getByText('1-3 years')).toBeInTheDocument();
  });

  it('should have aria-invalid when error is present', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        error="Required field"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should have aria-describedby linking to error message', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        error="Required field"
      />
    );

    const input = screen.getByRole('textbox');
    const errorId = input.getAttribute('aria-describedby');
    
    expect(errorId).toBeTruthy();
    expect(screen.getByText('Required field')).toHaveAttribute('id', errorId);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
