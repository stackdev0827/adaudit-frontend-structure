import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		exclude: ["lucide-react"],
	},
	server: {
		host: true,
		port: 5173,
	},
	// server: {
	//   host: true, // Allows external access to the dev server
	//   port: 5173,
	//   hmr: {
	//       protocol: 'wss', // Use WebSocket Secure (WSS) for HMR
	//       host: 'app.adaudit.io', // Match the Nginx `server_name`
	//   },
	// },
});