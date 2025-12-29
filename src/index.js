// Rotana Cinema IPTV Proxy - Cloudflare Worker
// Handles token refresh and provides permanent M3U8 URLs

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for IPTV compatibility
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    if (url.pathname === '/') {
      return handleHomepage(url.host);
    }
    
    if (url.pathname === '/playlist.m3u8') {
      return handlePlaylist(url.host, corsHeaders);
    }
    
    if (url.pathname === '/rotana-cinema.m3u8') {
      return await handleRotanaCinema(corsHeaders);
    }
    
    if (url.pathname === '/rotana-cinema-egypt.m3u8') {
      return await handleRotanaCinemaEgypt(corsHeaders);
    }
    
    if (url.pathname === '/rotana-classic.m3u8') {
      return await handleRotanaClassic(corsHeaders);
    }

    if (url.pathname === '/test') {
      return await testStreamExtraction(corsHeaders);
    }

    return new Response('Not Found - Available routes: /, /playlist.m3u8, /rotana-cinema.m3u8, /rotana-cinema-egypt.m3u8, /rotana-classic.m3u8, /test', { 
      status: 404,
      headers: corsHeaders 
    });
  }
};

// Homepage with instructions
function handleHomepage(host) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Rotana IPTV Proxy</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 800px; 
      margin: 50px auto; 
      padding: 20px; 
      background: #f5f5f5; 
    }
    h1 { color: #2c3e50; }
    .status { 
      background: #27ae60; 
      color: white; 
      padding: 10px; 
      border-radius: 5px; 
      display: inline-block; 
    }
    .url-box { 
      background: #fff; 
      padding: 15px; 
      border-radius: 5px; 
      margin: 10px 0; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
    }
    code { 
      background: #e8e8e8; 
      padding: 5px 10px; 
      border-radius: 3px; 
      display: block; 
      margin: 10px 0; 
      word-break: break-all; 
      font-size: 14px;
    }
    .channel { 
      margin: 20px 0; 
      padding: 15px; 
      border: 1px solid #ddd; 
      border-radius: 5px; 
      background: #fff; 
    }
    button { 
      background: #3498db; 
      color: white; 
      border: none; 
      padding: 8px 15px; 
      border-radius: 3px; 
      cursor: pointer; 
      font-size: 14px;
    }
    button:hover { background: #2980b9; }
    .instructions { 
      background: #fff; 
      padding: 15px; 
      border-radius: 5px; 
      margin: 20px 0; 
    }
  </style>
</head>
<body>
  <h1>🎬 Rotana Cinema IPTV Proxy</h1>
  <div class="status">✅ Active and Running</div>
  
  <h2>📺 Available Channels:</h2>
  
  <div class="channel">
    <h3>Rotana Cinema KSA</h3>
    <div class="url-box">
      <code id="cinema-url">https://${host}/rotana-cinema.m3u8</code>
      <button onclick="copyToClipboard('cinema-url')">Copy URL</button>
    </div>
  </div>

  <div class="channel">
    <h3>Rotana Cinema Egypt</h3>
    <div class="url-box">
      <code id="egypt-url">https://${host}/rotana-cinema-egypt.m3u8</code>
      <button onclick="copyToClipboard('egypt-url')">Copy URL</button>
    </div>
  </div>

  <div class="channel">
    <h3>Rotana Classic</h3>
    <div class="url-box">
      <code id="classic-url">https://${host}/rotana-classic.m3u8</code>
      <button onclick="copyToClipboard('classic-url')">Copy URL</button>
    </div>
  </div>

  <div class="channel">
    <h3>📋 Full Playlist (All Channels)</h3>
    <div class="url-box">
      <code id="playlist-url">https://${host}/playlist.m3u8</code>
      <button onclick="copyToClipboard('playlist-url')">Copy URL</button>
    </div>
    <p><small>Use this URL in your IPTV app to add all channels at once</small></p>
  </div>

  <div class="instructions">
    <h2>📱 How to Use:</h2>
    <ol>
      <li>Click "Copy URL" on any channel above</li>
      <li>Open your IPTV app (TiviMate, IPTV Smarters, VLC, etc.)</li>
      <li>Add the URL as a new playlist or stream</li>
      <li>Enjoy! The proxy handles token refresh automatically ✨</li>
    </ol>
  </div>

  <div class="instructions">
    <h2>🔧 Test & Debug:</h2>
    <p><a href="/test" target="_blank" style="color: #3498db;">Click here to test stream extraction</a></p>
  </div>

  <script>
    function copyToClipboard(elementId) {
      const text = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('✅ URL copied to clipboard!');
      }).catch(() => {
        alert('❌ Failed to copy. Please copy manually.');
      });
    }
  </script>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Generate M3U8 playlist with all channels
