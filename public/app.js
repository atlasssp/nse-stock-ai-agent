/**
 * AI Stock Market Intraday Trading Assistant - Frontend Application
 */

const state = {
  currentSymbol: "RELIANCE",
  currentRange: "18m",
  stockData: null,
  companyData: null,
  predictiveData: null,
  scannerData: [],
  accuracyData: null,
  activeTab: "copilot",
  chatHistory: [],
  watchlist: JSON.parse(localStorage.getItem("nse_watchlist")) || [
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "ICICIBANK", name: "ICICI Bank" },
    { symbol: "INFY", name: "Infosys" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "STLTECH", name: "Sterlite Tech" }
  ],
  availableStocks: [],
  toggles: { ema20: true, ema50: true, ema200: true, volume: true }
};

const elements = {
  stockSearchInput: document.getElementById("stockSearchInput"),
  searchBtn: document.getElementById("searchBtn"),
  searchSuggestions: document.getElementById("searchSuggestions"),
  refreshIndicesBtn: document.getElementById("refreshIndicesBtn"),
  clockDisplay: document.getElementById("clockDisplay"),
  tickerTapeTrack: document.getElementById("tickerTapeTrack"),
  watchlistItems: document.getElementById("watchlistItems"),
  addWatchlistBtn: document.getElementById("addWatchlistBtn"),

  // Stock Header & Overview
  stockSymbolDisplay: document.getElementById("stockSymbolDisplay"),
  stockCompanyDisplay: document.getElementById("stockCompanyDisplay"),
  stockPriceDisplay: document.getElementById("stockPriceDisplay"),
  stockChangeDisplay: document.getElementById("stockChangeDisplay"),
  val52High: document.getElementById("val52High"),
  val52Low: document.getElementById("val52Low"),
  val18mTrend: document.getElementById("val18mTrend"),
  valWinProb: document.getElementById("valWinProb"),
  valVolRatio: document.getElementById("valVolRatio"),

  // Chart Canvas & Controls
  stockChartCanvas: document.getElementById("stockChartCanvas"),
  chartLoadingOverlay: document.getElementById("chartLoadingOverlay"),
  timeframeButtons: document.querySelectorAll(".tf-btn"),
  toggleEMA20: document.getElementById("toggleEMA20"),
  toggleEMA50: document.getElementById("toggleEMA50"),
  toggleEMA200: document.getElementById("toggleEMA200"),
  toggleVolume: document.getElementById("toggleVolume"),

  // Intraday Action Setup
  biasBadge: document.getElementById("biasBadge"),
  bpAction: document.getElementById("bpAction"),
  bpEntry: document.getElementById("bpEntry"),
  bpTargets: document.getElementById("bpTargets"),
  bpStopLoss: document.getElementById("bpStopLoss"),
  bpRR: document.getElementById("bpRR"),
  blueprintReasons: document.getElementById("blueprintReasons"),

  // Pivots & XAI & Orderbook & Events & News
  xaiFactorList: document.getElementById("xaiFactorList"),
  bidImbalanceBadge: document.getElementById("bidImbalanceBadge"),
  obBidsList: document.getElementById("obBidsList"),
  obAsksList: document.getElementById("obAsksList"),
  marketEventsFeed: document.getElementById("marketEventsFeed"),
  pivR3: document.getElementById("pivR3"),
  pivR2: document.getElementById("pivR2"),
  pivR1: document.getElementById("pivR1"),
  pivP: document.getElementById("pivP"),
  pivS1: document.getElementById("pivS1"),
  pivS2: document.getElementById("pivS2"),
  pivS3: document.getElementById("pivS3"),
  newsFeed: document.getElementById("newsFeed"),

  // Company Intelligence View Elements
  ciCompanyName: document.getElementById("ciCompanyName"),
  ciMarketCap: document.getElementById("ciMarketCap"),
  ciSectorIndustry: document.getElementById("ciSectorIndustry"),
  ciDescription: document.getElementById("ciDescription"),
  ciHeadquarters: document.getElementById("ciHeadquarters"),
  ciEmployees: document.getElementById("ciEmployees"),
  ciGeographic: document.getElementById("ciGeographic"),
  
  sumWhatCompany: document.getElementById("sumWhatCompany"),
  sumCurrentDevelopments: document.getElementById("sumCurrentDevelopments"),
  sumWhyTradersCare: document.getElementById("sumWhyTradersCare"),
  sumBullishSignal: document.getElementById("sumBullishSignal"),
  sumBearishSignal: document.getElementById("sumBearishSignal"),

  ciSegmentsList: document.getElementById("ciSegmentsList"),
  ciCoreProducts: document.getElementById("ciCoreProducts"),
  ciMoatBox: document.getElementById("ciMoatBox"),
  ciCustomers: document.getElementById("ciCustomers"),
  ciCompetitors: document.getElementById("ciCompetitors"),

  finTotalRev: document.getElementById("finTotalRev"),
  finRevGrowth: document.getElementById("finRevGrowth"),
  finPERatio: document.getElementById("finPERatio"),
  finPBRatio: document.getElementById("finPBRatio"),
  finROE: document.getElementById("finROE"),
  finDebtEquity: document.getElementById("finDebtEquity"),
  finFCF: document.getElementById("finFCF"),
  finDivYield: document.getElementById("finDivYield"),
  finAISummary: document.getElementById("finAISummary"),

  ciBullishCatalysts: document.getElementById("ciBullishCatalysts"),
  ciBearishRisks: document.getElementById("ciBearishRisks"),
  ciShortTermImpact: document.getElementById("ciShortTermImpact"),
  ciMediumTermOutlook: document.getElementById("ciMediumTermOutlook"),
  ciNewsTimeline: document.getElementById("ciNewsTimeline"),

  // Claude AI Analyst Chat Elements
  chatActiveStockPill: document.getElementById("chatActiveStockPill"),
  chatMessages: document.getElementById("chatMessages"),
  chatInput: document.getElementById("chatInput"),
  sendChatBtn: document.getElementById("sendChatBtn"),

  // Floating Chatbot Drawer Elements
  toggleFloatingChatBtn: document.getElementById("toggleFloatingChatBtn"),
  floatingChatDrawer: document.getElementById("floatingChatDrawer"),
  closeChatDrawerBtn: document.getElementById("closeChatDrawerBtn"),
  drawerActiveSym: document.getElementById("drawerActiveSym"),
  drawerMessages: document.getElementById("drawerMessages"),
  drawerChatInput: document.getElementById("drawerChatInput"),
  sendDrawerChatBtn: document.getElementById("sendDrawerChatBtn"),

  // Scanner View Elements
  scanSector: document.getElementById("scanSector"),
  scanCap: document.getElementById("scanCap"),
  scanRisk: document.getElementById("scanRisk"),
  scanStrategy: document.getElementById("scanStrategy"),
  runScannerBtn: document.getElementById("runScannerBtn"),
  scanCountBadge: document.getElementById("scanCountBadge"),
  scannerTableBody: document.getElementById("scannerTableBody"),

  // Predictive Analytics View Elements
  mcConfidenceBadge: document.getElementById("mcConfidenceBadge"),
  mcTargetProb: document.getElementById("mcTargetProb"),
  mcBreakoutProb: document.getElementById("mcBreakoutProb"),
  mcDownsideProb: document.getElementById("mcDownsideProb"),
  mcExpectedRange: document.getElementById("mcExpectedRange"),
  mcCanvas: document.getElementById("mcCanvas"),
  patternsContainer: document.getElementById("patternsContainer"),
  simCount: document.getElementById("simCount"),
  simWinRate: document.getElementById("simWinRate"),
  simAvgReturn: document.getElementById("simAvgReturn"),
  simTopMatch: document.getElementById("simTopMatch"),

  // Accuracy View Elements
  accWinRate: document.getElementById("accWinRate"),
  accTotalTrades: document.getElementById("accTotalTrades"),
  accProfitFactor: document.getElementById("accProfitFactor"),
  accAvgWin: document.getElementById("accAvgWin"),
  accuracyTableBody: document.getElementById("accuracyTableBody"),
  refreshAccuracyBtn: document.getElementById("refreshAccuracyBtn")
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  setupNavigationTabs();
  fetchAvailableStocks();
  fetchLiveIndicesData();
  renderWatchlist();
  analyzeStock(state.currentSymbol, state.currentRange);

  setupEventListeners();
});

