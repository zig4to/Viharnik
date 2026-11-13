import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dovoli dostop do dev streznika s telefona (hotspot 10.x, doma 192.168.x).
  allowedDevOrigins: ["**.trycloudflare.com", "10.*.*.*", "192.168.*.*", "**.ts.net"],
};

export default nextConfig;
