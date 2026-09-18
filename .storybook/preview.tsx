import React, { useLayoutEffect } from "react";
import localFont from "next/font/local";
import type { Decorator, Preview } from "@storybook/nextjs-vite";

/**
 * The app's stylesheet, not a copy of it.
 *
 * globals.css is where the `@theme` tokens live, so `bg-primary`,
 * `text-text-muted` and every other token class only exist once this is
 * loaded. Without it the preview renders the same markup in unstyled colours
 * and quietly disagrees with the product about what red is.
 */
import "../app/globals.css";

import SWRProvider from "../components/providers/SWRProvider";
import { ToasterProvider } from "../components/ui/Toaster";

/**
 * The same three faces app/layout.tsx loads, from the same four files.
 *
 * next/font/local rather than a hand-written @font-face block, for one
 * reason: a second block would be a second place to change. The whole point
 * of this preview is that it agrees with the app about metrics, since metrics
 * decide where text wraps and this setup exists to check wrapping at 112% and
 * 125%. Declaring the faces twice is how the two quietly stop agreeing.
 *
 * One honest difference. Next generates a size-adjusted fallback face
 * alongside each real one, so the swap from fallback to loaded font barely
 * moves the layout; the Vite plugin emits the real face only. The loaded font
 * is identical, so everything measured here is right, but the first frame
 * before the font arrives is not the first frame the app draws.
 *
 * Paths are relative to this file, which is why they climb out of .storybook.
 */
const outfit = localFont({
  src: [{ path: "../app/fonts/outfit-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
});

const openSans = localFont({
  src: [{ path: "../app/fonts/open-sans-300-800.woff2", weight: "300 800", style: "normal" }],
  variable: "--font-open-sans",
  display: "swap",
});

const lato = localFont({
  src: [
    { path: "../app/fonts/lato-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/lato-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
});

/** What layout.tsx puts on <body>. Same element here, so the cascade matches. */
const FONT_VARIABLE_CLASSES = [lato.variable, openSans.variable, outfit.variable];

/**
 * The same two numbers hooks/useAccessibility ships. A harness that invented
 * its own would be reporting on a text size the product does not offer.
 *
 * `normal` is absent on purpose, and matches the hook: it removes the
 * property rather than writing 100%, so an inherited root size and an
 * explicit 100% stay indistinguishable here too.
 */
const TEXT_SIZE_PERCENT: Record<string, string> = {
  large: "112%",
  "extra-large": "125%",
};

/**
 * The reason this Storybook exists.
 *
 * The accessibility panel scales the whole product by moving one value, the
 * root font size, and three shipped bugs have come out of components that
 * mix rem and px and therefore stop agreeing with each other at 125%. Those
 * are invisible to unit tests and slow to reproduce by hand: sign in, open
 * settings, change the setting, navigate back to the component. Here it is a
 * dropdown.
 *
 * It writes to documentElement rather than a wrapper div for the same reason
 * the app does: rem resolves against the root and nothing else.
 *
 * AccessibilityProvider is deliberately NOT a decorator around this. Its only
 * output is this same font-size write plus the high-contrast class, and it
 * would fight the toolbar rather than serve it: the provider starts every
 * mount at `normal` and clears the property once it has read localStorage, so
 * whichever ran last would win. Nothing in components/ui calls
 * useAccessibility, so there is no context to supply either way. The toolbar
 * owns documentElement; the provider would be a second writer to it.
 */
function AppShell({
  textSize,
  highContrast,
  children,
}: {
  textSize: string;
  highContrast: string;
  children: React.ReactNode;
}) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const percent = TEXT_SIZE_PERCENT[textSize];
    if (percent) {
      html.style.fontSize = percent;
    } else {
      html.style.removeProperty("font-size");
    }
    html.classList.toggle("high-contrast", highContrast === "on");
  }, [textSize, highContrast]);

  useLayoutEffect(() => {
    document.body.classList.add(...FONT_VARIABLE_CLASSES);
  }, []);

  /**
   * The app's root wrapping, minus AccessibilityProvider as above. Nothing in
   * this starter set reads either context, but both are configuration-free
   * and a component that calls useToaster throws outright without its
   * provider, which is a confusing first five minutes for whoever adds the
   * next story.
   */
  return (
    <SWRProvider>
      <ToasterProvider>{children}</ToasterProvider>
    </SWRProvider>
  );
}

const withAppShell: Decorator = (Story, context) => (
  <AppShell
    textSize={String(context.globals.textSize)}
    highContrast={String(context.globals.highContrast)}
  >
    <Story />
  </AppShell>
);

const preview: Preview = {
  decorators: [withAppShell],

  globalTypes: {
    textSize: {
      description: "Root font size, as the accessibility panel sets it",
      toolbar: {
        title: "Text size",
        icon: "zoom",
        items: [
          { value: "normal", title: "Normal" },
          { value: "large", title: "Large (112%)" },
          { value: "extra-large", title: "Extra large (125%)" },
        ],
        dynamicTitle: true,
      },
    },
    highContrast: {
      description: "The high-contrast class the accessibility panel adds to <html>",
      toolbar: {
        title: "Contrast",
        icon: "contrast",
        items: [
          { value: "off", title: "Normal contrast" },
          { value: "on", title: "High contrast" },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    textSize: "normal",
    highContrast: "off",
    /**
     * An explicit ground, because neither globals.css nor Storybook paints
     * one. The app gets away with it: every page sets its own background. A
     * story has no page, so the canvas stayed transparent and rendered black
     * for anyone whose browser is in dark mode, which is not a colour this
     * product has ever put behind a form.
     */
    backgrounds: { value: "white" },
  },

  parameters: {
    layout: "padded",

    /**
     * Widths the app itself changes at, rather than a generic phone list.
     * 850 and 768 are the two custom variants globals.css declares, so a
     * component that behaves differently either side of them is worth
     * checking at exactly those numbers.
     */
    viewport: {
      options: {
        mobile: { name: "Phone (375)", styles: { width: "375px", height: "812px" } },
        mobileVariant: {
          name: "mobile: variant edge (850)",
          styles: { width: "850px", height: "900px" },
        },
        tabletVariant: {
          name: "tablet: variant edge (768)",
          styles: { width: "768px", height: "1024px" },
        },
        desktop: { name: "Desktop (1280)", styles: { width: "1280px", height: "900px" } },
      },
    },

    backgrounds: {
      options: {
        white: { name: "White", value: "#ffffff" },
        // bg-gray-50, which is what the dashboard and the job board sit on.
        dashboard: { name: "Dashboard grey", value: "#f9fafb" },
      },
    },
  },
};

export default preview;
