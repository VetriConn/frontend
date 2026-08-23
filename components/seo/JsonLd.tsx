"use client";

/**
 * Schema.org type definitions for structured data
 */

export interface Organization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    contactType: string;
    availableLanguage?: string[];
  };
}

export interface SearchAction {
  "@type": "SearchAction";
  target: {
    "@type": "EntryPoint";
    urlTemplate: string;
  };
  "query-input": string;
}

export interface WebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction?: SearchAction;
}

export interface Place {
  "@type": "Place";
  address: {
    "@type": "PostalAddress";
    addressLocality?: string;
    addressRegion?: string;
    addressCountry: string;
  };
}

export interface MonetaryAmount {
  "@type": "MonetaryAmount";
  currency: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
  unitText?: string;
}

export interface HiringOrganization {
  "@type": "Organization";
  name: string;
  logo?: string;
}

export interface JobPosting {
  "@context": "https://schema.org";
  "@type": "JobPosting";
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string | string[];
  hiringOrganization: HiringOrganization;
  jobLocation?: Place;
  baseSalary?: MonetaryAmount;
  identifier?: {
    "@type": "PropertyValue";
    name: string;
    value: string;
  };
}

export type JsonLdData = Organization | WebSite | JobPosting;

interface JsonLdProps {
  data: JsonLdData;
}

// U+2028 / U+2029 are line terminators, so they can't be written as literal
// characters in this source. Build the matchers from their code points.
const U2028 = new RegExp(String.fromCharCode(0x2028), "g");
const U2029 = new RegExp(String.fromCharCode(0x2029), "g");

/**
 * Serialize JSON-LD for safe embedding in a <script> tag. JSON.stringify leaves
 * `<` intact, so a value containing `</script>` would terminate the tag and let
 * an attacker inject markup (stored XSS via user-controlled job fields). Escape
 * `<` and the U+2028/U+2029 line separators (which also break a JS parse).
 */
function serializeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(U2028, "\\u2028")
    .replace(U2029, "\\u2029");
}

/**
 * JsonLd Component
 * Renders JSON-LD structured data as a script tag for SEO
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}

export default JsonLd;
