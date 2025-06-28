from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from urllib.parse import urljoin, urlparse
import json
import time
import os
import logging
from processor import UniversalDocProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class UniversalDocFetcher:
    def __init__(self):
        self.setup_selenium()
    
    def setup_selenium(self):
        """Setup headless Chrome for JavaScript-heavy sites"""
        self.chrome_options = Options()
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--disable-extensions")
        self.chrome_options.add_argument("--disable-plugins")
        self.chrome_options.add_argument("--disable-images")
        self.chrome_options.add_argument("--window-size=1920,1080")
        
        # Use system Chrome if available
        chrome_path = os.environ.get('CHROME_BIN', '/usr/bin/chromium')
        if os.path.exists(chrome_path):
            self.chrome_options.binary_location = chrome_path
    
    def discover_urls(self, base_url, max_depth=2):
        """Automatically discover documentation URLs from a base URL"""
        discovered = set()
        to_visit = [(base_url, 0)]
        visited = set()
        
        logger.info(f"Starting URL discovery from {base_url} with max depth {max_depth}")
        
        while to_visit and len(discovered) < 500:  # Limit to prevent infinite loops
            url, depth = to_visit.pop(0)
            
            if url in visited or depth > max_depth:
                continue
                
            visited.add(url)
            logger.info(f"Visiting {url} at depth {depth}")
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                response = requests.get(url, timeout=15, headers=headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find all links that look like documentation
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(url, href)
                    
                    # Filter for documentation-like URLs
                    if self.is_doc_url(full_url, base_url) and full_url not in discovered:
                        discovered.add(full_url)
                        logger.info(f"Discovered: {full_url}")
                        
                        if depth < max_depth:
                            to_visit.append((full_url, depth + 1))
            
            except Exception as e:
                logger.warning(f"Error processing {url}: {e}")
                continue
        
        logger.info(f"Discovery complete. Found {len(discovered)} URLs")
        return list(discovered)
    
    def is_doc_url(self, url, base_url):
        """Check if URL looks like documentation"""
        try:
            parsed_base = urlparse(base_url)
            parsed_url = urlparse(url)
            
            # Must be same domain or subdomain
            if not (parsed_url.netloc == parsed_base.netloc or 
                   parsed_url.netloc.endswith('.' + parsed_base.netloc)):
                return False
            
            path = parsed_url.path.lower()
            
            # Skip non-documentation patterns
            skip_patterns = [
                'javascript:', 'mailto:', '#', '?', '.pdf', '.zip', '.tar',
                '/login', '/logout', '/register', '/admin', '/user',
                '/blog', '/news', '/press', '/about', '/contact',
                '.jpg', '.png', '.gif', '.svg', '.css', '.js'
            ]
            
            if any(pattern in url.lower() for pattern in skip_patterns):
                return False
            
            # Documentation indicators
            doc_indicators = [
                'docs', 'documentation', 'api', 'guide', 'tutorial',
                'reference', 'manual', 'help', 'getting-started',
                'quickstart', 'examples', 'how-to', 'developer',
                'sdk', 'library', 'framework'
            ]
            
            return any(indicator in path for indicator in doc_indicators)
            
        except Exception:
            return False
    
    def fetch_with_js(self, url):
        """Fetch content from JavaScript-heavy pages"""
        try:
            service = Service()
            driver = webdriver.Chrome(service=service, options=self.chrome_options)
            driver.set_page_load_timeout(30)
            
            driver.get(url)
            time.sleep(3)  # Wait for JS to load
            content = driver.page_source
            
            return content
        except Exception as e:
            logger.error(f"Error fetching {url} with JS: {e}")
            raise
        finally:
            try:
                driver.quit()
            except:
                pass

fetcher = UniversalDocFetcher()

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'docharvester'})

@app.route('/discover', methods=['POST'])
def discover_urls():
    """Discover documentation URLs from a base URL"""
    try:
        data = request.json
        base_url = data.get('base_url')
        max_depth = data.get('max_depth', 2)
        
        if not base_url:
            return jsonify({'error': 'base_url is required'}), 400
        
        urls = fetcher.discover_urls(base_url, max_depth)
        
        return jsonify({
            'urls': urls,
            'count': len(urls),
            'base_url': base_url
        })
        
    except Exception as e:
        logger.error(f"Discovery error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/fetch', methods=['POST'])
def fetch_content():
    """Fetch content from a single URL"""
    try:
        data = request.json
        url = data.get('url')
        use_js = data.get('use_js', False)
        
        if not url:
            return jsonify({'error': 'url is required'}), 400
        
        logger.info(f"Fetching {url} (JS: {use_js})")
        
        if use_js:
            content = fetcher.fetch_with_js(url)
        else:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, timeout=30, headers=headers)
            response.raise_for_status()
            content = response.text
        
        # Clean content
        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            element.decompose()
        
        # Extract title
        title = 'Untitled'
        if soup.title:
            title = soup.title.string.strip()
        elif soup.h1:
            title = soup.h1.get_text().strip()
        
        clean_content = soup.get_text(separator='\n', strip=True)
        
        return jsonify({
            'url': url,
            'content': clean_content,
            'title': title,
            'size': len(clean_content)
        })
    
    except Exception as e:
        logger.error(f"Fetch error for {url}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/process', methods=['POST'])
def process_documents():
    """Process fetched documents for LLM use"""
    try:
        data = request.json
        documents = data.get('documents', [])
        
        if not documents:
            return jsonify({'error': 'documents are required'}), 400
        
        processor = UniversalDocProcessor(output_dir="./data")
        
        # Process each document
        all_chunks = []
        for doc in documents:
            if doc.get('status') == 'success' and doc.get('content'):
                chunks = processor._process_document(doc['url'], doc['content'])
                all_chunks.extend(chunks)
        
        processor.processed_docs = all_chunks
        
        # Export in multiple formats
        files_created = []
        for format_type in ['jsonl', 'json', 'markdown']:
            file_path = processor.export_for_llm(format_type)
            files_created.append(file_path)
        
        return jsonify({
            'chunks_created': len(all_chunks),
            'files_created': files_created,
            'output_dir': './data'
        })
    
    except Exception as e:
        logger.error(f"Processing error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/data/<path:filename>')
def download_file(filename):
    """Download processed files"""
    return send_from_directory('./data', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
