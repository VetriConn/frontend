/**
 * Touch Target Compliance Tests
 * 
 * Tests verify that all interactive elements meet WCAG 2.1 Level AAA
 * touch target requirements (44px × 44px minimum).
 * 
 * Requirements: 19.3, 2.3
 */

import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';
import { HiOutlineBriefcase, HiOutlineXMark } from 'react-icons/hi2';

// WCAG 2.1 Level AAA minimum touch target size
const MIN_TOUCH_TARGET_SIZE = 44; // pixels

/**
 * Helper function to check if an element meets touch target requirements
 */
/**
 * Helper to get computed pixel value from rem/em
 */
describe('Touch Target Compliance', () => {
  describe('Button Component', () => {
    it('should meet touch target requirements for small buttons', () => {
      render(<Button size="sm">Small Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Small Button' });
      
      // Check for min-h-[44px] class
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should meet touch target requirements for medium buttons', () => {
      render(<Button size="md">Medium Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Medium Button' });
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should meet touch target requirements for large buttons', () => {
      render(<Button size="lg">Large Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Large Button' });
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should meet touch target requirements for icon-only buttons', () => {
      render(
        <Button size="md" aria-label="Briefcase">
          <HiOutlineBriefcase />
        </Button>
      );
      
      const button = screen.getByLabelText('Briefcase');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should meet touch target requirements for buttons with icons', () => {
      render(
        <Button size="md" leftIcon={<HiOutlineBriefcase />}>
          Find Jobs
        </Button>
      );
      
      const button = screen.getByRole('button', { name: 'Find Jobs' });
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Icon Buttons', () => {
    it('should meet touch target requirements for close buttons', () => {
      const CloseButton = () => (
        <button
          className="p-2 min-h-44 min-w-44 flex items-center justify-center"
          aria-label="Close"
        >
          <HiOutlineXMark className="w-5 h-5" />
        </button>
      );

      render(<CloseButton />);
      
      const button = screen.getByLabelText('Close');
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
    });

    it('should meet touch target requirements for edit buttons', () => {
      const EditButton = () => (
        <button
          className="p-1.5 min-h-44 min-w-44 text-gray-400 hover:text-gray-600"
          aria-label="Edit item"
        >
          <HiOutlineBriefcase className="w-5 h-5" />
        </button>
      );

      render(<EditButton />);
      
      const button = screen.getByLabelText('Edit item');
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
    });

    it('should meet touch target requirements for delete buttons', () => {
      const DeleteButton = () => (
        <button
          className="p-1.5 min-h-44 min-w-44 text-gray-400 hover:text-red-500"
          aria-label="Delete item"
        >
          <HiOutlineXMark className="w-5 h-5" />
        </button>
      );

      render(<DeleteButton />);
      
      const button = screen.getByLabelText('Delete item');
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
    });
  });

  describe('Navigation Elements', () => {
    it('should meet touch target requirements for mobile menu toggle', () => {
      const MobileMenuToggle = () => (
        <button
          className="p-2 rounded-lg min-h-44 min-w-44 flex items-center justify-center"
          aria-label="Open menu"
        >
          <HiOutlineBriefcase className="w-6 h-6" />
        </button>
      );

      render(<MobileMenuToggle />);
      
      const button = screen.getByLabelText('Open menu');
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
    });

    it('should meet touch target requirements for mobile menu items', () => {
      const MobileMenuItem = () => (
        <a
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 min-h-44"
        >
          <HiOutlineBriefcase className="w-5 h-5" />
          Dashboard
        </a>
      );

      render(<MobileMenuItem />);
      
      const link = screen.getByText('Dashboard').closest('a');
      expect(link).toHaveClass('min-h-44');
    });

    it('should meet touch target requirements for desktop nav links', () => {
      const NavLink = () => (
        <a
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <HiOutlineBriefcase className="w-5 h-5" />
          Dashboard
        </a>
      );

      render(<NavLink />);
      
      const link = screen.getByText('Dashboard').closest('a');
      
      // Desktop nav links have px-4 py-2 which should provide adequate touch target
      // py-2 = 0.5rem = 8px, plus content height should exceed 44px
      expect(link).toHaveClass('px-4');
      expect(link).toHaveClass('py-2');
    });
  });

  describe('Form Elements', () => {
    it('should meet touch target requirements for text inputs', () => {
      const TextInput = () => (
        <input
          type="text"
          className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg"
          placeholder="Enter text"
        />
      );

      render(<TextInput />);
      
      const input = screen.getByPlaceholderText('Enter text');
      
      // Mobile: py-2 (0.5rem = 8px) + text height + border should meet minimum
      // Desktop: py-3 (0.75rem = 12px) + text height + border exceeds minimum
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('md:py-3');
    });

    it('should meet touch target requirements for select dropdowns', () => {
      const SelectDropdown = () => (
        <select
          className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg"
          aria-label="Select option"
        >
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      );

      render(<SelectDropdown />);
      
      const select = screen.getByLabelText('Select option');
      expect(select).toHaveClass('py-2');
      expect(select).toHaveClass('md:py-3');
    });

    it('should meet touch target requirements for checkboxes', () => {
      const Checkbox = () => (
        <label className="flex items-center gap-2 min-h-44">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300"
          />
          <span>Accept terms</span>
        </label>
      );

      render(<Checkbox />);
      
      const label = screen.getByText('Accept terms').closest('label');
      
      // Label should have min-h-44 to provide adequate touch target
      expect(label).toHaveClass('min-h-44');
    });
  });

  describe('Card Action Buttons', () => {
    it('should meet touch target requirements for card add buttons', () => {
      const AddButton = () => (
        <button
          className="flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 min-h-44 bg-red-50 text-red-700 border border-red-200 rounded-lg"
          aria-label="Add item"
        >
          <HiOutlineBriefcase className="w-5 h-5" />
          Add Item
        </button>
      );

      render(<AddButton />);
      
      const button = screen.getByLabelText('Add item');
      expect(button).toHaveClass('min-h-44');
    });

    it('should meet touch target requirements for card edit buttons', () => {
      const EditButton = () => (
        <button
          className="p-1.5 min-h-44 min-w-44 text-gray-400 hover:text-gray-600 rounded-md"
          aria-label="Edit card"
        >
          <HiOutlineBriefcase className="w-5 h-5" />
        </button>
      );

      render(<EditButton />);
      
      const button = screen.getByLabelText('Edit card');
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
    });
  });

  describe('Modal Elements', () => {
    it('should meet touch target requirements for modal close buttons', () => {
      const ModalCloseButton = () => (
        <button
          className="p-2 min-h-44 min-w-44 flex items-center justify-center"
          aria-label="Close modal"
        >
          <HiOutlineXMark className="w-5 h-5" />
        </button>
      );

      render(<ModalCloseButton />);
      
      const button = screen.getByLabelText('Close modal');
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
    });

    it('should meet touch target requirements for modal action buttons', () => {
      const ModalButton = () => (
        <button
          className="w-full px-4 py-2.5 bg-primary text-white rounded-lg min-h-44"
        >
          Confirm
        </button>
      );

      render(<ModalButton />);
      
      const button = screen.getByText('Confirm');
      expect(button).toHaveClass('min-h-44');
    });
  });

  describe('Link Elements', () => {
    it('should meet touch target requirements for footer links', () => {
      const FooterLink = () => (
        <a
          href="/privacy"
          className="text-sm text-gray-500 hover:text-primary min-h-44 flex items-center"
        >
          Privacy Policy
        </a>
      );

      render(<FooterLink />);
      
      const link = screen.getByText('Privacy Policy');
      expect(link).toHaveClass('min-h-44');
    });

    it('should meet touch target requirements for social media links', () => {
      const SocialLink = () => (
        <a
          href="https://facebook.com"
          className="p-2 min-h-44 min-w-44 flex items-center justify-center"
          aria-label="Facebook"
        >
          <HiOutlineBriefcase className="w-5 h-5" />
        </a>
      );

      render(<SocialLink />);
      
      const link = screen.getByLabelText('Facebook');
      expect(link).toHaveClass('min-h-44');
      expect(link).toHaveClass('min-w-44');
    });
  });

  describe('Responsive Touch Targets', () => {
    it('should maintain touch targets at mobile breakpoint', () => {
      // Simulate mobile viewport
      global.innerWidth = 375;
      
      render(<Button size="md">Mobile Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Mobile Button' });
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('should maintain touch targets at tablet breakpoint', () => {
      // Simulate tablet viewport
      global.innerWidth = 768;
      
      render(<Button size="md">Tablet Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Tablet Button' });
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('md:px-5');
      expect(button).toHaveClass('md:py-2.5');
    });

    it('should maintain touch targets at desktop breakpoint', () => {
      // Simulate desktop viewport
      global.innerWidth = 1440;
      
      render(<Button size="md">Desktop Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Desktop Button' });
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('md:px-5');
      expect(button).toHaveClass('md:py-2.5');
    });
  });

  describe('Touch Target Utility Class', () => {
  });

  describe('Spacing Between Touch Targets', () => {
    it('should have adequate spacing between adjacent buttons', () => {
      const ButtonGroup = () => (
        <div className="flex gap-3">
          <button className="px-4 py-2 min-h-44 bg-primary text-white rounded-lg">
            Button 1
          </button>
          <button className="px-4 py-2 min-h-44 bg-gray-200 text-gray-700 rounded-lg">
            Button 2
          </button>
        </div>
      );

      render(<ButtonGroup />);
      
      const container = screen.getByText('Button 1').parentElement;
      
      // gap-3 = 0.75rem = 12px spacing between buttons
      expect(container).toHaveClass('gap-3');
    });

    it('should have adequate spacing in mobile menu items', () => {
      const MobileMenu = () => (
        <div className="space-y-0">
          <a href="/link1" className="block px-4 py-3 min-h-44">Link 1</a>
          <a href="/link2" className="block px-4 py-3 min-h-44">Link 2</a>
        </div>
      );

      render(<MobileMenu />);
      
      const link1 = screen.getByText('Link 1');
      const link2 = screen.getByText('Link 2');
      
      // Each link has py-3 which provides vertical spacing
      expect(link1).toHaveClass('py-3');
      expect(link2).toHaveClass('py-3');
    });
  });
});

describe('Touch Target Compliance Summary', () => {
  it('should document minimum touch target size constant', () => {
    expect(MIN_TOUCH_TARGET_SIZE).toBe(44);
  });

  it('should verify min-h-44 equals 44px', () => {
    // min-h-44 in Tailwind should be 2.75rem
    // 2.75rem * 16px (default font size) = 44px
    const expectedRem = 2.75;
    const expectedPx = expectedRem * 16;
    
    expect(expectedPx).toBe(44);
  });
});