function handlePlaylist(host, corsHeaders) {
  const playlist = `#EXTM3U
#EXTINF:-1 tvg-id="RotanaCinemaKSA.sa" tvg-name="Rotana Cinema KSA" tvg-logo="https://i.imgur.com/pGgp38I.png" group-title="Movies",Rotana Cinema KSA
https://${host}/rotana-cinema.m3u8
#EXTINF:-1 tvg-id="RotanaCinemaEgypt.eg" tvg-name="Rotana Cinema Egypt" tvg-logo="https://i.imgur.com/pGgp38I.png" group-title="Movies",Rotana Cinema Egypt
https://${host}/rotana-cinema-egypt.m3u8
#EXTINF:-1 tvg-id="RotanaClassic.sa" tvg-name="Rotana Classic" tvg-logo="https://i.imgur.com/pMMUvkt.png" group-title="Movies",Rotana Classic
https://${host}/rotana-classic.m3u8
`;

  return new Response(playlist, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// Extract Rotana Cinema KSA stream
async function handleRotanaCinema(corsHeaders) {
  try {
    // Multiple fallback URLs
    const urls = [
      'https://bcovlive-a.akamaihd.net/9527a892aeaf43019fd9eeb77ad1516e/eu-central-1/6057955906001/playlist.m3u8',
      'https://dai.google.com/linear/hls/event/rotana-cinema/master.m3u8'
    ];

    // Try dynamic API extraction first
    try {
      const dynamicUrl = await extractRotanaStream('rotana-cinema');
      if (dynamicUrl) {
        urls.unshift(dynamicUrl);
      }
    } catch (e) {
      console.log('Dynamic extraction failed:', e.message);
    }

    // Return first URL (will be tested by player)
    return await proxyStream(urls[0], corsHeaders);

  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// Extract Rotana Cinema Egypt stream
async function handleRotanaCinemaEgypt(corsHeaders) {
  const url = 'https://dai.google.com/linear/hls/pa/event/3nre1M54SiWmGzcTHQlLDA/stream/3350ee51-c84b-44a7-9bf8-3d06c92e6481:BRU/master.m3u8';
  return await proxyStream(url, corsHeaders);
}

// Extract Rotana Classic stream
async function handleRotanaClassic(corsHeaders) {
  try {
    const dynamicUrl = await extractRotanaStream('rotana-classical');
    if (dynamicUrl) {
      return await proxyStream(dynamicUrl, corsHeaders);
    }
  } catch (e) {
    console.log('Dynamic extraction failed:', e.message);
  }
  
  // Fallback URL
  const fallbackUrl = 'https://bcovlive-a.akamaihd.net/9527a892aeaf43019fd9eeb77ad1516e/eu-central-1/6057955906001/playlist.m3u8';
  return await proxyStream(fallbackUrl, corsHeaders);
}

// Dynamic stream extraction from Rotana API
async function extractRotanaStream(channel) {
  const timestamp = Date.now();
  const apiUrl = `https://hiplayer.hibridcdn.net/l/${channel}?_=${timestamp}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://rotana.net/'
    },
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const text = await response.text();
  
  // Extract base64 encoded data
  const startPattern = "['";
  const endPattern = "'].join";
  
  const startIndex = text.indexOf(startPattern);
  const endIndex = text.indexOf(endPattern);
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Pattern not found in API response');
  }

  const dataString = text.substring(startIndex + startPattern.length, endIndex);
  const dataParts = dataString.split("','");
  const base64Data = dataParts.join('');

  // Decode base64
  const decoded = atob(base64Data);
  const data = JSON.parse(decoded);

  if (!data.streamUrl) {
    throw new Error('No streamUrl in decoded data');
  }

  return data.streamUrl;
}

// Proxy the actual stream
async function proxyStream(streamUrl, corsHeaders) {
  try {
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://rotana.net/',
        'Origin': 'https://rotana.net'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Stream fetch failed with status ${response.status}`);
    }

    let content = await response.text();

    // If it's a master playlist, rewrite relative URLs to absolute
    if (content.includes('#EXTM3U')) {
      const baseUrl = new URL(streamUrl);
      const basePath = baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
      
      content = content.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
          return basePath + trimmed;
        }
        return line;
      }).join('\n');
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    return new Response(`Proxy Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// Test endpoint to verify stream extraction
async function testStreamExtraction(corsHeaders) {
  const channels = ['rotana-cinema', 'rotana-classical'];
  const results = [];

  for (const channel of channels) {
    try {
      const url = await extractRotanaStream(channel);
      results.push({
        channel: channel,
        status: '✅ Success',
        url: url
      });
    } catch (error) {
      results.push({
        channel: channel,
        status: '❌ Failed',
        url: error.message
      });
    }
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Stream Extraction Test</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 900px; 
      margin: 50px auto; 
      padding: 20px; 
      background: #f5f5f5;
    }
    .result { 
      background: #fff; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 5px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .success { border-left: 4px solid #27ae60; }
    .fail { border-left: 4px solid #e74c3c; }
    code { 
      word-break: break-all; 
      font-size: 12px; 
      background: #f4f4f4; 
      padding: 10px; 
      display: block; 
      border-radius: 3px;
      margin: 10px 0;
    }
    h3 { margin: 0 0 10px 0; }
  </style>
</head>
<body>
  <h1>🧪 Stream Extraction Test</h1>
  <p>Testing dynamic API extraction from Rotana servers...</p>
  ${results.map(r => `
    <div class="result ${r.url.startsWith('http') ? 'success' : 'fail'}">
      <h3>${r.channel}</h3>
      <p><strong>Status:</strong> ${r.status}</p>
      <p><strong>Result:</strong></p>
      <code>${r.url}</code>
    </div>
  `).join('')}
  <p><a href="/" style="color: #3498db;">← Back to Home</a></p>
</body>
</html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
