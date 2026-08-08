import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from analyst_engine import (
    fetch_live_indices,
    generate_senior_researcher_report,
    fetch_stock_news,
    search_indian_stocks,
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

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # Enable CORS headers
        def send_json(data_dict, status_code=200):
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(data_dict).encode('utf-8'))

        if path == "/api/indices":
            try:
                indices = fetch_live_indices()
                send_json({"indices": indices})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        elif path == "/api/stocks":
            send_json({"stocks": NSE_TOP_STOCKS})
            return

        elif path == "/api/search":
            q = query_params.get("q", [""])[0]
            try:
                results = search_indian_stocks(q)
                send_json({"results": results})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        elif path == "/api/analyze":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            tf_range = query_params.get("range", ["18m"])[0]
            try:
                report = generate_senior_researcher_report(symbol, tf_range)
                send_json(report)
            except Exception as e:
                send_json({"error": f"Failed to generate analysis: {str(e)}"}, 500)
            return

        elif path == "/api/news":
            symbol = query_params.get("symbol", ["RELIANCE"])[0]
            try:
                articles = fetch_stock_news(symbol)
                send_json({"symbol": symbol, "news": articles})
            except Exception as e:
                send_json({"error": str(e)}, 500)
            return

        # Serve static files for standard web assets
        return super().do_GET()

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
    print(f"🚀 NSE Intraday Senior Market Researcher Server running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
