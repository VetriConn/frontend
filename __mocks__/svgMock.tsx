/**
 * An SVG import, as the app actually sees it.
 *
 * @svgr/webpack turns `import Icon from "./icon.svg"` into a React
 * component, but next/jest maps SVGs to a file stub — so a component that
 * renders one exploded in tests with "Element type is invalid" while working
 * perfectly in the browser. This mock matches the build.
 */
import type { SVGProps } from "react";

export default function SvgMock(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="svg-mock" {...props} />;
}
