import http from "node:http";
import https from "node:https";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function sfProxyPlugin() {
	return {
		name: "sf-dynamic-proxy",
		configureServer(server: import("vite").ViteDevServer) {
			server.middlewares.use("/sf-proxy", (req, res) => {
				const instanceUrl = req.headers["x-sf-instance"] as string | undefined;
				if (!instanceUrl) {
					res.statusCode = 400;
					res.end("Missing X-SF-Instance header");
					return;
				}

				let target: URL;
				try {
					target = new URL(instanceUrl);
				} catch {
					res.statusCode = 400;
					res.end("Invalid X-SF-Instance URL");
					return;
				}

				const forwardHeaders = { ...req.headers, host: target.hostname };
				delete forwardHeaders["x-sf-instance"];

				const options: http.RequestOptions = {
					hostname: target.hostname,
					port: target.port || (target.protocol === "https:" ? 443 : 80),
					path: req.url || "/",
					method: req.method,
					headers: forwardHeaders,
				};

				const protocol = target.protocol === "https:" ? https : http;
				const proxyReq = protocol.request(options, (proxyRes) => {
					res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
					proxyRes.pipe(res);
				});

				proxyReq.on("error", (err) => {
					res.statusCode = 502;
					res.end(err.message);
				});

				req.pipe(proxyReq);
			});
		},
	};
}

export default defineConfig({
	plugins: [react(), sfProxyPlugin()],
});
