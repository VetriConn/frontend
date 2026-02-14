/**
 * Unit Tests for RoleCard Component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleCard } from '@/components/pages/auth/signup/RoleCard';

describe('RoleCard Component', () => {
  const mockOnSelect = jest.fn();
  const mockIcon = <svg data-testid="test-icon" />;

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render with title and description', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply for flexible opportunities"
        selected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Find a Job')).toBeInTheDocument();
    expect(screen.getByText('Browse and apply for flexible opportunities')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should show checkmark when selected', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply"
        selected={true}
        onSelect={mockOnSelect}
      />
    );

    // Checkmark should be visible
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not show checkmark when not selected', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply"
        selected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onSelect when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply"
        selected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect when Enter key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply"
        selected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect when Space key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply"
        selected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should show "Coming Soon" badge when disabled', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Post a Job"
        description="Hire talented professionals"
        selected={false}
        disabled={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('should not call onSelect when disabled and clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <RoleCard
        icon={mockIcon}
        title="Post a Job"
        description="Hire talented professionals"
        selected={false}
        disabled={true}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should not call onSelect when disabled and Enter is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <RoleCard
        icon={mockIcon}
        title="Post a Job"
        description="Hire talented professionals"
        selected={false}
        disabled={true}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should have aria-disabled when disabled', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Post a Job"
        description="Hire talented professionals"
        selected={false}
        disabled={true}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-disabled', 'true');
  });

  it('should be focusable when not disabled', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Find a Job"
        description="Browse and apply"
        selected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should not be focusable when disabled', () => {
    render(
      <RoleCard
        icon={mockIcon}
        title="Post a Job"
        description="Hire talented professionals"
        selected={false}
        disabled={true}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '-1');
  });
});
