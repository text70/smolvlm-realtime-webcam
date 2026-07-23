#!/usr/bin/env node
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 8443;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

function log(msg) {
  console.log('[vidit]', msg);
}

// ── Self-signed cert (ECDSA P-384, 10yr) ──────────────────────────────────
function ensureCert() {
  const keyFile = path.join(ROOT, 'key.pem');
  const certFile = path.join(ROOT, 'cert.pem');
  if (fs.existsSync(keyFile) && fs.existsSync(certFile)) return;
  log('Generating self-signed ECDSA P-384 certificate (10yr)...');
  execSync(
    `openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:secp384r1 ` +
    `-days 3650 -nodes -keyout "${keyFile}" -out "${certFile}" ` +
    `-subj "/CN=Vidit" ` +
    `-addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
    { stdio: 'inherit' }
  );
  log('Certificate ready: cert.pem + key.pem');
}

// ── Secure TLS options (TLS 1.3 only) ─────────────────────────────────────
function tlsOptions() {
  return {
    key: fs.readFileSync(path.join(ROOT, 'key.pem')),
    cert: fs.readFileSync(path.join(ROOT, 'cert.pem')),
    secureOptions:
      crypto.constants.SSL_OP_NO_SSLv2 |
      crypto.constants.SSL_OP_NO_SSLv3 |
      crypto.constants.SSL_OP_NO_TLSv1 |
      crypto.constants.SSL_OP_NO_TLSv1_1,
    honorCipherOrder: true,
    ecdhCurve: 'auto',
    minVersion: 'TLSv1.3',
  };
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown; charset=utf-8',
};

// ── Security headers applied to every response ────────────────────────────
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

function serve(req, res) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(k, v);
  }

  // Normalise path — default to index.html
  let p = req.url.split('?')[0].split('#')[0];
  if (p === '/') p = '/index.html';
  const filePath = path.normalize(path.join(ROOT, p));

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end();
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
ensureCert();

const server = https.createServer(tlsOptions(), serve);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  log(`Server running at https://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});

function shutdown() {
  log('Shutting down...');
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
