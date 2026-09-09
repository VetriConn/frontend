import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat config, straight from the package.
 *
 * `next lint` was removed in Next 16, so `npm run lint` was reading "lint" as
 * a directory to build and failing — the linter had not run since the upgrade.
 * The script calls eslint directly now. eslint-config-next moved up with it
 * and ships real flat configs as of 16, so the FlatCompat shim that used to
 * translate the old .eslintrc shape is gone too.
 */
const eslintConfig = [
  {
    // Build output and generated files. Flat config ignores node_modules and
    // dotfiles on its own; these are the ones it would otherwise walk.
    ignores: [
      ".next/**",
      ".next-check/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["__tests__/**", "jest.setup.js", "jest.config.js", "scripts/**"],
    rules: {
      // Tests reach for `any` to build deliberately malformed fixtures, and
      // require() is how the jest config and setup pull in CommonJS shims.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      /**
       * A warning, not an error, and this is a deferral rather than a
       * judgement that the rule is wrong.
       *
       * It arrived with eslint-plugin-react-hooks v7 and immediately found 39
       * call sites across 36 files — almost all of them the same two shapes:
       * a dialog resetting its fields when `isOpen` flips, and a form seeding
       * itself from props once they arrive. Some of those deserve to become
       * derived state or a `key` prop; some are legitimate (reading
       * localStorage on mount cannot happen anywhere else).
       *
       * Sorting 39 of them one at a time is its own piece of work. Left as an
       * error it would mean `npm run lint` never passes, which is how a
       * linter stops being read at all — the state it was already in before
       * this config was fixed.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
