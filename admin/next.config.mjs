/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@juntti/db", "@juntti/ai"],
};

export default nextConfig;