// Clock
function initClock() {
  function update() {
    const now = new Date();
    elements.clockDisplay.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
  }
  update();
  setInterval(update, 1000);
}

// Navigation Tabs Setup
function setupNavigationTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetTab = tab.getAttribute("data-tab");
      state.activeTab = targetTab;

      document.querySelectorAll(".tab-view").forEach(view => view.classList.remove("active"));
      
      if (targetTab === "copilot") {
        document.getElementById("viewCopilot").classList.add("active");
      } else if (targetTab === "company") {
        document.getElementById("viewCompany").classList.add("active");
        if (state.stockData && state.stockData.company_intelligence) {
          renderCompanyIntelligence(state.stockData.company_intelligence);
        }
      } else if (targetTab === "chat") {
        document.getElementById("viewChat").classList.add("active");
        elements.chatActiveStockPill.textContent = `Context: ${state.currentSymbol}.NS`;
      } else if (targetTab === "scanner") {
        document.getElementById("viewScanner").classList.add("active");
        if (state.scannerData.length === 0) runScanner();
      } else if (targetTab === "predictive") {
        document.getElementById("viewPredictive").classList.add("active");
        renderPredictiveView();
      } else if (targetTab === "accuracy") {
        document.getElementById("viewAccuracy").classList.add("active");
        fetchAccuracyStats();
      }
    });
  });
}

