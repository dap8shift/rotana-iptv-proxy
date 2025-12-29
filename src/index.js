// Fully Automatic Token Scraper & IPTV Proxy
// Auto-scrapes fresh tokens from elahmad.com

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
    
    // Playlist
    if (url.pathname === '/playlist.m3u8') {
      return handlePlaylist(corsHeaders);
    }
    
    // Streams - Auto-scrape tokens
    if (url.pathname === '/rotana-cinema.m3u8') {
      return await handleAutoStream('rotana_cinema', corsHeaders, ctx);
    }
    
    if (url.pathname === '/rotana-classic.m3u8') {
      return await handleAutoStream('rotana_classic', corsHeaders, ctx);
    }
    
    if (url.pathname === '/rotana-aflam.m3u8') {
      return await handleAutoStream('rotana_aflam', corsHeaders, ctx);
    }
    
    if (url.pathname === '/rotana-drama.m3u8') {
      return await handleAutoStream('rotana_drama', corsHeaders, ctx);
    }
    
    // Test scraper
    if (url.pathname === '/test') {
      return await testScraper(corsHeaders);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// Cache for storing scraped URLs
const streamCache = new Map();

// Homepage
function handleHomepage() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Auto Token Scraper IPTV Proxy</title>
  <style>
    body { font-family: Arial; max-width: 900px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #2c3e50; }
    .status { background: #27ae60; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; }
    .channel { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    code { background: #e8e8e8; padding: 5px 10px; border-radius: 3px; display: block; margin: 10px 0; word-break: break-all; }
    button { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer; margin: 5px; }
    button:hover { background: #2980b9; }
    .feature { background: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>🤖 Fully Automatic IPTV Proxy</h1>
  <div class="status">✅ AUTO-SCRAPING ACTIVE</div>
  
  <div class="feature">
    <strong>🚀 Features:</strong>
    <ul>
      <li>✅ Automatic token scraping from elahmad.com</li>
      <li>✅ Auto-refresh every 20 minutes</li>
      <li>✅ Zero manual updates needed</li>
      <li>✅ Permanent URLs - never change</li>
      <li>✅ Works with ALL IPTV apps</li>
    </ul>
  </div>
  
  <h2>📺 Your Permanent URLs:</h2>
  
  <div class="channel">
    <h3>Rotana Cinema KSA</h3>
    <code id="cinema">https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-cinema.m3u8</code>
    <button onclick="copy('cinema')">Copy</button>
    <button onclick="test('/rotana-cinema.m3u8')">Test</button>
  </div>

  <div class="channel">
    <h3>Rotana Classic</h3>
    <code id="classic">https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-classic.m3u8</code>
    <button onclick="copy('classic')">Copy</button>
    <button onclick="test('/rotana-classic.m3u8')">Test</button>
  </div>

  <div class="channel">
    <h3>Rotana Aflam</h3>
    <code id="aflam">https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-aflam.m3u8</code>
    <button onclick="copy('aflam')">Copy</button>
    <button onclick="test('/rotana-aflam.m3u8')">Test</button>
  </div>

  <div class="channel">
    <h3>Rotana Drama</h3>
    <code id="drama">https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-drama.m3u8</code>
    <button onclick="copy('drama')">Copy</button>
    <button onclick="test('/rotana-drama.m3u8')">Test</button>
  </div>

  <div class="channel">
    <h3>📋 Full Playlist</h3>
    <code id="playlist">https://rotana-iptv-proxy.iptv-konsi.workers.dev/playlist.m3u8</code>
    <button onclick="copy('playlist')">Copy</button>
  </div>

  <h2>🧪 Test Scraper:</h2>
  <p><a href="/test" style="color: #3498db; font-weight: bold;">Click to test auto-scraping</a></p>

  <h2>📱 How It Works:</h2>
  <ol>
    <li>Add the URLs above to your IPTV app ONCE</li>
    <li>Worker automatically scrapes fresh tokens from elahmad.com</li>
    <li>Tokens cached for 20 minutes, then auto-refreshed</li>
    <li>You never touch it again - it just works! 🎉</li>
  </ol>

  <script>
    function copy(id) {
      navigator.clipboard.writeText(document.getElementById(id).textContent)
        .then(() => alert('✅ Copied!'));
    }
    function test(path) {
      window.open(path, '_blank');
    }
  </script>
</body>
</html>
  `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

// Playlist
function handlePlaylist(corsHeaders) {
  const playlist = `#EXTM3U
#EXTINF:-1 tvg-logo="https://i.imgur.com/pGgp38I.png" group-title="Movies",Rotana Cinema KSA
https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-cinema.m3u8
#EXTINF:-1 tvg-logo="https://i.imgur.com/pMMUvkt.png" group-title="Movies",Rotana Classic
https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-classic.m3u8
#EXTINF:-1 tvg-logo="https://i.imgur.com/rotana.png" group-title="Movies",Rotana Aflam
https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-aflam.m3u8
#EXTINF:-1 tvg-logo="https://i.imgur.com/rotana.png" group-title="Drama",Rotana Drama
https://rotana-iptv-proxy.iptv-konsi.workers.dev/rotana-drama.m3u8
`;
  
  return new Response(playlist, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'no-cache'
    }
  });
}

// Auto-scrape and serve stream
async function handleAutoStream(channelId, corsHeaders, ctx) {
  try {
    // Check cache first (20 min cache)
    const cacheKey = `stream_${channelId}`;
    const cached = streamCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 20 * 60 * 1000) {
      console.log(`Using cached URL for ${channelId}`);
      return await proxyStream(cached.url, corsHeaders);
    }
    
    // Scrape fresh URL
    console.log(`Scraping fresh URL for ${channelId}`);
    const streamUrl = await scrapeStreamUrl(channelId);
    
    if (!streamUrl) {
      throw new Error('Failed to scrape stream URL');
    }
    
    // Cache it
    streamCache.set(cacheKey, {
      url: streamUrl,
      timestamp: Date.now()
    });
    
    // Proxy the stream
    return await proxyStream(streamUrl, corsHeaders);
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Scrape stream URL from elahmad.com
async function scrapeStreamUrl(channelId) {
  try {
    const pageUrl = `https://www.elahmad.com/tv/watchtv.php?id=${channelId}`;
    
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.elahmad.com/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract m3u8 URL from HTML
    // Pattern 1: Look for .m3u8 URLs
    const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
    const matches = html.match(m3u8Regex);
    
    if (matches && matches.length > 0) {
      // Return the first valid m3u8 URL with token
      for (const url of matches) {
        if (url.includes('token=') || url.includes('?')) {
          return url;
        }
      }
      return matches[0];
    }
    
    // Pattern 2: Look for iframe src
    const iframeRegex = /src=["']([^"']+)["']/gi;
    const iframeMatches = [...html.matchAll(iframeRegex)];
    
    for (const match of iframeMatches) {
      const iframeSrc = match[1];
      if (iframeSrc.includes('embed') || iframeSrc.includes('player')) {
        // Fetch iframe page
        const iframeResponse = await fetch(iframeSrc, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': pageUrl
          }
        });
        
        if (iframeResponse.ok) {
          const iframeHtml = await iframeResponse.text();
          const iframeM3u8 = iframeHtml.match(m3u8Regex);
          
          if (iframeM3u8 && iframeM3u8.length > 0) {
            return iframeM3u8[0];
          }
        }
      }
    }
    
    // Pattern 3: Look for source URLs in JavaScript
    const sourceRegex = /source[:\s]+["']([^"']+\.m3u8[^"']*)["']/gi;
    const sourceMatches = [...html.matchAll(sourceRegex)];
    
    if (sourceMatches.length > 0) {
      return sourceMatches[0][1];
    }
    
    throw new Error('No m3u8 URL found in page');
    
  } catch (error) {
    console.error(`Scraping failed for ${channelId}:`, error.message);
    return null;
  }
}

// Proxy the stream
async function proxyStream(streamUrl, corsHeaders) {
  try {
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.elahmad.com/',
        'Origin': 'https://www.elahmad.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Stream returned ${response.status}`);
    }
    
    let content = await response.text();
    
    // Fix relative URLs in m3u8
    if (content.includes('#EXTM3U')) {
      const baseUrl = new URL(streamUrl);
      const basePath = baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
      
      content = content.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
          // Preserve token from original URL
          const tokenMatch = streamUrl.match(/\?token=[^&\s]+/);
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
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    throw new Error(`Proxy failed: ${error.message}`);
  }
}

// Test scraper endpoint
async function testScraper(corsHeaders) {
  const channels = ['rotana_cinema', 'rotana_classic', 'rotana_aflam', 'rotana_drama'];
  const results = [];
  
  for (const channel of channels) {
    const startTime = Date.now();
    const url = await scrapeStreamUrl(channel);
    const duration = Date.now() - startTime;
    
    results.push({
      channel: channel,
      status: url ? '✅ Success' : '❌ Failed',
      url: url || 'Scraping failed',
      time: `${duration}ms`
    });
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Auto-Scraper Test</title>
  <style>
    body { font-family: Arial; max-width: 1000px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #2c3e50; }
    .result { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .success { border-left: 4px solid #27ae60; }
    .fail { border-left: 4px solid #e74c3c; }
    code { background: #f4f4f4; padding: 10px; display: block; border-radius: 3px; word-break: break-all; font-size: 11px; margin: 10px 0; }
    .time { color: #7f8c8d; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🧪 Auto-Scraper Test Results</h1>
  <p>Testing automatic URL extraction from elahmad.com...</p>
  
  ${results.map(r => `
    <div class="result ${r.url.startsWith('http') ? 'success' : 'fail'}">
      <h3>${r.channel} <span class="time">(${r.time})</span></h3>
      <p><strong>Status:</strong> ${r.status}</p>
      <p><strong>Extracted URL:</strong></p>
      <code>${r.url}</code>
    </div>
  `).join('')}
  
  <p><a href="/" style="color: #3498db;">← Back to Home</a></p>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
