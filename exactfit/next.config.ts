import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  turbopack: {},

  devIndicators: {
    position: "bottom-right",
  },

  // ✅ Allow S3 images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "excat-fit-dxb.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "innoitlabs.s3.ap-south-1.amazonaws.com", // 👈 NEW
      },
    ],
  },
};

export default nextConfig;
