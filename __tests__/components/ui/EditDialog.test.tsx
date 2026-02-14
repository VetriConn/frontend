/**
 * Unit Tests for EditDialog Component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditDialog } from '@/components/ui/EditDialog';

describe('EditDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <EditDialog
        isOpen={false}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should display custom submit and cancel labels', () => {
    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        submitLabel="Update"
        cancelLabel="Discard"
      >
        <div>Content</div>
      </EditDialog>
    );

    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button (X) is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    const closeButton = screen.getByLabelText('Close dialog');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <input type="text" />
      </EditDialog>
    );

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when isSubmitting is true', () => {
    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      >
        <div>Content</div>
      </EditDialog>
    );

    const submitButton = screen.getByText('Saving...');
    const cancelButton = screen.getByText('Cancel');
    const closeButton = screen.getByLabelText('Close dialog');

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('should show loading spinner when isSubmitting is true', () => {
    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      >
        <div>Content</div>
      </EditDialog>
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    // Check for spinner SVG
    const spinner = screen.getByText('Saving...').parentElement?.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');

    const title = screen.getByText('Edit Profile');
    expect(title).toHaveAttribute('id', 'dialog-title');
  });

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside dialog content', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    const content = screen.getByText('Content');
    await user.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when backdrop is clicked during submission', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      >
        <div>Content</div>
      </EditDialog>
    );

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle Escape key to close dialog', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Content</div>
      </EditDialog>
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on Escape key when isSubmitting is true', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      >
        <div>Content</div>
      </EditDialog>
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should trap focus within dialog', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <input type="text" data-testid="input1" />
        <input type="text" data-testid="input2" />
      </EditDialog>
    );

    // Wait for focus to be set
    await waitFor(() => {
      expect(screen.getByLabelText('Close dialog')).toHaveFocus();
    });

    // Tab through elements
    await user.tab();
    expect(screen.getByTestId('input1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('input2')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Cancel')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Save Changes')).toHaveFocus();

    // Tab from last element should cycle back to first
    await user.tab();
    expect(screen.getByLabelText('Close dialog')).toHaveFocus();
  });

  it('should handle Shift+Tab for reverse focus navigation', async () => {
    const user = userEvent.setup();

    render(
      <EditDialog
        isOpen={true}
        title="Edit Profile"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <input type="text" data-testid="input1" />
      </EditDialog>
    );

    // Wait for initial focus
    await waitFor(() => {
      expect(screen.getByLabelText('Close dialog')).toHaveFocus();
    });

    // Shift+Tab from first element should go to last
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByText('Save Changes')).toHaveFocus();
  });
});
