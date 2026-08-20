import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  /**
   * The dashboard dropped its role segments for routes whose names don't
   * collide across roles. The four that did (inbox, jobs, notifications,
   * settings) either merged behind one role-aware route or were renamed to
   * what they actually are. Old URLs live in already-delivered emails and in
   * backend notification links, so these redirects must not be removed.
   */
  async redirects() {
    // Same-named pages that merged behind one role-aware route.
    const merged = ["inbox", "notifications", "settings"];
    // Pages that were genuinely different features sharing a name.
    const renamed: Array<[string, string]> = [
      ["employer/jobs", "postings"],
      ["job-seeker/jobs", "find-jobs"],
      // Role segment dropped; name unchanged.
      ["employer/applications", "applications"],
      ["employer/billing", "billing"],
      ["employer/company-profile", "company-profile"],
      ["employer/drafts", "drafts"],
      ["employer/post-job", "post-job"],
      ["job-seeker/application-drafts", "application-drafts"],
      ["job-seeker/applied-jobs", "applied-jobs"],
      ["job-seeker/profile", "profile"],
      ["job-seeker/saved-jobs", "saved-jobs"],
      ["job-seeker/saved-searches", "saved-searches"],
    ];

    const pairs: Array<[string, string]> = [
      ...merged.flatMap(
        (page) =>
          [
            [`employer/${page}`, page],
            [`job-seeker/${page}`, page],
          ] as Array<[string, string]>,
      ),
      ...renamed,
    ];

    return pairs.map(([from, to]) => ({
      source: `/dashboard/${from}`,
      destination: `/dashboard/${to}`,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Use a custom loader for ALL images. Cloudinary URLs get Cloudinary
    // transformations and skip Next's optimizer (which 504s on slow upstreams).
    // Local images pass through unchanged.
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    minimumCacheTTL: 60 * 60 * 24, // 1 day
  },
  webpack(config) {
    // Add SVGR loader for webpack builds
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default withBundleAnalyzer(nextConfig);
