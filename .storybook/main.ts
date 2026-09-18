import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook exists here for one job: look at a component at each text size
 * and each width, without hand-building a throwaway harness page for it.
 *
 * Only components/ui is in scope. Everything under components/pages is wired
 * to SWR and a signed-in user, and a story for one of those would be a story
 * about the mock rather than about the component.
 */
const config: StorybookConfig = {
  stories: ["../components/ui/**/*.stories.@(ts|tsx)"],

  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },

  /**
   * The app's own public directory, served at the same paths the app serves
   * it from. Avatar and anything else reaching for /logo.svg would otherwise
   * render a broken image in the preview and nowhere else, which is exactly
   * the kind of lie that makes a harness useless.
   */
  staticDirs: ["../public"],
};

export default config;
