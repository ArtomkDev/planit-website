import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "out",
);
const port = Number(process.argv[2] || process.env.PORT || 4173);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mdx", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function isInsideRoot(filePath) {
  const relativePath = path.relative(rootDir, filePath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function safeJoin(urlPath) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const normalizedPath = path.normalize(decodedPath).replace(/^([/\\])+/, "");
  const filePath = path.resolve(rootDir, normalizedPath);

  return isInsideRoot(filePath) ? filePath : null;
}

async function resolveFile(urlPath) {
  const cleanPath = urlPath.replace(/\/+$/, "") || "/";
  const basePath = safeJoin(cleanPath);

  if (!basePath) return null;

  const candidates = [
    basePath,
    `${basePath}.html`,
    path.join(basePath, "index.html"),
  ];

  for (const candidate of candidates) {
    if (await isFile(candidate)) return { filePath: candidate, statusCode: 200 };
  }

  const notFoundPath = path.join(rootDir, "404.html");
  if (await isFile(notFoundPath)) return { filePath: notFoundPath, statusCode: 404 };

  return null;
}

function sendFile(response, filePath, statusCode, method) {
  const extension = path.extname(filePath);
  const contentType = mimeTypes.get(extension) || "application/octet-stream";
  const cacheControl =
    statusCode === 404 || extension === ".html"
      ? "no-cache"
      : "public, max-age=300";

  response.writeHead(statusCode, {
    "Cache-Control": cacheControl,
    "Content-Type": contentType,
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

try {
  await access(rootDir);
} catch {
  console.error("Missing ./out. Run `npm run build` before starting the export preview.");
  process.exit(1);
}

const server = createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  const { pathname } = new URL(request.url, "http://localhost");
  const resolved = await resolveFile(pathname);

  if (!resolved) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  sendFile(response, resolved.filePath, resolved.statusCode, request.method);
});

server.listen(port, () => {
  console.log(`Static export preview: http://localhost:${port}`);
});
