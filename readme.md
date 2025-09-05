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

# 3. Run in dev mode (auto-restart with nodemon)
```bash
npm run dev
```

# Public Testing with ngrok ("grok")

By default, **DataDome** sees requests coming from `127.0.0.1` (localhost) as **local IP traffic**.  
To test with a **real public IP**, you can expose your local server using [ngrok](https://ngrok.com/).

## 🚀 Setup Instructions

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   ```

2. **Authenticate ngrok (first time only)**
   ```bash
   ngrok config add-authtoken <YOUR_NGROK_TOKEN>
   ```

3. **Run your local server**
   ```bash
   npm run dev
   ```

4. **Start the ngrok tunnel**
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

✅ You’re now testing your local server with a real public IP via ngrok!