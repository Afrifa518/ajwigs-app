const PHASE_DEVELOPMENT_SERVER = "phase-development-server";

let supabaseHostname;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    supabaseHostname = new URL(supabaseUrl).hostname;
  }
} catch {
  supabaseHostname = undefined;
}

const remotePatterns = [
  supabaseHostname
    ? {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/**",
      }
    : null,
  {
    protocol: "https",
    hostname: "*.supabase.co",
    pathname: "/**",
  },
].filter(Boolean);

const isWindows = process.platform === "win32";

export default function nextConfig(phase) {
  const distDir = isWindows
    ? phase === PHASE_DEVELOPMENT_SERVER
      ? ".next-win-dev"
      : ".next-win-build"
    : undefined;

  return {
    ...(distDir ? { distDir } : {}),
    reactStrictMode: true,
    images: {
      remotePatterns,
    },
    outputFileTracing: !isWindows,
    experimental: isWindows
      ? {
          webpackBuildWorker: false,
          parallelServerCompiles: false,
          parallelServerBuildTraces: false,
          workerThreads: false,
        }
      : undefined,
  };
}
