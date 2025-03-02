/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { appDir: true },
  images: {
    domains: [
      "image.tmdb.org",
      "img1.hotstarext.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*", // Payload CMS backend URL
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Apply the header to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin", // Allow interaction between windows of the same origin
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
