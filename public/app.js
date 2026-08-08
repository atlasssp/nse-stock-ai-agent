/**
 * NSE Intraday AI Senior Market Researcher & Stock Analyst Application
 */

// Application State
const state = {
  currentSymbol: "RELIANCE",
  currentRange: "18m",
  stockData: null,
  watchlist: JSON.parse(localStorage.getItem("nse_watchlist")) || [
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "ICICIBANK", name: "ICICI Bank" },
    { symbol: "INFY", name: "Infosys" },
    { symbol: "TATAMOTORS", name: "Tata Motors" },
    { symbol: "SBIN", name: "State Bank of India" }
  ],
  availableStocks: [],
  toggles: {
    ema20: true,
    ema50: true,
    ema200: true,
    volume: true
  }
};

// DOM Element References
const elements = {
  stockSearchInput: document.getElementById("stockSearchInput"),
  searchBtn: document.getElementById("searchBtn"),
  searchSuggestions: document.getElementById("searchSuggestions"),
  refreshIndicesBtn: document.getElementById("refreshIndicesBtn"),
  clockDisplay: document.getElementById("clockDisplay"),
  tickerTapeTrack: document.getElementById("tickerTapeTrack"),
  watchlistItems: document.getElementById("watchlistItems"),
  addWatchlistBtn: document.getElementById("addWatchlistBtn"),
  
  // Stock Header
  stockSymbolDisplay: document.getElementById("stockSymbolDisplay"),
  stockCompanyDisplay: document.getElementById("stockCompanyDisplay"),
  stockPriceDisplay: document.getElementById("stockPriceDisplay"),
  stockChangeDisplay: document.getElementById("stockChangeDisplay"),
  val52High: document.getElementById("val52High"),
  val52Low: document.getElementById("val52Low"),
  val18mTrend: document.getElementById("val18mTrend"),
  val6mTrend: document.getElementById("val6mTrend"),
  valVolRatio: document.getElementById("valVolRatio"),

  // Chart Canvas & Controls
  stockChartCanvas: document.getElementById("stockChartCanvas"),
  chartLoadingOverlay: document.getElementById("chartLoadingOverlay"),
  timeframeButtons: document.querySelectorAll(".tf-btn"),
  toggleEMA20: document.getElementById("toggleEMA20"),
  toggleEMA50: document.getElementById("toggleEMA50"),
  toggleEMA200: document.getElementById("toggleEMA200"),
  toggleVolume: document.getElementById("toggleVolume"),

  // Intraday Trade Blueprint
  biasBadge: document.getElementById("biasBadge"),
  bpAction: document.getElementById("bpAction"),
  bpEntry: document.getElementById("bpEntry"),
  bpTargets: document.getElementById("bpTargets"),
  bpStopLoss: document.getElementById("bpStopLoss"),
  bpRR: document.getElementById("bpRR"),
  blueprintReasons: document.getElementById("blueprintReasons"),

  // Technical Gauge & Pivots
  gaugeCanvas: document.getElementById("gaugeCanvas"),
  gaugeLabel: document.getElementById("gaugeLabel"),
  pivR3: document.getElementById("pivR3"),
  pivR2: document.getElementById("pivR2"),
  pivR1: document.getElementById("pivR1"),
  pivP: document.getElementById("pivP"),
  pivS1: document.getElementById("pivS1"),
  pivS2: document.getElementById("pivS2"),
  pivS3: document.getElementById("pivS3"),

  // News & Report
  newsFeed: document.getElementById("newsFeed"),
  reportContent: document.getElementById("reportContent"),
  copyReportBtn: document.getElementById("copyReportBtn"),
  downloadReportBtn: document.getElementById("downloadReportBtn")
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  fetchAvailableStocks();
  fetchLiveIndicesData();
  renderWatchlist();
  analyzeStock(state.currentSymbol, state.currentRange);

  setupEventListeners();
});

// Real-time Clock
function initClock() {
  function update() {
    const now = new Date();
    elements.clockDisplay.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
  }
  update();
  setInterval(update, 1000);
}

// Fetch List of Top Indian Stocks for Search Auto-complete
async function fetchAvailableStocks() {
  try {
    const res = await fetch("/api/stocks");
    const data = await res.json();
    if (data.stocks) {
      state.availableStocks = data.stocks;
    }
  } catch (err) {
    console.error("Failed to fetch available stocks list:", err);
  }
}

