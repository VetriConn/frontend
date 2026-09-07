import React from "react";
import { render, screen } from "@testing-library/react";
import {
  StepJobDetails,
  StepSalaryLocation,
  StepReview,
} from "@/components/pages/dashboard/postings/steps";
import {
  INITIAL_FORM_DATA,
  JOB_CATEGORIES,
  WIZARD_STEPS,
  LITE_STEPS,
  splitSkills,
  cleanStages,
} from "@/components/pages/dashboard/postings/jobForm";

/**
 * Runtime tripwire for the job-builder split (#47): the wizard's modules
 * (jobForm data layer, formKit fields, step components) compile independently,
 * but until this suite nothing rendered them outside the full page. These are
 * deliberately shallow — each step is a pure props component, so mounting one
 * with the blank form proves the cross-module wiring (steps → formKit →
 * jobForm) composes at runtime, not just under tsc.
 */

const noop = () => {};

describe("job builder modules", () => {
  it("exposes the data layer with the shapes the wizard depends on", () => {
    expect(WIZARD_STEPS).toHaveLength(6);
    expect(LITE_STEPS).toHaveLength(2);
    expect(INITIAL_FORM_DATA.job_title).toBe("");
    // Option lists are derived from the shared vocabulary, value+label pairs.
    expect(JOB_CATEGORIES.length).toBeGreaterThan(0);
    expect(JOB_CATEGORIES[0]).toEqual(
      expect.objectContaining({ value: expect.any(String), label: expect.any(String) }),
    );
  });

  it("payload helpers keep their contracts", () => {
    expect(splitSkills("carpentry, driving\nfirst aid")).toEqual([
      "carpentry",
      "driving",
      "first aid",
    ]);
    expect(cleanStages(["  Phone screen ", "", "Interview"])).toEqual([
      "Phone screen",
      "Interview",
    ]);
    expect(cleanStages(["", "  "])).toBeUndefined();
  });

  it("renders StepJobDetails against the blank form", () => {
    render(
      <StepJobDetails
        formData={INITIAL_FORM_DATA}
        errors={{}}
        onChange={noop}
      />,
    );
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    // SelectField (formKit) mounts the shared CustomDropdown as a combobox.
    expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
  });

  it("renders StepSalaryLocation with the kit's location fields", () => {
    render(
      <StepSalaryLocation
        formData={INITIAL_FORM_DATA}
        errors={{}}
        onChange={noop}
      />,
    );
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it("renders StepReview as a pure summary of the form", () => {
    render(
      <StepReview
        formData={{
          ...INITIAL_FORM_DATA,
          job_title: "Crossing Guard",
          city: "Ottawa",
        }}
      />,
    );
    // The title renders in the heading and again in the preview card.
    expect(
      screen.getByRole("heading", { name: /Crossing Guard/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Ottawa/).length).toBeGreaterThan(0);
  });
});
