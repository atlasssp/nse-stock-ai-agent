import os
import sys
import json
import time
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from analyst_engine import (
    fetch_live_indices,
    generate_senior_researcher_report,
    fetch_stock_news,
    fetch_company_intelligence,
    generate_claude_finance_response,
    assemble_live_context,
    classify_intent,
    FOLLOW_UP_CHIPS,
    search_indian_stocks,
    run_market_opportunity_scanner,
    get_accuracy_stats,
    record_outcome_feedback,
    simulate_order_book_depth,
    NSE_TOP_STOCKS
)

PORT = 8000
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True


class StockMarketHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def log_message(self, format, *args):
        # Only log API calls, suppress static file noise
        if '/api/' in args[0] if args else True:
            super().log_message(format, *args)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        def send_json(data_dict, status_code=200):
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(data_dict, ensure_ascii=False).encode('utf-8'))

        # ── Live Market Indices ────────────────────────────────────────────────
        if path == "/api/indices":
            try:
                indices = fetch_live_indices()
                send_json({"indices": indices})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── Top Stocks List ───────────────────────────────────────────────────
        elif path == "/api/stocks":
            send_json({"stocks": NSE_TOP_STOCKS})
            return

        # ── Stock Search ──────────────────────────────────────────────────────
        elif path == "/api/search":
            q = query_params.get("q", [""])[0]
            try:
                results = search_indian_stocks(q)
                send_json({"results": results})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── Full Stock Analysis ───────────────────────────────────────────────
        elif path == "/api/analyze":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            tf_range = query_params.get("range", ["18m"])[0]
            try:
                report = generate_senior_researcher_report(symbol, tf_range)
                send_json(report)
            except Exception as e:
                send_json({"error": f"Failed to generate analysis: {str(e)}"}, 500)
            return

        # ── Quick Price (fast hot-cache read for live pill refresh) ───────────
        elif path == "/api/quickprice":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                ctx = assemble_live_context(symbol)
                if ctx:
                    send_json({
                        "symbol": ctx.get("symbol"),
                        "price": ctx.get("price"),
                        "change_pct": ctx.get("change_pct"),
                        "rsi": ctx.get("rsi"),
                        "vol_ratio": ctx.get("vol_ratio"),
                        "bias": ctx.get("bias"),
                        "mc_prob": ctx.get("mc_target_prob"),
                    })
                else:
                    send_json({"error": "Data not available"}, 404)
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── Company Intelligence ──────────────────────────────────────────────
        elif path == "/api/company":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                company_data = fetch_company_intelligence(symbol)
                send_json(company_data)
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── News Feed ─────────────────────────────────────────────────────────
        elif path == "/api/news":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                articles = fetch_stock_news(symbol)
                send_json({"symbol": symbol, "news": articles})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── Chat Streaming via SSE ────────────────────────────────────────────
        elif path == "/api/chat/stream":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            message = query_params.get("message", [""])[0]

            try:
                self.send_response(200)
                self.send_header('Content-Type', 'text/event-stream')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Connection', 'keep-alive')
                self.end_headers()

                def sse_send(data: dict):
                    line = f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
                    self.wfile.write(line.encode('utf-8'))
                    self.wfile.flush()

                # Step 1 — immediate status feedback
                sse_send({"type": "status", "text": "⚡ Fetching live market data..."})
                time.sleep(0.05)

                # Step 2 — generate full response
                sse_send({"type": "status", "text": "🔍 Arjun is analyzing the technicals..."})
                response = generate_claude_finance_response(message, symbol, history=None)

                sse_send({"type": "status", "text": "📝 Composing expert analysis..."})
                time.sleep(0.05)

                # Step 3 — stream words with typewriter effect
                reply_text = response.get("reply", "")
                words = reply_text.split(" ")
                for word in words:
                    sse_send({"type": "token", "text": word + " "})
                    time.sleep(0.018)

                # Step 4 — send completion payload
                sse_send({
                    "type": "complete",
                    "intent": response.get("intent", "general"),
                    "chips": response.get("chips", FOLLOW_UP_CHIPS["general"]),
                    "trade_card": response.get("trade_card"),
                    "live_context": response.get("live_context", {}),
                    "timestamp": response.get("timestamp", ""),
                })

            except BrokenPipeError:
                pass
            except Exception as e:
                try:
                    sse_send({"type": "error", "text": str(e)})
                except Exception:
                    pass
            return

        # ── Opportunity Scanner ───────────────────────────────────────────────
        elif path == "/api/scan":
            sector = query_params.get("sector", ["all"])[0]
            cap = query_params.get("cap", ["all"])[0]
            risk = query_params.get("risk", ["all"])[0]
            strategy = query_params.get("strategy", ["all"])[0]
            try:
                opportunities = run_market_opportunity_scanner(sector=sector, cap=cap, risk=risk, strategy=strategy)
                send_json({"count": len(opportunities), "opportunities": opportunities})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── Accuracy Tracker ──────────────────────────────────────────────────
        elif path == "/api/accuracy":
            try:
                stats = get_accuracy_stats()
                send_json(stats)
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        elif path == "/api/predict":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                report = generate_senior_researcher_report(symbol, "18m")
                send_json({"symbol": symbol, "predictive": report.get("predictive", {})})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        elif path == "/api/explain":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                report = generate_senior_researcher_report(symbol, "18m")
                send_json({"symbol": symbol, "explainable_ai": report.get("explainable_ai", {})})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        elif path == "/api/patterns":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                report = generate_senior_researcher_report(symbol, "18m")
                send_json({
                    "symbol": symbol,
                    "patterns": report.get("patterns", []),
                    "historical_similarity": report.get("historical_similarity", {})
                })
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        elif path == "/api/orderbook":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                report = generate_senior_researcher_report(symbol, "18m")
                send_json({"symbol": symbol, "order_book": report.get("order_book", {})})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        def send_json(data_dict, status_code=200):
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(data_dict, ensure_ascii=False).encode('utf-8'))

        # ── POST: Non-streaming JSON chat (fallback for older browsers) ────────
        if path == "/api/chat":
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))

                user_msg = str(payload.get("message", ""))
                symbol = str(payload.get("symbol", "RELIANCE"))
                history = payload.get("history", [])

                chat_response = generate_claude_finance_response(user_msg, symbol, history)
                send_json(chat_response)
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # ── POST: Accuracy Feedback Loop ──────────────────────────────────────
        elif path == "/api/accuracy/feedback":
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))
                rec_id = int(payload.get('id', 0))
                outcome = str(payload.get('outcome', 'WIN'))
                pchange = float(payload.get('pchange', 0.0))
                success = record_outcome_feedback(rec_id, outcome, pchange)
                send_json({"success": success, "updated_stats": get_accuracy_stats()})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        send_json({"error": "Endpoint not found"}, 404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def run_server():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    server_address = ('', PORT)
    httpd = ThreadedHTTPServer(server_address, StockMarketHandler)
    print(f"🚀 AI Intraday Trading Assistant — http://localhost:{PORT}")
    print(f"🤖 SSE Streaming Chat → GET /api/chat/stream")
    print(f"⚡ Quick Price Refresh → GET /api/quickprice")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
