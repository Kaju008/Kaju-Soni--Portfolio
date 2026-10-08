import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching for static assets
        if self.path.endswith(('.jpg', '.jpeg', '.png', '.css', '.js', '.webp', '.svg')):
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress verbose per-image logging in console
        if any(isinstance(arg, str) and arg.endswith('.jpg') for arg in args):
            return
        super().log_message(format, *args)

def run(port=8000):
    directory = os.path.dirname(os.path.abspath(__file__))
    os.chdir(directory)

    server_address = ('127.0.0.1', port)
    try:
        httpd = ThreadingHTTPServer(server_address, CustomHandler)
        print(f"Server started at http://localhost:{port}")
        sys.stdout.flush()
        httpd.serve_forever()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Port {port} in use, trying {port + 1}...")
            sys.stdout.flush()
            run(port + 1)
        else:
            raise

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run(port)