// Fetch Live Market Indices (Nifty 50, Nifty Bank, Nifty IT, Nifty Fin)
async function fetchLiveIndicesData() {
  try {
    const res = await fetch("/api/indices");
    const data = await res.json();
    if (data.indices) {
      renderTickerTape(data.indices);
    }
  } catch (err) {
    console.error("Error fetching live indices:", err);
  }
}

function renderTickerTape(indices) {
  elements.tickerTapeTrack.innerHTML = indices.map(idx => {
    const isPos = idx.change >= 0;
    const sign = isPos ? '+' : '';
    const changeClass = isPos ? 'positive' : 'negative';
    return `
      <div class="ticker-item">
        <span class="ticker-name">${idx.name}</span>
        <span class="ticker-price">${idx.price.toLocaleString('en-IN')}</span>
        <span class="ticker-change ${changeClass}">${sign}${idx.change} (${sign}${idx.pChange}%)</span>
      </div>
    `;
  }).join('');
}

// Watchlist Rendering & Operations
function renderWatchlist() {
  elements.watchlistItems.innerHTML = state.watchlist.map(item => {
    const activeClass = item.symbol.toUpperCase() === state.currentSymbol.toUpperCase() ? 'active' : '';
    return `
      <div class="wl-item ${activeClass}" data-symbol="${item.symbol}">
        <div>
          <div class="wl-item-symbol">${item.symbol}</div>
          <div class="wl-item-name">${item.name}</div>
        </div>
        <button class="sm-btn remove-wl-btn" data-symbol="${item.symbol}" title="Remove">×</button>
      </div>
    `;
  }).join('');

  // Attach click handlers
  document.querySelectorAll(".wl-item").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-wl-btn")) {
        const sym = e.target.getAttribute("data-symbol");
        removeFromWatchlist(sym);
        return;
      }
      const sym = el.getAttribute("data-symbol");
      state.currentSymbol = sym;
      renderWatchlist();
      analyzeStock(state.currentSymbol, state.currentRange);
    });
  });
}

function addToWatchlist(symbol, name = "") {
  const cleanSym = symbol.toUpperCase().replace('.NS', '');
  if (!state.watchlist.some(i => i.symbol === cleanSym)) {
    state.watchlist.push({ symbol: cleanSym, name: name || cleanSym });
    localStorage.setItem("nse_watchlist", JSON.stringify(state.watchlist));
    renderWatchlist();
  }
}

function removeFromWatchlist(symbol) {
  state.watchlist = state.watchlist.filter(i => i.symbol !== symbol);
  localStorage.setItem("nse_watchlist", JSON.stringify(state.watchlist));
  renderWatchlist();
}

// Core Stock Analysis Call
async function analyzeStock(symbol, range = "18m") {
  elements.chartLoadingOverlay.style.display = "flex";
  try {
    const res = await fetch(`/api/analyze?symbol=${encodeURIComponent(symbol)}&range=${range}`);
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      elements.chartLoadingOverlay.style.display = "none";
      return;
    }
    state.stockData = data;
    updateUI(data);
  } catch (err) {
    console.error("Failed to analyze stock:", err);
    alert("Network error fetching analysis. Please verify your server connection.");
  } finally {
    elements.chartLoadingOverlay.style.display = "none";
  }
}

