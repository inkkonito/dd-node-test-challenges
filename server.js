// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const { DatadomeExpress } = require('@datadome/module-express');

const app = express();

// DataDome server-side protection (must be before routes/static)
const datadomeClient = new DatadomeExpress(process.env.DATADOME_SERVER_KEY);
app.use(datadomeClient.middleware());

// Serve static assets (home page)
app.use(express.static(path.join(__dirname, 'public')));

// Home (optional explicit)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// XHR endpoint: returns request/response headers (JSON)
app.get('/any-xhr', (req, res) => {
  const requestHeaders = req.headers;
  const responseHeaders = res.getHeaders();
  res.json({ requestHeaders, responseHeaders });
});

// Document endpoint: full page with headers (Tailwind + client tag)
app.get('/any-document', (req, res) => {
  const requestHeaders = req.headers;
  const responseHeaders = res.getHeaders();

  const renderHeaders = (headers) =>
    Object.entries(headers || {})
      .map(
        ([k, v]) =>
          `<div><span class="text-blue-700 font-semibold">${k}:</span> <span class="text-slate-800 break-all">${v}</span></div>`
      )
      .join('');

  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Tailwind via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- DataDome JS Tag -->
    <script>
      window.ddjskey = '5937CB836686F83D473E0A7011FA0E';
      window.ddoptions = { ajaxListenerPath: true, ajaxListenerPathDepth: 2 };
    </script>
    <script src="https://js.datadome.co/tags.js" async></script>

    <title>/any-document</title>
  </head>
  <body class="min-h-screen bg-slate-50 text-slate-900">
    <main class="mx-auto max-w-4xl p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">/any-document</h1>
        <p class="mt-2 text-slate-600">Full document navigation protected by DataDome.</p>
      </header>

      <section>
        <h2 class="text-xl font-semibold mb-2">Request Headers</h2>
        <div class="bg-slate-100 p-3 rounded shadow space-y-1">${renderHeaders(requestHeaders)}</div>

        <h2 class="text-xl font-semibold mt-6 mb-2">Response Headers</h2>
        <div class="bg-slate-100 p-3 rounded shadow space-y-1">${renderHeaders(responseHeaders)}</div>
      </section>

      <section class="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 class="text-xl font-semibold mb-3">Challenge triggers (set request header)</h2>
        <p class="text-slate-700 mb-3">
          Set your <span class="font-semibold">User-Agent</span> header (using devTools) to the following values to trigger challenges:
        </p>
        <ul class="list-disc pl-6 space-y-1 text-slate-800">
          <li><code>BLOCKUA</code> → CAPTCHA</li>
          <li><code>BLOCKUA-HARDBLOCK</code> → CAPTCHA then HARDBLOCK</li>
          <li><code>DeviceCheckTestUA</code> → DeviceCheck</li>
          <li><code>DeviceCheckTestUA-BLOCKUA</code> → DeviceCheck then CAPTCHA</li>
          <li><code>DeviceCheckTestUA-HARDBLOCK</code> → DeviceCheck then HARDBLOCK</li>
          <li><code>HARDBLOCKUA</code> → HARDBLOCK</li>
          <li><code>HARDBLOCK_UA</code> → HARDBLOCK on XHR on Cross-Domain</li>
        </ul>
      </section>

      <a href="/" class="inline-block mt-8 text-blue-600 hover:underline">⬅ Back to Home</a>
    </main>
  </body>
</html>`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
