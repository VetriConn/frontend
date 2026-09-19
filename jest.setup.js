// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

/*
 * jsdom does not implement scrollIntoView, and calling an unimplemented DOM
 * method throws rather than no-opping. Anything that brings an element into
 * view before measuring it therefore fails in tests for a reason that has
 * nothing to do with the component, which is what happened to the tour.
 *
 * A no-op is the honest stub: there is no layout in jsdom, so there is
 * nothing to scroll and nothing a faithful implementation could report.
 */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}
