/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow product images hosted on any domain during development.
    // In production, replace with the exact CDN/domain you use.
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  // The public catalog and cart were replaced by the photo gallery.
  async redirects() {
    return [
      { source: "/:locale(ar|en)/catalog/:path*", destination: "/:locale/gallery", permanent: false },
      { source: "/:locale(ar|en)/products/:path*", destination: "/:locale/gallery", permanent: false },
      { source: "/:locale(ar|en)/aluminum/:path*", destination: "/:locale/gallery", permanent: false },
      { source: "/:locale(ar|en)/cart", destination: "/:locale/gallery", permanent: false }
    ];
  },
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
