"use client";
import React, { useState } from "react";
import clsx from "clsx";
import FacebookIcon from "@/public/images/facebook.svg";
import LocationIcon from "@/public/images/location.svg";
import CallCallingIcon from "@/public/images/call-calling.svg";
import SmsIcon from "@/public/images/sms.svg";
import SmsTrackingIcon from "@/public/images/sms-tracking.svg";
import { FiLinkedin } from "react-icons/fi";
import { sendContactMessage } from "@/lib/api";
import { ContactMessage } from "@/types/api";
import { useToaster } from "@/components/ui/Toaster";

interface ContactSectionProps {
  id?: string;
}

export const ContactSection = ({ id }: ContactSectionProps) => {
  const [formData, setFormData] = useState<ContactMessage>({
    full_name: "",
    email: "",
    description: "",
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
      setFormData((prev) => ({ ...prev, description: value }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitStatus.type) setSubmitStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.description.trim()
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
      setFormData({ full_name: "", email: "", description: "" });
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
      className="w-full py-12 px-[5%] pb-16 mobile:py-8 mobile:pb-10 relative overflow-hidden"
      id={id}
    >
      {/* Decorative dots */}
      <div
        className="absolute top-8 left-[5%] w-2.5 h-2.5 rounded-full bg-primary opacity-40"
        aria-hidden="true"
      />
      <div
        className="absolute top-14 right-[6%] w-3 h-3 rounded-full bg-amber-400 opacity-50"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-12 left-[8%] w-2 h-2 rounded-full bg-amber-400 opacity-35"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-[4%] w-2 h-2 rounded-full bg-primary opacity-40"
        aria-hidden="true"
      />
      <div
        className="absolute top-[40%] left-[2%] w-2 h-2 rounded-full bg-pink-400 opacity-30"
        aria-hidden="true"
      />

      <h1 className="heading-1 text-center mb-10 mobile:mb-6 relative z-10">
        Get In <span className="text-primary">Touch</span>
      </h1>
      <div className="flex gap-16 items-start justify-between mobile:flex-col mobile:gap-8 mobile:items-stretch">
        <form
          className="flex-1 flex flex-col gap-6 mobile:gap-4 mobile:w-full"
          onSubmit={handleSubmit}
        >
          <h2 className="heading-2 mb-2 mobile:mb-1">
            Send a message{" "}
            <span className="inline-flex items-center justify-center align-middle relative top-0.5 ml-1 [&_svg]:w-6 [&_svg]:h-6 [&_svg]:block mobile:[&_svg]:w-5 mobile:[&_svg]:h-5">
              <SmsTrackingIcon />
            </span>
          </h2>
          {submitStatus.type && (
            <div
              className={clsx(
                "p-4 rounded-lg font-open-sans font-medium text-center mb-2 mobile:p-3 mobile:text-sm",
                submitStatus.type === "success" &&
                  "bg-green-100 text-green-800 border border-green-200",
                submitStatus.type === "error" &&
                  "bg-red-100 text-red-800 border border-red-200",
              )}
            >
              {submitStatus.message}
            </div>
          )}
          <input
            type="text"
            name="name"
            placeholder="Full name"
            className="w-full py-4 px-5 border border-gray-200 rounded-2xl font-open-sans text-base outline-none transition-colors focus:border-primary focus:border-[1.5px] mobile:py-3 mobile:px-4 mobile:text-sm mobile:rounded-xl"
            value={formData.full_name}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="w-full py-4 px-5 border border-gray-200 rounded-2xl font-open-sans text-base outline-none transition-colors focus:border-primary focus:border-[1.5px] mobile:py-3 mobile:px-4 mobile:text-sm mobile:rounded-xl"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
          />
          <textarea
            name="message"
            placeholder="Description"
            className="w-full py-4 px-5 border border-gray-200 rounded-2xl font-open-sans text-base outline-none transition-colors min-h-[120px] resize-y focus:border-primary focus:border-[1.5px] mobile:py-3 mobile:px-4 mobile:text-sm mobile:rounded-xl mobile:min-h-[100px]"
            rows={6}
            value={formData.description}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
          />
          <button
            type="submit"
            className="bg-primary text-white font-open-sans font-semibold border-none rounded-2xl py-4 mt-2 cursor-pointer transition-colors hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed mobile:py-3 mobile:mt-1 mobile:rounded-xl mobile:text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        </form>
        <div className="flex-1 bg-[#fcfcfc] rounded-3xl w-full py-10 px-8 flex flex-col gap-6 mobile:py-6 mobile:px-5 mobile:rounded-2xl mobile:gap-4">
          <h2 className="heading-2 text-primary mb-5 mobile:mb-3">
            Contact information
          </h2>
          <div className="flex items-start gap-4 font-open-sans text-base text-gray-900 mb-3 mobile:text-sm mobile:gap-3 mobile:mb-2">
            <span className="text-primary text-xl mt-0.5 mobile:text-lg">
              <LocationIcon />
            </span>
            <span>Ottawa, Ontario.</span>
          </div>
          <div className="flex items-start gap-4 font-open-sans text-base text-gray-900 mb-3 mobile:text-sm mobile:gap-3 mobile:mb-2">
            <span className="text-primary text-xl mt-0.5 mobile:text-lg">
              <CallCallingIcon />
            </span>
            <span>
              English - 1(647)-889-9542 <br />
              <br /> French - 1(613)-501-9162
            </span>
          </div>
          <div className="flex items-start gap-4 font-open-sans text-base text-gray-900 mb-3 mobile:text-sm mobile:gap-3 mobile:mb-2">
            <span className="text-primary text-xl mt-0.5 mobile:text-lg">
              <SmsIcon />
            </span>
            <span>richmonda@vetriconn.ca</span>
          </div>
          <div className="flex gap-9 mt-10 justify-start mobile:gap-6 mobile:mt-6">
            <a
              href="https://www.facebook.com/profile.php?id=61580233844003"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-14 h-14 rounded-full border-none shadow-[0_-2px_4px_0_#f1f0f0,0_2px_6px_0_#757373] text-primary text-3xl bg-white transition-shadow hover:shadow-[0_-2px_4px_0_#ebe9e9,0_3px_10px_0_#646363] mobile:w-12 mobile:h-12 mobile:text-2xl"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/vetriconn-inc/?viewAsMember=true"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-14 h-14 rounded-full border-none shadow-[0_-2px_4px_0_#f1f0f0,0_2px_6px_0_#757373] text-primary text-3xl bg-white transition-shadow hover:shadow-[0_-2px_4px_0_#ebe9e9,0_3px_10px_0_#646363] mobile:w-12 mobile:h-12 mobile:text-2xl"
            >
              <FiLinkedin />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