// Fetch List of Top Indian Stocks
async function fetchAvailableStocks() {
  try {
    const res = await fetch("/api/stocks");
    const data = await res.json();
    if (data.stocks) state.availableStocks = data.stocks;
  } catch (err) {
    console.error("Failed to fetch stocks list:", err);
  }
}

// Fetch Live Market Indices
async function fetchLiveIndicesData() {
  try {
    const res = await fetch("/api/indices");
    const data = await res.json();
    if (data.indices) renderTickerTape(data.indices);
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
        <span class="ticker-price">₹${idx.price.toLocaleString('en-IN')}</span>
        <span class="ticker-change ${changeClass}">${sign}${idx.change} (${sign}${idx.pChange}%)</span>
      </div>
    `;
  }).join('');
}

// Watchlist Logic
function renderWatchlist() {
  elements.watchlistItems.innerHTML = state.watchlist.map(item => {
    const isActive = item.symbol === state.currentSymbol;
    return `
      <div class="watchlist-card ${isActive ? 'active' : ''}" onclick="selectStock('${item.symbol}')">
        <div>
          <div class="wl-sym">${item.symbol}</div>
          <div class="wl-name">${item.name}</div>
        </div>
        <span class="meta-value badge">NSE</span>
      </div>
    `;
  }).join('');
}

function selectStock(sym) {
  state.currentSymbol = sym;
  renderWatchlist();
  
  elements.chatActiveStockPill.textContent = `Context: ${sym}.NS`;
  elements.drawerActiveSym.textContent = sym;

  if (state.activeTab !== "company" && state.activeTab !== "chat") {
    const copilotTab = document.querySelector('.nav-tab[data-tab="copilot"]');
    if (copilotTab) copilotTab.click();
  }
  
  analyzeStock(sym, state.currentRange);
}

// Analyze Stock Core Action
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
    renderStockOverview(data);
    renderCandleChart(data.candles);
    renderTradeBlueprint(data.intraday_setup);
    renderPivotsTable(data.pivots);
    renderExplainableAI(data.explainable_ai);
    renderOrderBook(data.order_book);
    renderMarketEvents(data.order_book.events);
    renderNewsFeed(data.news);

    if (data.company_intelligence) {
      state.companyData = data.company_intelligence;
      renderCompanyIntelligence(data.company_intelligence);
    }

  } catch (err) {
    console.error("Failed to analyze stock:", err);
  } finally {
    elements.chartLoadingOverlay.style.display = "none";
  }
}

// Render Stock Header Info
function renderStockOverview(data) {
  elements.stockSymbolDisplay.innerHTML = `${data.symbol}<span>.NS</span>`;
  elements.stockCompanyDisplay.textContent = `${data.company_name} | Equity Ticker`;
  elements.stockPriceDisplay.textContent = `₹${data.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const isPos = data.day_change >= 0;
  const sign = isPos ? '+' : '';
  const changeClass = isPos ? 'positive' : 'negative';
  elements.stockChangeDisplay.className = `price-change ${changeClass}`;
  elements.stockChangeDisplay.textContent = `${sign}₹${data.day_change.toFixed(2)} (${sign}${data.day_pchange.toFixed(2)}%)`;

  elements.val52High.textContent = `₹${data.high_52w.toLocaleString('en-IN')}`;
  elements.val52Low.textContent = `₹${data.low_52w.toLocaleString('en-IN')}`;
  elements.val18mTrend.textContent = data.trends.trend_18m;
  elements.valWinProb.textContent = `${data.predictive.probabilities.target_hit}%`;
  elements.valVolRatio.textContent = `${data.technicals.vol_ratio}x`;
}

// Render Company Intelligence Dashboard
function renderCompanyIntelligence(ci) {
  if (!ci) return;

  elements.ciCompanyName.textContent = `${ci.company_name} (${ci.symbol})`;
  elements.ciMarketCap.textContent = ci.market_cap;
  elements.ciSectorIndustry.textContent = `${ci.sector} | ${ci.industry}`;
  elements.ciDescription.textContent = ci.description;
  elements.ciHeadquarters.textContent = ci.headquarters;
  elements.ciEmployees.textContent = ci.employees;
  elements.ciGeographic.textContent = ci.geographic_presence;

  const sum = ci.ai_investment_summary || {};
  elements.sumWhatCompany.textContent = sum.what_is_company || ci.description;
  elements.sumCurrentDevelopments.textContent = sum.current_developments || "Monitoring recent earnings reports and management announcements.";
  elements.sumWhyTradersCare.textContent = sum.why_pay_attention_today || "Technical breakout indicators aligned with volume surges.";
  elements.sumBullishSignal.textContent = sum.strongest_bullish_signal || "Positive catalyst momentum.";
  elements.sumBearishSignal.textContent = sum.strongest_bearish_signal || "Watchful of broad market headwinds.";

  const ops = ci.operations || {};
  elements.ciSegmentsList.innerHTML = (ops.segments || []).map(s => `
    <div class="seg-item">
      <div class="seg-header">
        <span>${s.name}</span>
        <span class="seg-share">${s.share} Revenue</span>
      </div>
      <div class="seg-desc">${s.description}</div>
    </div>
  `).join('');

  elements.ciCoreProducts.innerHTML = (ci.core_products || []).map(p => `
    <span class="tag-badge">${p}</span>
  `).join('');

  elements.ciMoatBox.textContent = ops.moat || "Strong brand reputation and market scale leadership.";
  elements.ciCustomers.textContent = ops.customers || "Enterprise corporations, retail consumers, and financial institutions.";

  elements.ciCompetitors.innerHTML = (ops.competitors || []).map(c => `
    <span class="tag-badge competitor">${c}</span>
  `).join('');

  const fin = ci.financials || {};
  elements.finTotalRev.textContent = fin.total_revenue || "N/A";
  elements.finRevGrowth.textContent = fin.revenue_growth || "+0%";
  elements.finPERatio.textContent = fin.pe_ratio || "N/A";
  elements.finPBRatio.textContent = fin.pb_ratio || "N/A";
  elements.finROE.textContent = fin.roe || "N/A";
  elements.finDebtEquity.textContent = fin.debt_to_equity || "N/A";
  elements.finFCF.textContent = fin.free_cash_flow || "N/A";
  elements.finDivYield.textContent = fin.dividend_yield || "N/A";
  elements.finAISummary.textContent = fin.ai_financial_summary || "Financial performance metrics indicate stable operating capital.";

  const imp = ci.impact_analysis || {};
  elements.ciBullishCatalysts.innerHTML = (imp.bullish_catalysts || []).map(c => `<li>${c}</li>`).join('');
  elements.ciBearishRisks.innerHTML = (imp.bearish_risks || []).map(r => `<li>${r}</li>`).join('');

  elements.ciShortTermImpact.textContent = imp.short_term_intraday_impact || "Short-term momentum aligned with technical support levels.";
  elements.ciMediumTermOutlook.textContent = imp.medium_term_outlook || "Medium-term structural trend supported by industry expansion.";

  const newsList = ci.recent_events || [];
  elements.ciNewsTimeline.innerHTML = newsList.map(n => `
    <div class="timeline-item">
      <div class="t-header">
        <span>${n.source} | ${n.pubDate}</span>
        <span class="outcome-tag ${n.sentiment === 'Bullish' ? 'win' : (n.sentiment === 'Bearish' ? 'loss' : 'pending')}">${n.sentiment}</span>
      </div>
      <div class="t-title">${n.title}</div>
      <div class="t-summary">${n.summary}</div>
    </div>
  `).join('');
}

// Chatbot Logic
async function sendChatMessage(msgText, isDrawer = false) {
  const text = msgText.trim();
  if (!text) return;

  const targetBox = isDrawer ? elements.drawerMessages : elements.chatMessages;
  const inputElem = isDrawer ? elements.drawerChatInput : elements.chatInput;

  // Clear input
  inputElem.value = "";

  // Append user message
  targetBox.innerHTML += `
    <div class="chat-msg user">
      <div class="msg-avatar">YOU</div>
      <div class="msg-content">${escapeHTML(text)}</div>
    </div>
  `;
  targetBox.scrollTop = targetBox.scrollHeight;

  // Append loading indicator
  const loadingId = "load_" + Date.now();
  targetBox.innerHTML += `
    <div class="chat-msg assistant" id="${loadingId}">
      <div class="msg-avatar">AI</div>
      <div class="msg-content"><div class="spinner"></div> Senior analyst is analyzing market data...</div>
    </div>
  `;
  targetBox.scrollTop = targetBox.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        symbol: state.currentSymbol,
        history: state.chatHistory
      })
    });
    const data = await res.json();

    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.remove();

    if (data.reply) {
      targetBox.innerHTML += `
        <div class="chat-msg assistant">
          <div class="msg-avatar">AI</div>
          <div class="msg-content">${formatMarkdown(data.reply)}</div>
        </div>
      `;
      state.chatHistory.push({ user: text, assistant: data.reply });
    } else if (data.error) {
      targetBox.innerHTML += `
        <div class="chat-msg assistant">
          <div class="msg-avatar">AI</div>
          <div class="msg-content red-text">Error: ${data.error}</div>
        </div>
      `;
    }
  } catch (err) {
    console.error("Chat error:", err);
  } finally {
    targetBox.scrollTop = targetBox.scrollHeight;
  }
}

