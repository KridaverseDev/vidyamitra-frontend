import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  // Get API URL and clean it (remove quotes if present)
  const apiUrl = env.VITE_API_URL?.replace(/^["']|["']$/g, "") || "http://localhost:8000";

  // Build server config
  const serverConfig: {
    host: string;
    port: number;
    proxy?: Record<string, { target: string; changeOrigin: boolean; secure: boolean; ws: boolean }>;
  } = {
    host: "::",
    port: 8080,
  };

  // Only set up proxy in development mode with localhost
  if (mode === "development" && apiUrl.includes("localhost")) {
    serverConfig.proxy = {
      "/v1": {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
        ws: true, // Enable websocket proxying
      },
    };
  }

  return {
    server: serverConfig,
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["firebase"],
    },
    optimizeDeps: {
      include: ["firebase/app", "firebase/auth"],
      exclude: [],
    },
  };
});
