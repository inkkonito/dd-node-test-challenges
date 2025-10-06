# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a DataDome + Express demo application that demonstrates bot protection using DataDome's server-side middleware and client-side JavaScript tag. The app showcases both same-origin and cross-origin request scenarios.

## Commands

### Development
```bash
npm run dev           # Start server with auto-restart (nodemon)
npm run dev:tunnel    # Start server + ngrok tunnel together (recommended for DataDome testing)
npm start             # Start server without auto-restart
npm start:tunnel      # Start server + ngrok tunnel together (production mode)
```

### Setup
```bash
cp .env.example .env    # Create environment file (required before first run)
```

The `.env` file requires:
- `DATADOME_SERVER_KEY`: Your DataDome API key
- `PORT`: Server port (default: 3000)

### Testing with ngrok
To test with a real public IP (DataDome sees localhost as local traffic):

**Automated approach (recommended):**
```bash
npm install -g ngrok                              # One-time install
ngrok config add-authtoken <YOUR_NGROK_TOKEN>    # One-time auth
npm run dev:tunnel                                # Runs server + ngrok together
```

**IMPORTANT:** The script will display the ngrok public URL prominently. You MUST access the application through this ngrok URL (e.g., `https://abc123.ngrok-free.app`), NOT through `localhost:3000`, otherwise DataDome will still see localhost IP.

**Manual approach:**
```bash
npm install -g ngrok
ngrok config add-authtoken <YOUR_NGROK_TOKEN>
npm run dev          # In one terminal
ngrok http 3000      # In another terminal
```

## Architecture

### Server Architecture (server.js)

The application runs **two Express servers** simultaneously:

1. **Main HTTP Server** (port 3000)
   - Serves the main application on `http://localhost:3000`
   - Protected by DataDome middleware instance (`ddMain`)
   - Endpoints:
     - `GET /` → Serves `public/index.html`
     - `GET /any-xhr` → Returns request/response headers as JSON (for AJAX testing)
     - `GET /any-document` → Returns headers in an HTML page (for full navigation testing)
   - Uses `express.static` to serve files from `public/`

2. **API HTTPS Server** (port 3443 on `api.localhost`)
   - Serves cross-origin API at `https://api.localhost:3443`
   - Protected by separate DataDome middleware instance (`ddApi`)
   - Requires SSL certificates: `api.localhost-key.pem` and `api.localhost.pem` (generate with `mkcert api.localhost`)
   - Endpoints:
     - `OPTIONS /cross-origin-xhr` → Handles CORS preflight
     - `GET /cross-origin-xhr` → Returns headers as JSON with CORS headers
   - Implements full CORS support with credentials and dynamic origin handling

### DataDome Integration

**Server-side**: Two separate DataDome middleware instances protect each server independently:
```javascript
const ddMain = new DatadomeExpress(process.env.DATADOME_SERVER_KEY);
app.use(ddMain.middleware());
```

**Client-side**: DataDome JavaScript tag initialized in HTML:
```html
<script>
  window.ddjskey = '5937CB836686F83D473E0A7011FA0E';
  window.ddoptions = { withCredentials: true };
</script>
<script src="https://js.datadome.co/tags.js"></script>
```

The client tag is loaded before Tailwind CSS to ensure DataDome can intercept requests early.

### CORS Configuration

The cross-origin API server implements CORS with:
- Dynamic origin reflection (`Access-Control-Allow-Origin` set to request origin)
- Credentials support (`Access-Control-Allow-Credentials: true`)
- Custom headers allowed: `Content-Type`, `User-Agent`
- Methods: `GET`, `OPTIONS`
- `Vary: Origin` header for proper caching

### Frontend (public/index.html)

Single-page application with:
- **Cookie management**: Displays DataDome cookie value, allows removal
- **Test buttons**:
  - "Trigger XHR to /any-xhr" → Same-origin fetch request
  - "Trigger Cross-Origin XHR" → Cross-origin fetch to HTTPS subdomain
  - "Navigate to /any-document" → Full page navigation
- **Challenge triggers**: Lists special User-Agent values that trigger DataDome challenges (BLOCKUA, HARDBLOCKUA, DeviceCheckTestUA, etc.)
- **Live cookie polling**: Monitors and displays cookie changes after requests
- **User-Agent display**: Shows current browser User-Agent

Uses Tailwind CSS via CDN (no build step required).

## Key Implementation Details

### SSL Certificate Setup
The cross-origin API requires local SSL certificates. Generate them with mkcert:
```bash
mkcert api.localhost
```
This creates `api.localhost-key.pem` and `api.localhost.pem` files. The server checks for these on startup and exits if missing.

### DataDome Testing
Special User-Agent strings trigger different DataDome responses:
- `BLOCKUA` → CAPTCHA challenge
- `BLOCKUA-HARDBLOCK` → CAPTCHA then hard block
- `HARDBLOCKUA` → Immediate hard block
- `DeviceCheckTestUA` → Device check challenge
- `DeviceCheckTestUA-BLOCKUA` → Device check then CAPTCHA
- `DeviceCheckTestUA-HARDBLOCK` → Device check then hard block
- `HARDBLOCK_UA` → Hard block on cross-domain XHR

### Dependencies
- `@datadome/module-express` (v2.2.0): DataDome Express middleware
- `express` (v4.21.2): Web framework
- `dotenv` (v16.4.5): Environment variable management
- `nodemon` (v3.1.0, dev): Auto-restart on file changes

## File Structure

```
.
├── server.js           # Main application server (dual server setup)
├── public/
│   └── index.html      # Frontend UI with DataDome integration
├── .env.example        # Environment variable template
├── package.json        # Dependencies and scripts
├── api.localhost-key.pem   # SSL key (generated locally, not in git)
└── api.localhost.pem       # SSL cert (generated locally, not in git)
```
