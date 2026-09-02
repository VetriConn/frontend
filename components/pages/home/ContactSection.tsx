"use client";
import { HiOutlineArrowRight } from "react-icons/hi2";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import React, { useState } from "react";
import clsx from "clsx";
import LocationIcon from "@/public/images/location.svg";
import CallCallingIcon from "@/public/images/call-calling.svg";
import SmsIcon from "@/public/images/sms.svg";
import SmsTrackingIcon from "@/public/images/sms-tracking.svg";
// Both marks from one family. Facebook was a hand-rolled SVG and LinkedIn
// was Feather's, so the pair never matched in weight or corner radius —
// and Feather's "in" is a lookalike rather than the real mark.
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa6";
import { sendContactMessage } from "@/lib/api";
import { ContactMessage } from "@/types/api";
import { useToaster } from "@/components/ui/Toaster";

/** One input treatment for every field in the form. */
const FIELD_CLASS =
  "w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl font-open-sans text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 disabled:opacity-60";

interface ContactSectionProps {
  id?: string;
}

export const ContactSection = ({ id }: ContactSectionProps) => {
  const [formData, setFormData] = useState<ContactMessage>({
    full_name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const { showToast } = useToaster();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "name") setFormData((prev) => ({ ...prev, full_name: value }));
    else if (name === "message")
      setFormData((prev) => ({ ...prev, message: value }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitStatus.type) setSubmitStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setSubmitStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await sendContactMessage(formData);
      setSubmitStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully.",
      });
      showToast({
        type: "success",
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({ full_name: "", email: "", message: "" });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      setSubmitStatus({ type: "error", message: errorMessage });
      showToast({
        type: "error",
        title: "Message Failed to Send",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="w-full bg-gray-bg py-20 md:py-28 mobile:py-14 relative overflow-hidden"
      id={id}
    >
      {/* Decorative dots */}

      <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 relative z-10">
        {/* Details first, form second — the reference layout: the reader sees
            who they're contacting before being handed a form, and the form
            sits in its own card so it reads as one task. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
          {/* Left: the heading belongs to this column. Centred above a
              two-column, left-aligned layout it lined up with nothing - it sat
              over the gutter between the columns. */}
          <Reveal className="w-full">
            <Eyebrow>Contact</Eyebrow>
            {/* Was an <h1>: a second top-level heading on a page that already
                has one in the hero. */}
            <h2 className="heading-1 mb-5">
              Talk to a <span className="text-primary">real person</span>.
            </h2>
            <p className="body-text text-lg leading-relaxed mb-8 max-w-[42ch] mobile:text-base mobile:mb-6">
              Whether you have a question about a listing, need a hand with your
              account, or want to tell us what&apos;s missing - we read every
              message.
            </p>

            <dl className="space-y-6">
              <div>
                <dt className="font-open-sans text-sm text-text-muted mb-1">
                  Email
                </dt>
                <dd className="font-lato text-lg md:text-xl font-bold text-gray-900 break-all">
                  <a
                    href="mailto:richmonda@vetriconn.ca"
                    className="inline-flex items-center min-h-[44px] no-underline hover:text-primary transition-colors"
                  >
                    richmonda@vetriconn.ca
                  </a>
                </dd>
              </div>

              <div>
                <dt className="font-open-sans text-sm text-text-muted mb-1">
                  Phone
                </dt>
                <dd className="font-lato text-lg md:text-xl font-bold text-gray-900 leading-snug">
                  <a href="tel:+16478899542" className="inline-flex items-center min-h-[44px] no-underline hover:text-primary transition-colors">
                    English - 1 (647) 889 9542
                  </a>
                  <br />
                  <a href="tel:+16135019162" className="inline-flex items-center min-h-[44px] no-underline hover:text-primary transition-colors">
                    French - 1 (613) 501 9162
                  </a>
                </dd>
                <p className="font-open-sans text-sm text-text-muted mt-2">
                  Monday to Friday, 9 AM – 6 PM ET
                </p>
              </div>

              <div>
                <dt className="font-open-sans text-sm text-text-muted mb-1">
                  Office
                </dt>
                <dd className="font-lato text-lg md:text-xl font-bold text-gray-900">
                  Ottawa, Ontario
                </dd>
              </div>
            </dl>

            <div className="flex gap-4 mt-10">
              <a
                href="https://www.facebook.com/profile.php?id=61580233844003"
                aria-label="Vetriconn on Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 text-primary text-xl transition-colors hover:border-primary/40 hover:bg-red-50"
              >
                <FaFacebookF aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/company/vetriconn-inc/?viewAsMember=true"
                aria-label="Vetriconn on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 text-primary text-xl transition-colors hover:border-primary/40 hover:bg-red-50"
              >
                <FaLinkedinIn aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          {/* Right: the form, as a card */}
          <form
            className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_40px_-24px_rgba(15,23,42,0.25)] p-6 md:p-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {submitStatus.type && (
              <div
                className={clsx(
                  "p-4 rounded-xl font-open-sans font-medium text-sm",
                  submitStatus.type === "success" &&
                    "bg-green-50 text-green-800 border border-green-200",
                  submitStatus.type === "error" &&
                    "bg-red-50 text-red-800 border border-red-200",
                )}
                role="status"
              >
                {submitStatus.message}
              </div>
            )}

            <div>
              <label
                htmlFor="contact-name"
                className="block font-open-sans text-sm font-medium text-gray-700 mb-1.5"
              >
                Full name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Enter your full name"
                className={FIELD_CLASS}
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block font-open-sans text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email address"
                className={FIELD_CLASS}
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block font-open-sans text-sm font-medium text-gray-700 mb-1.5"
              >
                How can we help you?
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Enter your message"
                className={clsx(FIELD_CLASS, "min-h-[140px] resize-y")}
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-white font-open-sans font-semibold rounded-full py-3.5 px-8 min-h-[52px] cursor-pointer transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Send message"}
                <HiOutlineArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
