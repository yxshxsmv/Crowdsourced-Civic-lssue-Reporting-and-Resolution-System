/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ktynjgnxxkvgwxiucbwa.supabase.co",
      },
    ],
  },
};

export default nextConfig;