function sendQuickPrompt(promptText) {
  // If not on chat tab, switch to chat tab
  const chatTab = document.querySelector('.nav-tab[data-tab="chat"]');
  if (chatTab) chatTab.click();
  sendChatMessage(promptText, false);
}

function formatMarkdown(text) {
  if (!text) return "";
  let formatted = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gim, '• $1<br>')
    .replace(/\n\n/g, '<br><br>');
  return formatted;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Render Canvas Candlestick Chart
function renderCandleChart(candles) {
  const canvas = elements.stockChartCanvas;
  const ctx = canvas.getContext('2d');

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  if (!candles || candles.length === 0) return;

  const padLeft = 50;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const maxP = Math.max(...highs) * 1.01;
  const minP = Math.min(...lows) * 0.99;

  const getY = (p) => padTop + chartH - ((p - minP) / (maxP - minP)) * chartH;
  const candleW = Math.max(2, (chartW / candles.length) - 2);

  ctx.strokeStyle = '#222d42';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#5c6b7e';
  ctx.font = '10px JetBrains Mono';

  for (let i = 0; i <= 4; i++) {
    const pVal = minP + (i / 4) * (maxP - minP);
    const yPos = getY(pVal);

    ctx.beginPath();
    ctx.moveTo(padLeft, yPos);
    ctx.lineTo(width - padRight, yPos);
    ctx.stroke();

    ctx.fillText(`₹${pVal.toFixed(1)}`, 5, yPos + 3);
  }

  if (state.toggles.ema20) drawEMALine(ctx, candles, 'ema20', '#3b82f6', getY, padLeft, chartW);
  if (state.toggles.ema50) drawEMALine(ctx, candles, 'ema50', '#f59e0b', getY, padLeft, chartW);
  if (state.toggles.ema200) drawEMALine(ctx, candles, 'ema200', '#ec4899', getY, padLeft, chartW);

  candles.forEach((c, idx) => {
    const x = padLeft + idx * (chartW / candles.length) + candleW / 2;
    const isBull = c.close >= c.open;

    const color = isBull ? '#10b981' : '#ef4444';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x, getY(c.high));
    ctx.lineTo(x, getY(c.low));
    ctx.stroke();

    const openY = getY(c.open);
    const closeY = getY(c.close);
    const bHeight = Math.max(1, Math.abs(closeY - openY));
    const bTop = Math.min(openY, closeY);

    ctx.fillRect(x - candleW / 2, bTop, candleW, bHeight);
  });
}

