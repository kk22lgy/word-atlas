import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../docs/', import.meta.url));
const prefix = '/word-atlas/';
const port = Number(process.env.PORT || 3213);
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(prefix)) {
        res.writeHead(404);
        return res.end('Use /word-atlas/');
      }
      const path = resolve(
        root,
        decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html',
      );
      if (!path.startsWith(resolve(root) + sep)) {
        res.writeHead(403);
        return res.end();
      }
      const data = await readFile(path);
      res.writeHead(200, {
        'Content-Type':
          {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.svg': 'image/svg+xml',
            '.txt': 'text/plain; charset=utf-8',
          }[extname(path)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(port, '127.0.0.1', () =>
    console.log(`Pages preview → http://127.0.0.1:${port}/word-atlas/`),
  );
