# NSE Intraday AI Senior Market Researcher & Stock Analyst Web Terminal

An institutional-grade AI Senior Market Researcher and Web Terminal built specifically for Intraday Trading in the Indian Stock Market (NSE / BSE).

![NSE Stock Researcher Terminal](public/index.html)

## 🚀 Key Features

- **Senior Analyst AI Engine**:
  - Multi-timeframe trend evaluation across **6 Months**, **12 Months**, and **18 Months**.
  - Technical Indicator Suite: **20 EMA**, **50 EMA**, **200 EMA**, **RSI (14)**, **MACD**, **Volume Surges (>1.5x/2.0x avg)**, **14-day ATR**, and **Standard & Fibonacci Pivot Points** (R1, R2, R3, P, S1, S2, S3).
  - Actionable Intraday Trade Setup: **Execution Bias** (`STRONG BUY`, `BUY ON DIPS`, `NEUTRAL`, `SELL ON RALLIES`, `STRONG SELL`), **Entry Range**, **Targets (T1 & T2)**, **Strict Stop-Loss**, and **Risk-to-Reward Ratio**.
- **Real-Time News & Catalyst Scanner**:
  - Google News & RSS integration for Indian equities to analyze quarterly results, management changes, and block deals driving stock spikes or drops.
- **NSE Live Market Indices & Watchlist**:
  - Live Ticker Tape for **NIFTY 50**, **NIFTY BANK**, **NIFTY IT**, and **NIFTY FINANCIAL**.
  - Interactive Daily Watchlist Manager.
- **Bloomberg / TradingView Styled Dark UI**:
  - Canvas Candlestick Chart Engine with moving average overlays.
  - Speedometer Technical Signal Gauge Meter.
  - Exportable Markdown research reports for daily trading journals.

---

## 💻 Local Setup & Running

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the web server
python3 server.py
```
Open **`http://localhost:8000`** in your browser.

---

## ⚡ How to Import to GitHub & Bolt.new

### Step 1: Push Project to GitHub

If you have GitHub CLI (`gh`) installed:
```bash
gh repo create nse-stock-ai-researcher --public --source=. --remote=origin --push
```

Or push manually to an existing GitHub repository:
```bash
git add .
git commit -m "Initial commit of NSE Intraday AI Stock Researcher"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/nse-stock-ai-researcher.git
git push -u origin main
```

### Step 2: Import into Bolt.new

1. Open **[https://bolt.new](https://bolt.new)** in your web browser.
2. In the prompt bar or URL bar, enter your GitHub repository URL:
   `https://bolt.new/~/github.com/YOUR_GITHUB_USERNAME/nse-stock-ai-researcher`
3. Bolt.new will automatically import your repository, install dependencies, and launch your project!

---

## 🌐 Deploy to Cloud (Render / Railway / Vercel)

- **Render**: Connect your GitHub repository, choose **Web Service**, set Build Command to `pip install -r requirements.txt`, and Start Command to `python3 server.py`.
- **Railway**: Click **New Project** -> **Deploy from GitHub repo**.

---

## 📜 License
MIT License. Built for Indian Equity & Futures Traders.
