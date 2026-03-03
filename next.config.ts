import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mobile export requires a separate backend for API routes. 
  // Disabling strict 'export' format so Vercel Serverless functions can run the Gemini AI parser.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