function drawEMALine(ctx, candles, key, color, getY, padLeft, chartW) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  let started = false;

  candles.forEach((c, idx) => {
    if (c[key] !== null && c[key] !== undefined) {
      const x = padLeft + idx * (chartW / candles.length) + 2;
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
}

// Render Intraday Trade Blueprint
function renderTradeBlueprint(setup) {
  elements.biasBadge.textContent = setup.bias;
  elements.biasBadge.className = `bias-badge ${getBiasClass(setup.bias)}`;

  elements.bpAction.textContent = setup.action;
  elements.bpEntry.textContent = setup.entry_range;
  elements.bpTargets.textContent = `₹${setup.target1} / ₹${setup.target2}`;
  elements.bpStopLoss.textContent = `₹${setup.stop_loss}`;
  elements.bpRR.textContent = setup.rr_ratio;

  elements.blueprintReasons.innerHTML = setup.reasons.map(r => `<div>• ${r}</div>`).join('');
}

function getBiasClass(bias) {
  const b = bias.toLowerCase();
  if (b.includes("strong buy")) return "strong-buy";
  if (b.includes("buy")) return "buy";
  if (b.includes("strong sell")) return "strong-sell";
  if (b.includes("sell")) return "sell";
  return "neutral";
}

// Render Explainable AI Factors
function renderExplainableAI(xai) {
  if (!xai || !xai.factors) return;
  elements.xaiFactorList.innerHTML = xai.factors.map(f => `
    <div class="xai-item">
      <div class="xai-title-row">
        <span>${f.category}</span>
        <span class="${f.impact === 'Positive' ? 'green-text' : (f.impact === 'Negative' ? 'red-text' : 'yellow-text')}">${f.weight}% Weight (${f.impact})</span>
      </div>
      <div class="xai-bar-track">
        <div class="xai-bar-fill" style="width: ${f.weight}%;"></div>
      </div>
      <div class="xai-desc">${f.explanation}</div>
    </div>
  `).join('');
}

// Render Order Book Depth
function renderOrderBook(ob) {
  if (!ob) return;
  elements.bidImbalanceBadge.textContent = `${ob.bid_imbalance_p}% Bids`;

  elements.obBidsList.innerHTML = ob.bids.map(b => `
    <div class="ob-row">
      <span>₹${b.price}</span>
      <span>${b.quantity}</span>
    </div>
  `).join('');

  elements.obAsksList.innerHTML = ob.asks.map(a => `
    <div class="ob-row">
      <span>₹${a.price}</span>
      <span>${a.quantity}</span>
    </div>
  `).join('');
}

// Render Market Events
function renderMarketEvents(events) {
  if (!events) return;
  elements.marketEventsFeed.innerHTML = events.map(e => `
    <div class="event-item pulse-alert">
      <span class="event-tag ${e.type.toLowerCase()}">${e.title}</span>
      <p>${e.description}</p>
    </div>
  `).join('');
}

// Render Technical Pivots
function renderPivotsTable(pivots) {
  if (!pivots || !pivots.standard) return;
  const p = pivots.standard;
  elements.pivR3.textContent = `₹${p.r3}`;
  elements.pivR2.textContent = `₹${p.r2}`;
  elements.pivR1.textContent = `₹${p.r1}`;
  elements.pivP.textContent = `₹${p.pivot}`;
  elements.pivS1.textContent = `₹${p.s1}`;
  elements.pivS2.textContent = `₹${p.s2}`;
  elements.pivS3.textContent = `₹${p.s3}`;
}

// Render News Feed
function renderNewsFeed(news) {
  if (!news) return;
  elements.newsFeed.innerHTML = news.map(n => `
    <div class="news-item">
      <a href="${n.link}" target="_blank" class="news-title">${n.title}</a>
      <div class="news-meta">
        <span>${n.pubDate}</span>
        <span class="${n.sentiment.includes('Positive') ? 'green-text' : (n.sentiment.includes('Negative') ? 'red-text' : 'yellow-text')}">${n.sentiment}</span>
      </div>
    </div>
  `).join('');
}

// Market Opportunity Scanner Logic
async function runScanner() {
  elements.scannerTableBody.innerHTML = `<tr><td colspan="11" class="loading-td">Running market opportunity scan...</td></tr>`;

  const sector = elements.scanSector.value;
  const cap = elements.scanCap.value;
  const risk = elements.scanRisk.value;
  const strategy = elements.scanStrategy.value;

  try {
    const url = `/api/scan?sector=${encodeURIComponent(sector)}&cap=${encodeURIComponent(cap)}&risk=${encodeURIComponent(risk)}&strategy=${encodeURIComponent(strategy)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.opportunities) {
      state.scannerData = data.opportunities;
      elements.scanCountBadge.textContent = `Found ${data.opportunities.length} Opportunities`;
      renderScannerTable(data.opportunities);
    }
  } catch (err) {
    console.error("Scanner failed:", err);
  }
}

function renderScannerTable(opportunities) {
  if (!opportunities || opportunities.length === 0) {
    elements.scannerTableBody.innerHTML = `<tr><td colspan="11" class="loading-td">No stocks matched the selected scanner criteria. Try broadening your filter settings.</td></tr>`;
    return;
  }

  elements.scannerTableBody.innerHTML = opportunities.map(opp => `
    <tr>
      <td>
        <div class="wl-sym">${opp.symbol}</div>
        <div class="wl-name">${opp.name}</div>
      </td>
      <td>${opp.sector}</td>
      <td>₹${opp.price}</td>
      <td class="yellow-text font-bold">${opp.ai_score}/100</td>
      <td><span class="bias-badge ${getBiasClass(opp.bias)}">${opp.bias}</span></td>
      <td>${opp.strategy}</td>
      <td>₹${opp.entry}</td>
      <td class="green-text">₹${opp.target}</td>
      <td class="red-text">₹${opp.stop_loss}</td>
      <td>${opp.rr_ratio}</td>
      <td><button class="sm-btn" onclick="selectStock('${opp.symbol}')">Analyze</button></td>
    </tr>
  `).join('');
}

// Render Predictive Analytics View (Monte Carlo Simulation Chart)
function renderPredictiveView() {
  if (!state.stockData || !state.stockData.predictive) return;

  const pred = state.stockData.predictive;
  const patterns = state.stockData.patterns;
  const sim = state.stockData.historical_similarity;

  elements.mcConfidenceBadge.textContent = `CONFIDENCE: ${pred.confidence_score}%`;
  elements.mcTargetProb.textContent = `${pred.probabilities.target_hit}%`;
  elements.mcBreakoutProb.textContent = `${pred.probabilities.bullish_breakout}%`;
  elements.mcDownsideProb.textContent = `${pred.probabilities.downside_risk}%`;
  elements.mcExpectedRange.textContent = `₹${pred.expected_range.bearish_floor} - ₹${pred.expected_range.bullish_target}`;

  renderMonteCarloCanvas(pred);

  elements.patternsContainer.innerHTML = patterns.map(p => `
    <div class="pattern-card-item">
      <div class="pattern-card-header">
        <span class="p-name">${p.name}</span>
        <span class="p-badge ${p.type === 'Bullish' ? 'green-bg green-text' : (p.type === 'Bearish' ? 'red-bg red-text' : 'yellow-bg yellow-text')}">${p.type} (${p.confidence}%)</span>
      </div>
      <div class="p-desc">${p.description}</div>
    </div>
  `).join('');

  if (sim) {
    elements.simCount.textContent = `${sim.similar_scenarios_found} Historical Windows`;
    elements.simWinRate.textContent = `${sim.historical_win_rate}%`;
    elements.simAvgReturn.textContent = `${sim.avg_historical_return >= 0 ? '+' : ''}${sim.avg_historical_return}%`;
    elements.simTopMatch.textContent = `${sim.top_match.similarity}% Similarity (${sim.top_match.subsequent_move})`;
  }
}

function renderMonteCarloCanvas(pred) {
  const canvas = elements.mcCanvas;
  const ctx = canvas.getContext('2d');

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const paths = pred.sample_paths;
  if (!paths || paths.length === 0) return;

  const padLeft = 50;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const allVals = paths.flat();
  const maxP = Math.max(...allVals) * 1.01;
  const minP = Math.min(...allVals) * 0.99;

  const getY = (p) => padTop + chartH - ((p - minP) / (maxP - minP)) * chartH;

  ctx.strokeStyle = '#222d42';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#5c6b7e';
  ctx.font = '10px JetBrains Mono';

  for (let i = 0; i <= 4; i++) {
    const pVal = minP + (i / 4) * (maxP - minP);
    const yPos = getY(pVal);

    ctx.beginPath();
    ctx.moveTo(padLeft, yPos);
    ctx.lineTo(width - padRight, yPos);
    ctx.stroke();

    ctx.fillText(`₹${pVal.toFixed(1)}`, 5, yPos + 3);
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  paths.forEach((path, pathIdx) => {
    ctx.strokeStyle = colors[pathIdx % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    path.forEach((price, dayIdx) => {
      const x = padLeft + dayIdx * (chartW / (path.length - 1));
      const y = getY(price);
      if (dayIdx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  });
}

// Fetch Accuracy Stats
async function fetchAccuracyStats() {
  elements.accuracyTableBody.innerHTML = `<tr><td colspan="11" class="loading-td">Loading accuracy stats history...</td></tr>`;
  try {
    const res = await fetch("/api/accuracy");
    const data = await res.json();
    
    if (data.history) {
      elements.accWinRate.textContent = `${data.win_rate_percent}%`;
      elements.accTotalTrades.textContent = `${data.total_recommendations} Setups`;
      elements.accProfitFactor.textContent = `${data.profit_factor}`;
      elements.accAvgWin.textContent = `+${data.avg_win_percent}%`;

      renderAccuracyTable(data.history);
    }
  } catch (err) {
    console.error("Failed to fetch accuracy stats:", err);
  }
}

function renderAccuracyTable(history) {
  elements.accuracyTableBody.innerHTML = history.map(item => `
    <tr>
      <td>#${item.id}</td>
      <td>${item.timestamp}</td>
      <td><strong>${item.symbol}</strong></td>
      <td><span class="bias-badge ${getBiasClass(item.bias)}">${item.bias}</span></td>
      <td>₹${item.entry}</td>
      <td class="green-text">₹${item.target}</td>
      <td class="red-text">₹${item.stop_loss}</td>
      <td>${item.confidence}%</td>
      <td><span class="outcome-tag ${item.outcome.toLowerCase()}">${item.outcome}</span></td>
      <td class="${item.pchange >= 0 ? 'green-text' : 'red-text'}">${item.pchange >= 0 ? '+' : ''}${item.pchange}%</td>
      <td>
        <button class="feedback-btn" onclick="sendFeedback(${item.id}, 'WIN', 2.1)">Win</button>
        <button class="feedback-btn" onclick="sendFeedback(${item.id}, 'LOSS', -0.8)">Loss</button>
      </td>
    </tr>
  `).join('');
}

async function sendFeedback(id, outcome, pchange) {
  try {
    const res = await fetch("/api/accuracy/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, outcome, pchange })
    });
    const data = await res.json();
    if (data.success) fetchAccuracyStats();
  } catch (err) {
    console.error("Failed to record feedback:", err);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  elements.stockSearchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      elements.searchSuggestions.style.display = "none";
      return;
    }
    const matches = state.availableStocks.filter(s => 
      s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    );
    if (matches.length > 0) {
      elements.searchSuggestions.innerHTML = matches.map(s => `
        <div class="suggestion-item" onclick="selectStock('${s.symbol.replace('.NS', '')}')">
          <div><strong>${s.symbol}</strong> - ${s.name}</div>
          <span class="wl-name">${s.sector}</span>
        </div>
      `).join('');
      elements.searchSuggestions.style.display = "block";
    } else {
      elements.searchSuggestions.style.display = "none";
    }
  });

  elements.searchBtn.addEventListener("click", () => {
    const q = elements.stockSearchInput.value.trim();
    if (q) selectStock(q);
  });

  elements.refreshIndicesBtn.addEventListener("click", fetchLiveIndicesData);

  elements.timeframeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.timeframeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentRange = btn.getAttribute("data-tf");
      analyzeStock(state.currentSymbol, state.currentRange);
    });
  });

  elements.toggleEMA20.addEventListener("change", (e) => { state.toggles.ema20 = e.target.checked; renderCandleChart(state.stockData.candles); });
  elements.toggleEMA50.addEventListener("change", (e) => { state.toggles.ema50 = e.target.checked; renderCandleChart(state.stockData.candles); });
  elements.toggleEMA200.addEventListener("change", (e) => { state.toggles.ema200 = e.target.checked; renderCandleChart(state.stockData.candles); });
  elements.toggleVolume.addEventListener("change", (e) => { state.toggles.volume = e.target.checked; renderCandleChart(state.stockData.candles); });

  // Chat Handlers
  elements.sendChatBtn.addEventListener("click", () => sendChatMessage(elements.chatInput.value, false));
  elements.chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChatMessage(elements.chatInput.value, false);
  });

  elements.sendDrawerChatBtn.addEventListener("click", () => sendChatMessage(elements.drawerChatInput.value, true));
  elements.drawerChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChatMessage(elements.drawerChatInput.value, true);
  });

  elements.toggleFloatingChatBtn.addEventListener("click", () => {
    elements.floatingChatDrawer.classList.toggle("active");
  });

  elements.closeChatDrawerBtn.addEventListener("click", () => {
    elements.floatingChatDrawer.classList.remove("active");
  });

  elements.runScannerBtn.addEventListener("click", runScanner);

  elements.refreshAccuracyBtn.addEventListener("click", fetchAccuracyStats);
}
