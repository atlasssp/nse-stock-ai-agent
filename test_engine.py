import os
import sys
import unittest
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from analyst_engine import (
    calculate_technical_indicators,
    detect_technical_patterns,
    run_monte_carlo_prediction,
    generate_explainable_ai_breakdown,
    simulate_order_book_depth,
    run_market_opportunity_scanner,
    fetch_company_intelligence,
    generate_claude_finance_response,
    get_accuracy_stats,
    generate_senior_researcher_report,
    NSE_TOP_STOCKS
)
import pandas as pd
import numpy as np

class TestStockMarketEngine(unittest.TestCase):

    def setUp(self):
        dates = pd.date_range(end=pd.Timestamp.now(), periods=50, freq='D')
        np.random.seed(42)
        close_prices = 3000 + np.cumsum(np.random.randn(50) * 15)
        high_prices = close_prices + np.random.rand(50) * 20
        low_prices = close_prices - np.random.rand(50) * 20
        open_prices = close_prices + np.random.randn(50) * 5
        volume = np.random.randint(50000, 200000, 50)

        self.df = pd.DataFrame({
            'Open': open_prices,
            'High': high_prices,
            'Low': low_prices,
            'Close': close_prices,
            'Volume': volume
        }, index=dates)

    def test_technical_indicators(self):
        df_calc = calculate_technical_indicators(self.df.copy())
        self.assertIn('EMA_20', df_calc.columns)
        self.assertIn('EMA_50', df_calc.columns)
        self.assertIn('RSI', df_calc.columns)

    def test_pattern_detection(self):
        df_calc = calculate_technical_indicators(self.df.copy())
        patterns = detect_technical_patterns(df_calc)
        self.assertIsInstance(patterns, list)

    def test_monte_carlo_prediction(self):
        df_calc = calculate_technical_indicators(self.df.copy())
        current_price = float(df_calc['Close'].iloc[-1])
        atr = float(df_calc['ATR'].iloc[-1])
        mc = run_monte_carlo_prediction(df_calc, current_price, atr, n_simulations=100, days=5)
        self.assertIn('expected_range', mc)

    def test_explainable_ai(self):
        xai = generate_explainable_ai_breakdown(
            reasons=["EMA bullish"], news_score=1.5, rsi=62.0, macd=5.0, vol_ratio=1.4, trend_18m="Bullish Uptrend", patterns=[]
        )
        self.assertIn('factors', xai)

    def test_order_book_depth(self):
        ob = simulate_order_book_depth(3000.0, 1.5, "STRONG BUY")
        self.assertEqual(len(ob['bids']), 5)

    def test_company_intelligence(self):
        ci = fetch_company_intelligence("RELIANCE")
        self.assertIn('company_name', ci)
        self.assertIn('operations', ci)

    def test_claude_finance_chatbot(self):
        res = generate_claude_finance_response("What is your trade recommendation for RELIANCE today?", "RELIANCE")
        self.assertIn('reply', res)
        self.assertIn('RELIANCE', res['reply'])
        self.assertIn('Intraday Bias', res['reply'])

    def test_market_opportunity_scanner(self):
        opportunities = run_market_opportunity_scanner(sector="all", cap="all", risk="all", strategy="all")
        self.assertIsInstance(opportunities, list)

    def test_accuracy_stats(self):
        stats = get_accuracy_stats()
        self.assertIn('win_rate_percent', stats)

if __name__ == '__main__':
    unittest.main()
