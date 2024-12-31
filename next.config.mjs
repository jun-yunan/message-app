/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scintillating-canary-498.convex.cloud',
      },
    ],
  },
};

export default nextConfig;
