import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keeps the live site's URLs (/products/, /about-us/ ...) unchanged.
  trailingSlash: true,
  images: {
    // Keep each resized image for 31 days and make fewer versions (one format,
    // fewer sizes). This keeps Vercel's free image limit (5,000 a month) low.
    formats: ["image/webp"],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 256, 384],
  },
};

export default nextConfig;
