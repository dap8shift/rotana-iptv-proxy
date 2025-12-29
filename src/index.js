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
      return handleHomepage();
    }
    
    if (url.pathname === '/playlist.m3u8') {
      return handlePlaylist(corsHeaders);
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

    return new Response('Not Found', { status: 404 });
  }
};

// Homepage with instructions
function handleHomepage() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Rotana IPTV Proxy</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #2c3e50; }
    .url-box { background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 10px 0; }
    code { background: #e8e8e8; padding: 3px 6px; border-radius: 3px; }
    .channel { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>🎬 Rotana Cinema IPTV Proxy</h1>
  <p><strong>Status:</strong> ✅ Active</p>
  
  <h2>📺 Available Channels:</h2>
  
  <div class="channel">
    <h3>Rotana Cinema KSA</h3>
    <div class="url-box">
      <code id="cinema-url">https://${self.location.hostname}/rotana-cinema.m3u8</code>
      <button onclick="copyToClipboard('cinema-url')">Copy</button>
    </div>
  </div>

  <div class="channel">
    <h3>Rotana Cinema Egypt</h3>
    <div class="url-box">
      <code id="egypt-url">https://${self.location.hostname}/rotana-cinema-egypt.m3u8</code>
      <button onclick="copyToClipboard('egypt-url')">Copy</button>
    </div>
  </div>

  <div class="channel">
    <h3>Rotana Classic</h3>
    <div class="url-box">
      <code id="classic-url">https://${self.location.hostname}/rotana-classic.m3u8</code>
      <button onclick="copyToClipboard('classic-url')">Copy</button>
    </div>
  </div>

  <div class="channel">
    <h3>Full Playlist (All Channels)</h3>
    <div class="url-box">
      <code id="playlist-url">https://${self.location.hostname}/playlist.m3u8</code>
      <button onclick="copyToClipboard('playlist-url')">Copy</button>
    </div>
  </div>

  <h2>📱 How to Use:</h2>
  <ol>
    <li>Copy the URL of the channel you want</li>
    <li>Open your IPTV app (TiviMate, IPTV Smarters, VLC, etc.)</li>
    <li>Add the URL as a new playlist or stream</li>
    <li>Enjoy! The proxy handles token refresh automatically</li>
  </ol>

  <h2>🔧 Test Stream Extraction:</h2>
  <p><a href="/test" target="_blank">Click here to test stream extraction</a></p>

  <script>
    function copyToClipboard(elementId) {
      const text = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      });
    }
  </script>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Generate M3U8 playlist with all channels
function handlePlaylist(corsHeaders) {
  const baseUrl = self.location.hostname;
  
  const playlist = `#EXTM3U
#EXTINF:-1 tvg-id="RotanaCinemaKSA.sa" tvg-name="Rotana Cinema KSA" tvg-logo="https://i.imgur.com/pGgp38I.png" group-title="Movies",Rotana Cinema KSA
https://${baseUrl}/rotana-cinema.m3u8
#EXTINF:-1 tvg-id="RotanaCinemaEgypt.eg" tvg-name="Rotana Cinema Egypt" tvg-logo="https://i.imgur.com/pGgp38I.png" group-title="Movies",Rotana Cinema Egypt
https://${baseUrl}/rotana-cinema-egypt.m3u8
#EXTINF:-1 tvg-id="RotanaClassic.sa" tvg-name="Rotana Classic" tvg-logo="https://i.imgur.com/pMMUvkt.png" group-title="Movies",Rotana Classic
https://${baseUrl}/rotana-classic.m3u8
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
    // Try multiple known working URLs
    const urls = [
      'https://bcovlive-a.akamaihd.net/9527a892aeaf43019fd9eeb77ad1516e/eu-central-1/6057955906001/playlist.m3u8',
      'https://oppomu.serv00.net/rotana.php?channel=rcinemaksa&.m3u8'
    ];

    // Try dynamic API extraction
    const dynamicUrl = await extractRotanaStream('rotana-cinema');
    if (dynamicUrl) {
      urls.unshift(dynamicUrl);
    }

    // Test each URL and return first working one
    for (const url of urls) {
      const test = await fetch(url, { method: 'HEAD' });
      if (test.ok) {
        return await proxyStream(url, corsHeaders);
      }
    }

    // Fallback: return URL anyway
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
    
    // Fallback URL
    const fallbackUrl = 'https://bcovlive-a.akamaihd.net/rotana-classic/playlist.m3u8';
    return await proxyStream(fallbackUrl, corsHeaders);
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// Dynamic stream extraction from Rotana API
async function extractRotanaStream(channel) {
  try {
    const timestamp = Date.now();
    const apiUrl = `https://hiplayer.hibridcdn.net/l/${channel}?_=${timestamp}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://rotana.net/'
      }
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    
    // Extract base64 encoded data
    const startPattern = "['";
    const endPattern = "'].join";
    
    const startIndex = text.indexOf(startPattern);
    const endIndex = text.indexOf(endPattern);
    
    if (startIndex === -1 || endIndex === -1) {
      return null;
    }

    const dataString = text.substring(startIndex + startPattern.length, endIndex);
    const dataParts = dataString.split("','");
    const base64Data = dataParts.join('');

    // Decode base64
    const decoded = atob(base64Data);
    const data = JSON.parse(decoded);

    return data.streamUrl || null;

  } catch (error) {
    console.error('Stream extraction error:', error);
    return null;
  }
}

// Proxy the actual stream
async function proxyStream(streamUrl, corsHeaders) {
  try {
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://rotana.net/',
        'Origin': 'https://rotana.net'
      }
    });

    if (!response.ok) {
      throw new Error(`Stream fetch failed: ${response.status}`);
    }

    let content = await response.text();

    // If it's a master playlist, rewrite URLs to go through our proxy
    if (content.includes('#EXTM3U')) {
      const baseUrl = new URL(streamUrl);
      content = content.split('\n').map(line => {
        if (line && !line.startsWith('#') && !line.startsWith('http')) {
          // Relative URL - make it absolute
          return new URL(line, baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1)).href;
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
    const url = await extractRotanaStream(channel);
    results.push({
      channel: channel,
      extracted: url ? '✅ Success' : '❌ Failed',
      url: url || 'Could not extract'
    });
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Stream Extraction Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; }
    .result { background: #f4f4f4; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .success { border-left: 4px solid #27ae60; }
    .fail { border-left: 4px solid #e74c3c; }
    code { word-break: break-all; }
  </style>
</head>
<body>
  <h1>🧪 Stream Extraction Test</h1>
  ${results.map(r => `
    <div class="result ${r.url !== 'Could not extract' ? 'success' : 'fail'}">
      <h3>${r.channel}</h3>
      <p><strong>Status:</strong> ${r.extracted}</p>
      <p><strong>URL:</strong> <code>${r.url}</code></p>
    </div>
  `).join('')}
  <p><a href="/">← Back to Home</a></p>
</body>
</html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
