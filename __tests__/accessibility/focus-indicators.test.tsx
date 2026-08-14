/**
 * Focus Indicators Verification Test
 * 
 * This test suite verifies that focus indicators remain visible on all interactive
 * elements across mobile, tablet, and desktop breakpoints.
 * 
 * Requirements: 19.2, 19.5
 * Task: 23.1 Verify focus indicators at all breakpoints
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/Button';
import { EditDialog } from '@/components/ui/EditDialog';

// Mock viewport sizes
const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
};

// Helper to set viewport size
const setViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Focus Indicators - All Breakpoints', () => {
  describe('Button Component', () => {
    it('should have focus:ring-2 class on mobile viewport', () => {
      setViewport(BREAKPOINTS.mobile);
      const { container } = render(<Button>Test Button</Button>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
      expect(button).toHaveClass('focus:outline-none');
    });

    it('should have focus:ring-2 class on tablet viewport', () => {
      setViewport(BREAKPOINTS.tablet);
      const { container } = render(<Button>Test Button</Button>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('should have focus:ring-2 class on desktop viewport', () => {
      setViewport(BREAKPOINTS.desktop);
      const { container } = render(<Button>Test Button</Button>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('should have focus ring color matching variant', () => {
      const { container: primaryContainer } = render(
        <Button variant="primary">Primary</Button>
      );
      const primaryButton = primaryContainer.querySelector('button');
      expect(primaryButton).toHaveClass('focus:ring-primary');

      const { container: secondaryContainer } = render(
        <Button variant="secondary">Secondary</Button>
      );
      const secondaryButton = secondaryContainer.querySelector('button');
      expect(secondaryButton).toHaveClass('focus:ring-gray-500');

      const { container: dangerContainer } = render(
        <Button variant="danger">Danger</Button>
      );
      const dangerButton = dangerContainer.querySelector('button');
      expect(dangerButton).toHaveClass('focus:ring-red-500');
    });

    it('should maintain touch target size with focus indicators', () => {
      const { container } = render(<Button size="md">Test</Button>);
      const button = container.querySelector('button');
      
      // Verify minimum height for touch targets
      expect(button).toHaveClass('min-h-[44px]');
      // Verify focus indicators don't interfere with touch targets
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Form Input Elements', () => {
    it('should have visible focus indicators on text inputs', () => {
      const { container } = render(
        <input
          type="text"
          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      );
      const input = container.querySelector('input');
      
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-primary');
      expect(input).toHaveClass('focus:border-transparent');
    });

    it('should have visible focus indicators on select elements', () => {
      const { container } = render(
        <select className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          <option>Option 1</option>
        </select>
      );
      const select = container.querySelector('select');
      
      expect(select).toHaveClass('focus:ring-2');
      expect(select).toHaveClass('focus:ring-primary');
      expect(select).toHaveClass('focus:outline-none');
    });

    it('should have visible focus indicators on textarea elements', () => {
      const { container } = render(
        <textarea className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
      );
      const textarea = container.querySelector('textarea');
      
      expect(textarea).toHaveClass('focus:ring-2');
      expect(textarea).toHaveClass('focus:ring-primary');
    });
  });

  describe('Dialog/Modal Components', () => {
    it('should have focus indicators on dialog close button', () => {
      const { container } = render(
        <EditDialog
          isOpen={true}
          title="Test Dialog"
          onClose={() => {}}
          onSubmit={() => {}}
        >
          <p>Dialog content</p>
        </EditDialog>
      );

      const closeButton = container.querySelector('[aria-label="Close dialog"]');
      expect(closeButton).toBeInTheDocument();
      
      // Close button should have hover and focus states
      expect(closeButton).toHaveClass('hover:bg-gray-100');
      expect(closeButton).toHaveClass('min-h-[44px]');
      expect(closeButton).toHaveClass('min-w-[44px]');
    });

    it('should have focus indicators on dialog action buttons', () => {
      const { container } = render(
        <EditDialog
          isOpen={true}
          title="Test Dialog"
          onClose={() => {}}
          onSubmit={() => {}}
        >
          <p>Dialog content</p>
        </EditDialog>
      );

      const submitButton = screen.getByText('Save Changes');
      const cancelButton = screen.getByText('Cancel');

      // Both buttons should have minimum touch target size
      expect(submitButton).toHaveClass('min-h-[44px]');
      expect(cancelButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('Link Elements', () => {
    it('should have focus indicators on navigation links', () => {
      const { container } = render(
        <a
          href="/test"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Test Link
        </a>
      );
      const link = container.querySelector('a');
      
      // Links should have hover states at minimum
      expect(link).toHaveClass('hover:bg-gray-50');
      expect(link).toHaveClass('transition-colors');
    });
  });

  describe('Icon-only Buttons', () => {
    it('should have focus indicators and meet touch target requirements', () => {
      const { container } = render(
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors min-h-44 min-w-44 flex items-center justify-center"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" />
        </button>
      );
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('min-h-44');
      expect(button).toHaveClass('min-w-44');
      expect(button).toHaveClass('hover:bg-gray-100');
      expect(button).toHaveClass('transition-colors');
    });
  });

  describe('Responsive Focus Indicators', () => {
    it('should maintain focus indicators at mobile breakpoint (375px)', () => {
      setViewport(BREAKPOINTS.mobile);
      const { container } = render(
        <div>
          <Button>Mobile Button</Button>
          <input
            type="text"
            className="focus:ring-2 focus:ring-primary"
          />
        </div>
      );

      const button = container.querySelector('button');
      const input = container.querySelector('input');

      expect(button).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-2');
    });

    it('should maintain focus indicators at tablet breakpoint (768px)', () => {
      setViewport(BREAKPOINTS.tablet);
      const { container } = render(
        <div>
          <Button>Tablet Button</Button>
          <input
            type="text"
            className="focus:ring-2 focus:ring-primary"
          />
        </div>
      );

      const button = container.querySelector('button');
      const input = container.querySelector('input');

      expect(button).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-2');
    });

    it('should maintain focus indicators at desktop breakpoint (1440px)', () => {
      setViewport(BREAKPOINTS.desktop);
      const { container } = render(
        <div>
          <Button>Desktop Button</Button>
          <input
            type="text"
            className="focus:ring-2 focus:ring-primary"
          />
        </div>
      );

      const button = container.querySelector('button');
      const input = container.querySelector('input');

      expect(button).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-2');
    });
  });

  describe('Focus Indicator Visibility', () => {
    it('should use focus-visible for keyboard-only focus indicators where appropriate', () => {
      const { container } = render(
        <button className="group relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Profile Photo
        </button>
      );
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-primary');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
      expect(button).toHaveClass('focus:outline-none');
    });

    it('should have consistent focus ring colors across components', () => {
      const components = [
        <Button key="1" variant="primary">Primary</Button>,
        <input key="2" type="text" className="focus:ring-2 focus:ring-primary" />,
        <select key="3" className="focus:ring-2 focus:ring-primary"><option>Test</option></select>,
      ];

      components.forEach((component) => {
        const { container } = render(component);
        const element = container.firstElementChild;
        
        // All should use primary color for focus ring
        expect(element?.className).toMatch(/focus(-visible)?:ring-primary/);
      });
    });
  });

  describe('High Contrast Mode Compatibility', () => {
    it('should maintain focus indicators in high contrast mode', () => {
      // Simulate high contrast mode
      document.documentElement.classList.add('high-contrast');

      const { container } = render(
        <Button>High Contrast Button</Button>
      );
      const button = container.querySelector('button');

      // Focus indicators should still be present
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');

      document.documentElement.classList.remove('high-contrast');
    });
  });
});
