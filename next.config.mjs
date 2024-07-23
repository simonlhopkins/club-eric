import withMDX from "@next/mdx";
import path from "path";
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  // distDir: "dist",
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  // Optionally, add any other Next.js config below
};

export default withMDX()(nextConfig);
