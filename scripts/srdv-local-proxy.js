/**
 * SRDV Technologies Local Proxy Relay
 * 
 * Run this script on your local machine (IP: 122.161.76.198) where your internet
 * IP is already whitelisted by SRDV.
 * 
 * Usage:
 *   node scripts/srdv-local-proxy.js
 * 
 * When running, you can expose this port using your devtunnel or ngrok:
 *   devtunnel host -p 3005
 * 
 * Then set SRDV_PROXY_URL=https://<your-tunnel-url>/api/proxy/srdv
 * in your cloud environment. All SRDV requests will be forwarded through
 * your local machine and exit from 122.161.76.198!
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const PORT = process.env.PROXY_PORT || 3005;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = reqUrl.searchParams.get('target') || 'https://flight.srdvapi.com/v8/rest/Search';

  if (reqUrl.pathname === '/ping' || reqUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'SRDV Local Proxy Relay is Active on 122.161.76.198', port: PORT }));
    return;
  }

  let bodyData = '';
  req.on('data', chunk => { bodyData += chunk; });
  req.on('end', () => {
    try {
      const parsedTarget = new URL(targetUrl);
      const isHttps = parsedTarget.protocol === 'https:';
      const client = isHttps ? https : http;

      console.log(`[SRDV Proxy] Forwarding ${req.method} request to: ${targetUrl}`);

      const proxyReq = client.request(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('[SRDV Proxy Error]', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Proxy forwarding failed: ${err.message}` }));
      });

      if (bodyData) {
        proxyReq.write(bodyData);
      }
      proxyReq.end();
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Invalid target URL: ${err.message}` }));
    }
  });
});

server.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`🚀 SRDV Local Relay Proxy is running on port ${PORT}`);
  console.log(`👉 Requests will exit through your IP (122.161.76.198)`);
  console.log(`👉 Test status: http://localhost:${PORT}/ping`);
  console.log('=====================================================');
});
