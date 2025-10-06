#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('\n🚀 Starting server and ngrok tunnel...\n');

// Start the server
const serverCmd = process.argv[2] === 'prod' ? 'node' : 'nodemon';
const server = spawn(serverCmd, ['server.js'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true
});

server.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${data}`);
});

// Wait a bit for server to start, then start ngrok
setTimeout(() => {
  const ngrok = spawn('ngrok', ['http', '3000', '--log', 'stdout'], {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true
  });

  let ngrokUrl = null;
  let urlDisplayed = false;

  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(`\x1b[35m[NGROK]\x1b[0m ${output}`);

    // Try to extract the ngrok URL
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok-free\.app/);
    if (urlMatch && !urlDisplayed) {
      ngrokUrl = urlMatch[0];
      urlDisplayed = true;

      // Display prominent message after a short delay to let ngrok settle
      setTimeout(() => {
        console.log('\n' + '='.repeat(80));
        console.log('\x1b[32m\x1b[1m✨ NGROK TUNNEL IS READY! ✨\x1b[0m');
        console.log('='.repeat(80));
        console.log(`\n\x1b[33m👉 Access your app at: \x1b[1m${ngrokUrl}\x1b[0m`);
        console.log(`\x1b[90m   (Do NOT use http://localhost:3000 for DataDome testing)\x1b[0m\n`);
        console.log('='.repeat(80));
        console.log('\n\x1b[36mℹ️  The ngrok URL will show your real public IP to DataDome\x1b[0m');
        console.log('\x1b[36mℹ️  Press Ctrl+C to stop both server and tunnel\x1b[0m\n');

        // Try to get the ngrok API URL
        fetchNgrokUrl();
      }, 2000);
    }
  });

  ngrok.on('error', (err) => {
    console.error('\x1b[31m[ERROR]\x1b[0m Failed to start ngrok:', err.message);
    console.error('\x1b[33m[TIP]\x1b[0m Make sure ngrok is installed: npm install -g ngrok');
    console.error('\x1b[33m[TIP]\x1b[0m Make sure you\'ve authenticated: ngrok config add-authtoken <YOUR_TOKEN>');
    process.exit(1);
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server and ngrok tunnel...\n');
    server.kill();
    ngrok.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    server.kill();
    ngrok.kill();
    process.exit(0);
  });

}, 1000);

// Function to fetch ngrok URL from API
function fetchNgrokUrl() {
  setTimeout(() => {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data);
          if (tunnels.tunnels && tunnels.tunnels.length > 0) {
            const httpsTunnel = tunnels.tunnels.find(t => t.proto === 'https') || tunnels.tunnels[0];
            if (httpsTunnel && httpsTunnel.public_url) {
              console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
              console.log(`\x1b[32m\x1b[1m  🌍 PUBLIC URL: ${httpsTunnel.public_url}\x1b[0m`);
              console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

              // Show ngrok dashboard
              console.log(`\x1b[36m📊 Ngrok Dashboard: http://127.0.0.1:4040\x1b[0m\n`);
            }
          }
        } catch (err) {
          // Silently fail if we can't parse the response
        }
      });
    });

    req.on('error', () => {
      // Ngrok API not ready yet, that's okay
    });
  }, 3000);
}
