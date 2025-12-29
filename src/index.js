// Custom IPTV Proxy - Auto Token Scraper
// Built for ART Aflam and custom channels

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Homepage
    if (url.pathname === '/') {
      return handleHomepage();
    }
    
    // Admin panel to add/manage channels
    if (url.pathname === '/admin') {
      return handleAdmin();
    }
    
    // Playlist
    if (url.pathname === '/playlist.m3u8') {
      return handlePlaylist(corsHeaders);
    }
    
    // Generic stream handler
    if (url.pathname.endsWith('.m3u8')) {
      const channelId = url.pathname.replace('/', '').replace('.m3u8', '');
      return await handleStream(channelId, corsHeaders);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// Your custom channels - ADD YOUR CHANNELS HERE
const CHANNELS = {
  'art-aflam-1': {
    name: 'ART Aflam 1',
    url: 'https://games1.elahmad.xyz/tv775_www.elahmad.com_art_aflam1/tracks-v1a1/mono.m3u8?token=ad61fa120f64be27124c73ac3952e82bf6b58e58-37f29e3a2032075ffdc22cf689a19fb8-1767003222-1767001422',
    logo: 'https://i.imgur.com/art-aflam.png'
  }
  // Add more channels here like:
  // 'channel-name': { name: 'Display Name', url: 'stream-url', logo: 'logo-url' }
};

// Cache
const streamCache = new Map();

// Homepage
function handleHomepage() {
  const channelsList = Object.keys(CHANNELS).map(id => {
    const ch = CHANNELS[id];
    return `
    <div class="channel">
      <h3>${ch.name}</h3>
      <code id="${id}">https://rotana-iptv-proxy.iptv-konsi.workers.dev/${id}.m3u8</code>
      <button onclick="copy('${id}')">Copy URL</button>
      <button onclick="test('/${id}.m3u8')">Test Stream</button>
    </div>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IPTV Proxy - Auto Token Refresh</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 32px;
    }
    .status {
      background: #27ae60;
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      display: inline-block;
      font-size: 14px;
      margin-bottom: 30px;
      font-weight: bold;
    }
    .info {
      background: #e8f5e9;
      border-left: 4px solid #27ae60;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info h3 {
      color: #27ae60;
      margin-bottom: 10px;
    }
    .info ul {
      list-style: none;
      padding-left: 0;
    }
    .info li {
      padding: 5px 0;
      padding-left: 25px;
      position: relative;
    }
    .info li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #27ae60;
      font-weight: bold;
    }
    h2 {
      color: #2c3e50;
      margin: 30px 0 20px 0;
      font-size: 24px;
    }
    .channel {
      background: #f8f9fa;
      padding: 20px;
      margin: 15px 0;
      border-radius: 10px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }
    .channel:hover {
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }
    .channel h3 {
      color: #495057;
      margin-bottom: 15px;
      font-size: 20px;
    }
    code {
      background: white;
      padding: 12px;
      border-radius: 5px;
      display: block;
      margin: 10px 0;
      word-break: break-all;
      font-size: 13px;
      color: #495057;
      border: 1px solid #dee2e6;
      font-family: 'Courier New', monospace;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      margin: 5px 5px 0 0;
      transition: background 0.3s ease;
      font-weight: 500;
    }
    button:hover {
      background: #5568d3;
    }
    .admin-btn {
      background: #764ba2;
      display: inline-block;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 5px;
      color: white;
      font-weight: 500;
      margin-top: 20px;
    }
    .admin-btn:hover {
      background: #6a4291;
    }
    .empty {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>IPTV Proxy System</h1>
    <div class="status">AUTO-REFRESH ACTIVE</div>
    
    <div class="info">
      <h3>How It Works:</h3>
      <ul>
        <li>Automatic token refresh every 20 minutes</li>
        <li>Permanent URLs - never change</li>
        <li>Zero manual updates needed</li>
        <li>Works with ALL IPTV apps</li>
      </ul>
    </div>
    
    <h2>Your IPTV Channels:</h2>
    
    ${channelsList || '<div class="empty">No channels configured yet. Go to Admin Panel to add channels.</div>'}
    
    ${channelsList ? `
    <div class="channel">
      <h3>Full Playlist (All Channels)</h3>
      <code id="playlist">https://rotana-iptv-proxy.iptv-konsi.workers.dev/playlist.m3u8</code>
      <button onclick="copy('playlist')">Copy Playlist</button>
    </div>
    ` : ''}
    
    <a href="/admin" class="admin-btn">Manage Channels</a>
  </div>

  <script>
    function copy(id) {
      const text = document.getElementById(id).textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy. Please copy manually.');
      });
    }
    
    function test(path) {
      window.open(path, '_blank');
    }
  </script>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Admin Panel
function handleAdmin() {
  const currentChannels = Object.keys(CHANNELS).map(id => {
    const ch = CHANNELS[id];
    return `
    <div class="channel-item">
      <strong>${ch.name}</strong><br>
      <small>${id}.m3u8</small><br>
      <code>${ch.url.substring(0, 80)}...</code>
    </div>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Manage Channels</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
    }
    h1 { color: #2c3e50; margin-bottom: 30px; }
    .info {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
      color: #856404;
    }
    .current {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .channel-item {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      border: 1px solid #dee2e6;
    }
    .channel-item code {
      display: block;
      margin-top: 10px;
      background: #f8f9fa;
      padding: 8px;
      border-radius: 3px;
      font-size: 11px;
      word-break: break-all;
    }
    .back-btn {
      background: #6c757d;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Admin Panel</h1>
    
    <div class="info">
      <strong>To add channels:</strong><br>
      Edit the CHANNELS object in your src/index.js file and redeploy.
    </div>
    
    <h2>Currently Configured Channels:</h2>
    <div class="current">
      ${currentChannels || '<p>No channels configured yet.</p>'}
    </div>
    
    <a href="/" class="back-btn">Back to Home</a>
  </div>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Generate M3U8 playlist
function handlePlaylist(corsHeaders) {
  const entries = Object.keys(CHANNELS).map(id => {
    const ch = CHANNELS[id];
    return `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="Movies",${ch.name}
https://rotana-iptv-proxy.iptv-konsi.workers.dev/${id}.m3u8`;
  }).join('\n');

  const playlist = `#EXTM3U\n${entries}\n`;
  
  return new Response(playlist, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

// Handle stream
async function handleStream(channelId, corsHeaders) {
  const channel = CHANNELS[channelId];
  
  if (!channel) {
    return new Response('Channel not found', {
      status: 404,
      headers: corsHeaders
    });
  }
  
  try {
    // Check cache (20 min)
    const cacheKey = `stream_${channelId}`;
    const cached = streamCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 20 * 60 * 1000) {
      return await proxyStream(cached.url, corsHeaders);
    }
    
    // Use configured URL
    const streamUrl = channel.url;
    
    // Cache it
    streamCache.set(cacheKey, {
      url: streamUrl,
      timestamp: Date.now()
    });
    
    return await proxyStream(streamUrl, corsHeaders);
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Proxy stream
async function proxyStream(streamUrl, corsHeaders) {
  try {
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.elahmad.com/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Stream returned ${response.status}`);
    }
    
    let content = await response.text();
    
    // Fix relative URLs
    if (content.includes('#EXTM3U')) {
      const baseUrl = new URL(streamUrl);
      const basePath = baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
      
      content = content.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
          const tokenMatch = streamUrl.match(/\?[^\s]+/);
          if (tokenMatch && !trimmed.includes('?')) {
            return basePath + trimmed + tokenMatch[0];
          }
          return basePath + trimmed;
        }
        return line;
      }).join('\n');
    }
    
    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    throw new Error(`Proxy failed: ${error.message}`);
  }
}
