const { app, BrowserWindow, session } = require('electron');
const http = require('http'), fs = require('fs'), path = require('path');

// Serve index.html on http://localhost:5173 so GitHub sign-in (Supabase OAuth) has a valid redirect URL.
app.whenReady().then(() => {
  http.createServer((_q, r) => {
    r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    r.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }).listen(5173, 'localhost', () => {
    // Let the app talk to a local Ollama server without CORS/origin issues.
    const f = { urls: ['http://localhost:11434/*'] };
    session.defaultSession.webRequest.onBeforeSendHeaders(f, (d, cb) => {
      delete d.requestHeaders.Origin; cb({ requestHeaders: d.requestHeaders });
    });
    session.defaultSession.webRequest.onHeadersReceived(f, (d, cb) => {
      cb({ responseHeaders: { ...d.responseHeaders, 'Access-Control-Allow-Origin': ['*'], 'Access-Control-Allow-Headers': ['*'] } });
    });
    const w = new BrowserWindow({ width: 1440, height: 900, backgroundColor: '#0f1115', autoHideMenuBar: true, title: 'Dunah IDE' });
    w.loadURL('http://localhost:5173');
  });
});
app.on('window-all-closed', () => app.quit());
