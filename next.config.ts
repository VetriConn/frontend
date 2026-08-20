import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  /**
   * The dashboard dropped its role segments for routes whose names don't
   * collide across roles (inbox/jobs/notifications/settings still do, and
   * keep the old shape for now). The old URLs live in already-delivered
   * emails and in backend notification links, so these redirects are
   * permanent and should not be removed.
   */
  async redirects() {
    const moved = [
      ["employer", "applications"],
      ["employer", "billing"],
      ["employer", "company-profile"],
      ["employer", "drafts"],
      ["employer", "post-job"],
      ["job-seeker", "application-drafts"],
      ["job-seeker", "applied-jobs"],
      ["job-seeker", "profile"],
      ["job-seeker", "saved-jobs"],
      ["job-seeker", "saved-searches"],
    ];
    return moved.map(([role, page]) => ({
      source: `/dashboard/${role}/${page}`,
      destination: `/dashboard/${page}`,
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
