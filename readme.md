# DataDome + Express Demo (Tailwind via CDN)

This project demonstrates how to protect an **Express** server with [DataDome](https://datadome.co/) using:

- ✅ **Server-side middleware** (`@datadome/module-express`)  
- ✅ **Client-side JS tag** (renders challenges in the browser)  
- ✅ **TailwindCSS via CDN** (no build step required)  
- ✅ **Two demo endpoints**:
  - `/any-xhr` → async XHR request, headers returned as JSON
  - `/any-document` → full page navigation, headers displayed in HTML

---

## 🚀 Quick Start

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```
# 1. Create your environment file
```bash
cp .env.example .env
```
# edit .env and set DATADOME_SERVER_KEY=...

# 2. Install dependencies
```bash
npm install
```

# 3a. Run in dev mode (auto-restart with nodemon)
```bash
npm run dev
```

# 3b. Run in dev mode WITH ngrok tunnel (recommended for testing)
```bash
npm run dev:tunnel
```
This will automatically start both the server and ngrok tunnel in a single command!

**⚠️ IMPORTANT:** When the tunnel starts, look for the ngrok public URL in the output (e.g., `https://abc123.ngrok-free.app`). **You MUST use this URL to access your app**, not `http://localhost:3000`. Only the ngrok URL will show your real public IP to DataDome.

# Public Testing with ngrok ("grok")

By default, **DataDome** sees requests coming from `127.0.0.1` (localhost) as **local IP traffic**.  
To test with a **real public IP**, you can expose your local server using [ngrok](https://ngrok.com/).

## 🚀 Setup Instructions

### Quick Setup (Automated)

1. **Install ngrok globally**
   ```bash
   npm install -g ngrok
   ```

2. **Authenticate ngrok (first time only)**
   ```bash
   ngrok config add-authtoken <YOUR_NGROK_TOKEN>
   ```

3. **Run server + ngrok together**
   ```bash
   npm run dev:tunnel
   ```

That's it! Both your server and ngrok tunnel will start automatically.

### Manual Setup (Alternative)

If you prefer to run them separately:

1. **Run your local server**
   ```bash
   npm run dev
   ```

2. **In a separate terminal, start ngrok**
   ```bash
   ngrok http 3000
   ```

## 🔗 Example Output

When you start the tunnel, you’ll see output similar to:

```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

Open the **HTTPS URL** in your browser.  
👉 DataDome will now see requests coming from **ngrok’s public IP** instead of `127.0.0.1`.

## 💡 Tips

- Each time you restart ngrok, you’ll get a **new public IP and URL**.  
- For longer testing sessions, you can **reserve a domain** in your ngrok account.  

✅ You're now testing your local server with a real public IP via ngrok!

---

## 🔍 Troubleshooting

### Issue: DataDome still shows localhost IP (`0:0:0:0:0:0:0:1` or `127.0.0.1`)

**Problem:** You're accessing the site via `http://localhost:3000` instead of the ngrok URL.

**Solution:**
1. Run `npm run dev:tunnel`
2. Look for the ngrok URL in the terminal output (highlighted in green):
   ```
   ✨ NGROK TUNNEL IS READY! ✨
   👉 Access your app at: https://abc123.ngrok-free.app
   ```
3. **Copy and paste that HTTPS URL into your browser** (not localhost!)
4. Now DataDome will see your real public IP

**Quick Check:**
- ❌ Wrong: `http://localhost:3000` → Shows local IP in DataDome
- ✅ Correct: `https://abc123.ngrok-free.app` → Shows real public IP in DataDome

### Ngrok Dashboard

When ngrok is running, you can view all requests at: **http://127.0.0.1:4040**

This dashboard shows:
- All HTTP requests going through the tunnel
- Request/response details
- Replay requests for testing