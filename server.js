// server.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const { DatadomeExpress } = require('@datadome/module-express');

const MAIN_PORT = process.env.PORT || 3000;
const API_HOST = 'api.localhost';
const API_PORT = 3443;

const app = express();
const ddMain = new DatadomeExpress(process.env.DATADOME_SERVER_KEY);
app.use(ddMain.middleware());

app.use(express.static(path.join(__dirname, 'public')));

// /
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// /any-xhr
app.get('/any-xhr', (req, res) => {
  res.json({ requestHeaders: req.headers, responseHeaders: res.getHeaders() });
});

// /any-document
app.get('/any-document', (req, res) => {
  const renderHeaders = (headers) =>
    Object.entries(headers || {})
      .map(([k, v]) => `<div><span class="font-semibold text-blue-700">${k}:</span> <span>${v}</span></div>`)
      .join('');
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    window.ddjskey='5937CB836686F83D473E0A7011FA0E';
    window.ddoptions={ajaxListenerPath:true,ajaxListenerPathDepth:2,ajaxListenerWithCredentials:true};
  </script>
  <script src="https://js.datadome.co/tags.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <title>/any-document</title>
</head>
<body class="p-8">
  <h1 class="text-2xl font-bold mb-4">/any-document</h1>
  <h2 class="font-semibold">Request Headers</h2>
  <div class="bg-slate-100 p-2 mb-4">${renderHeaders(req.headers)}</div>
  <h2 class="font-semibold">Response Headers</h2>
  <div class="bg-slate-100 p-2">${renderHeaders(res.getHeaders())}</div>
</body>
</html>`);
});

http.createServer(app).listen(MAIN_PORT, () => {
  console.log(`🌐 Main app: http://localhost:${MAIN_PORT}`);
});

// -------- Cross-origin API --------
const apiApp = express();
const ddApi = new DatadomeExpress(process.env.DATADOME_SERVER_KEY);
apiApp.use(ddApi.middleware());

// Preflight
apiApp.options('/cross-origin-xhr', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// /cross-origin-xhr
apiApp.get('/cross-origin-xhr', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.json({ requestHeaders: req.headers, responseHeaders: res.getHeaders() });
});

const keyPath = path.join(__dirname, 'api.localhost-key.pem');
const certPath = path.join(__dirname, 'api.localhost.pem');
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('❌ Missing TLS files. Run: mkcert api.localhost');
  process.exit(1);
}
https
  .createServer(
    { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
    apiApp
  )
  .listen(API_PORT, '0.0.0.0', () => {
    console.log(`🔒 API: https://${API_HOST}:${API_PORT}/cross-origin-xhr`);
  });