// Update UI with Senior Analyst Report & Technical Data
function updateUI(data) {
  // Stock Header
  elements.stockSymbolDisplay.innerHTML = `${data.symbol}<span>.NS</span>`;
  elements.stockCompanyDisplay.textContent = `${data.company_name} | Indian Equity Market`;
  elements.stockPriceDisplay.textContent = `₹${data.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  
  const isPos = data.day_change >= 0;
  const sign = isPos ? '+' : '';
  elements.stockChangeDisplay.className = `price-change ${isPos ? 'positive' : 'negative'}`;
  elements.stockChangeDisplay.textContent = `${sign}${data.day_change.toFixed(2)} (${sign}${data.day_pchange.toFixed(2)}%)`;

  elements.val52High.textContent = `₹${data.high_52w.toLocaleString('en-IN')}`;
  elements.val52Low.textContent = `₹${data.low_52w.toLocaleString('en-IN')}`;
  elements.val18mTrend.textContent = `${data.trends.trend_18m} (${data.trends.perf_18m > 0 ? '+' : ''}${data.trends.perf_18m}%)`;
  elements.val6mTrend.textContent = `${data.trends.trend_6m} (${data.trends.perf_6m > 0 ? '+' : ''}${data.trends.perf_6m}%)`;
  elements.valVolRatio.textContent = `${data.technicals.vol_ratio}x`;

  // Intraday Trade Blueprint
  const setup = data.intraday_setup;
  elements.biasBadge.textContent = setup.bias;
  elements.biasBadge.className = `bias-badge ${getBiasClass(setup.bias)}`;
  elements.bpAction.textContent = setup.action;
  elements.bpEntry.textContent = setup.entry_range;
  elements.bpTargets.textContent = `Target 1: ₹${setup.target1.toLocaleString('en-IN')} | Target 2: ₹${setup.target2.toLocaleString('en-IN')}`;
  elements.bpStopLoss.textContent = `₹${setup.stop_loss.toLocaleString('en-IN')}`;
  elements.bpRR.textContent = setup.rr_ratio;

  elements.blueprintReasons.innerHTML = `
    <ul>
      ${setup.reasons.map(r => `<li>${r}</li>`).join('')}
    </ul>
  `;

  // Standard Pivot Table
  const p = data.pivots.standard;
  elements.pivR3.textContent = `₹${p.r3.toFixed(2)}`;
  elements.pivR2.textContent = `₹${p.r2.toFixed(2)}`;
  elements.pivR1.textContent = `₹${p.r1.toFixed(2)}`;
  elements.pivP.textContent = `₹${p.pivot.toFixed(2)}`;
  elements.pivS1.textContent = `₹${p.s1.toFixed(2)}`;
  elements.pivS2.textContent = `₹${p.s2.toFixed(2)}`;
  elements.pivS3.textContent = `₹${p.s3.toFixed(2)}`;

  // News Feed
  renderNewsFeed(data.news);

  // Executive Research Report
  elements.reportContent.textContent = data.executive_summary;

  // Render Visuals: Gauge Meter & Candlestick Chart
  renderGaugeMeter(setup.bias);
  renderCandlestickChart(data.candles);
}

function getBiasClass(bias) {
  if (bias.includes("STRONG BUY")) return "strong-buy";
  if (bias.includes("BUY")) return "buy";
  if (bias.includes("STRONG SELL")) return "strong-sell";
  if (bias.includes("SELL")) return "sell";
  return "neutral";
}

// News Feed Rendering
function renderNewsFeed(newsItems) {
  if (!newsItems || newsItems.length === 0) {
    elements.newsFeed.innerHTML = `<div class="news-item">No recent headline catalysts found.</div>`;
    return;
  }
  elements.newsFeed.innerHTML = newsItems.map(item => {
    let sentClass = "neutral";
    if (item.sentiment.includes("Positive")) sentClass = "positive";
    if (item.sentiment.includes("Negative")) sentClass = "negative";

    return `
      <div class="news-card-item">
        <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
        <div class="news-meta">
          <span class="sentiment-badge ${sentClass}">${item.sentiment}</span>
          <span>${item.pubDate ? item.pubDate.split(' ').slice(0,4).join(' ') : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Technical Analyst Gauge Drawing (Speedometer Canvas)
function renderGaugeMeter(bias) {
  const canvas = elements.gaugeCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h - 15;
  const radius = 80;

  ctx.clearRect(0, 0, w, h);

  // Background Arc (5 segments: Strong Sell, Sell, Neutral, Buy, Strong Buy)
  const colors = ["#ff4d4d", "#ff7b7b", "#ffb800", "#5ce69d", "#00f090"];
  const angles = [
    { start: Math.PI, end: Math.PI * 1.2 },
    { start: Math.PI * 1.2, end: Math.PI * 1.4 },
    { start: Math.PI * 1.4, end: Math.PI * 1.6 },
    { start: Math.PI * 1.6, end: Math.PI * 1.8 },
    { start: Math.PI * 1.8, end: Math.PI * 2.0 }
  ];

  angles.forEach((seg, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, seg.start, seg.end);
    ctx.lineWidth = 14;
    ctx.strokeStyle = colors[i];
    ctx.stroke();
  });

  // Calculate Needle Angle based on Bias
  let targetAngle = Math.PI * 1.5; // Neutral default
  if (bias.includes("STRONG BUY")) targetAngle = Math.PI * 1.9;
  else if (bias.includes("BUY")) targetAngle = Math.PI * 1.7;
  else if (bias.includes("STRONG SELL")) targetAngle = Math.PI * 1.1;
  else if (bias.includes("SELL")) targetAngle = Math.PI * 1.3;

  // Draw Needle
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(targetAngle);

  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(radius - 12, 0);
  ctx.lineTo(0, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.restore();

  // Needle Pivot Cap
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();

  elements.gaugeLabel.textContent = bias;
}

// Canvas Candlestick & Moving Averages Chart Engine
function renderCandlestickChart(candles) {
  if (!candles || candles.length === 0) return;

  const canvas = elements.stockChartCanvas;
  const ctx = canvas.getContext("2d");
  
  // Set high resolution canvas dimensions
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const w = rect.width;
  const h = rect.height;
  const padding = { top: 20, right: 60, bottom: 40, left: 10 };

  const chartW = w - padding.left - padding.right;
  const mainChartH = (h - padding.top - padding.bottom) * 0.75;
  const volumeH = (h - padding.top - padding.bottom) * 0.20;
  const volumeY = padding.top + mainChartH + 10;

  ctx.clearRect(0, 0, w, h);

  // Price Min/Max Calculation
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const minPrice = Math.min(...lows) * 0.995;
  const maxPrice = Math.max(...highs) * 1.005;
  const priceRange = maxPrice - minPrice;

  // Volume Min/Max
  const maxVol = Math.max(...candles.map(c => c.volume)) || 1;

  const candleW = Math.max(chartW / candles.length - 2, 2);

  // Helper functions
  const getY = (price) => padding.top + mainChartH - ((price - minPrice) / priceRange) * mainChartH;
  const getX = (idx) => padding.left + idx * (chartW / candles.length) + candleW / 2;

  // Draw Horizontal Gridlines & Price Scale
  ctx.strokeStyle = "#1e2638";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#8b9bb4";
  ctx.font = "11px 'JetBrains Mono'";

  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const priceVal = minPrice + (priceRange / gridSteps) * i;
    const yPos = getY(priceVal);
    
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(padding.left + chartW, yPos);
    ctx.stroke();

    ctx.fillText(`₹${priceVal.toFixed(1)}`, padding.left + chartW + 6, yPos + 4);
  }

  // Draw Volume Bars
  if (state.toggles.volume) {
    candles.forEach((c, idx) => {
      const x = getX(idx);
      const vHeight = (c.volume / maxVol) * volumeH;
      const y = volumeY + volumeH - vHeight;
      const isBull = c.close >= c.open;

      ctx.fillStyle = isBull ? "rgba(0, 240, 144, 0.25)" : "rgba(255, 77, 77, 0.25)";
      ctx.fillRect(x - candleW / 2, y, candleW, vHeight);
    });
  }

  // Draw Candlesticks (Wick & Body)
  candles.forEach((c, idx) => {
    const x = getX(idx);
    const openY = getY(c.open);
    const closeY = getY(c.close);
    const highY = getY(c.high);
    const lowY = getY(c.low);
    const isBull = c.close >= c.open;

    const candleColor = isBull ? "#00f090" : "#ff4d4d";

    // Wick line
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    // Body rectangle
    const topY = Math.min(openY, closeY);
    const bodyH = Math.max(Math.abs(closeY - openY), 1);
    ctx.fillStyle = candleColor;
    ctx.fillRect(x - candleW / 2, topY, candleW, bodyH);
  });

  // Helper to draw EMA overlay lines
  const drawEMALine = (key, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    let started = false;
    candles.forEach((c, idx) => {
      if (c[key] !== null && c[key] !== undefined) {
        const x = getX(idx);
        const y = getY(c[key]);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.stroke();
  };

  if (state.toggles.ema20) drawEMALine("ema20", "#38bdf8"); // Cyan 20 EMA
  if (state.toggles.ema50) drawEMALine("ema50", "#ffb800"); // Yellow 50 EMA
  if (state.toggles.ema200) drawEMALine("ema200", "#a855f7"); // Purple 200 EMA
}

// Event Listeners Setup
function setupEventListeners() {
  // Stock Search Submission
  elements.searchBtn.addEventListener("click", () => {
    const query = elements.stockSearchInput.value.trim();
    if (query) {
      state.currentSymbol = query;
      analyzeStock(state.currentSymbol, state.currentRange);
      elements.searchSuggestions.style.display = "none";
    }
  });

  let searchDebounceTimer = null;
  elements.stockSearchInput.addEventListener("input", () => {
    const val = elements.stockSearchInput.value.trim();
    clearTimeout(searchDebounceTimer);

    if (val.length >= 1) {
      searchDebounceTimer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            elements.searchSuggestions.innerHTML = data.results.map(s => `
              <div class="suggestion-item" data-sym="${s.full_symbol || s.symbol}" data-name="${s.name}">
                <div>
                  <span class="s-sym">${s.symbol}</span>
                  <span class="s-name">${s.name}</span>
                </div>
                <div style="font-size:10px; font-weight:700; color: ${s.exch === 'NSE' ? '#00f090' : '#38bdf8'}; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">
                  ${s.exch || 'NSE'}
                </div>
              </div>
            `).join('');
            elements.searchSuggestions.style.display = "block";
          } else {
            elements.searchSuggestions.style.display = "none";
          }
        } catch (err) {
          console.error("Search fetch error:", err);
        }
      }, 150);
    } else {
      elements.searchSuggestions.style.display = "none";
    }
  });

  elements.stockSearchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      elements.searchBtn.click();
    }
  });

  // Auto-complete suggestion click
  elements.searchSuggestions.addEventListener("click", (e) => {
    const item = e.target.closest(".suggestion-item");
    if (item) {
      const sym = item.getAttribute("data-sym");
      const name = item.getAttribute("data-name");
      elements.stockSearchInput.value = item.querySelector('.s-sym').textContent;
      state.currentSymbol = sym;
      elements.searchSuggestions.style.display = "none";
      addToWatchlist(state.currentSymbol, name);
      analyzeStock(state.currentSymbol, state.currentRange);
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!elements.searchContainer?.contains(e.target)) {
      elements.searchSuggestions.style.display = "none";
    }
  });

  // Refresh Indices Button
  elements.refreshIndicesBtn.addEventListener("click", () => {
    fetchLiveIndicesData();
  });

  // Add to Watchlist Button
  elements.addWatchlistBtn.addEventListener("click", () => {
    addToWatchlist(state.currentSymbol);
  });

  // Timeframe Buttons
  elements.timeframeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.timeframeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentRange = btn.getAttribute("data-tf");
      analyzeStock(state.currentSymbol, state.currentRange);
    });
  });

  // Chart Indicator Toggles
  elements.toggleEMA20.addEventListener("change", (e) => {
    state.toggles.ema20 = e.target.checked;
    if (state.stockData) renderCandlestickChart(state.stockData.candles);
  });
  elements.toggleEMA50.addEventListener("change", (e) => {
    state.toggles.ema50 = e.target.checked;
    if (state.stockData) renderCandlestickChart(state.stockData.candles);
  });
  elements.toggleEMA200.addEventListener("change", (e) => {
    state.toggles.ema200 = e.target.checked;
    if (state.stockData) renderCandlestickChart(state.stockData.candles);
  });
  elements.toggleVolume.addEventListener("change", (e) => {
    state.toggles.volume = e.target.checked;
    if (state.stockData) renderCandlestickChart(state.stockData.candles);
  });

  // Report Copy Button
  elements.copyReportBtn.addEventListener("click", () => {
    const text = elements.reportContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert("Research Report copied to clipboard!");
    }).catch(err => {
      console.error("Clipboard copy error:", err);
    });
  });

  // Download Report Button
  elements.downloadReportBtn.addEventListener("click", () => {
    const text = elements.reportContent.textContent;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NSE_Senior_Analyst_${state.currentSymbol}_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
