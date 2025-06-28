#!/usr/bin/env python3
"""
Universal Documentation Processor for LLM use
Converts fetched documentation into LLM-ready formats with embeddings and search capabilities
"""

import json
import re
import hashlib
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

@dataclass
class DocumentChunk:
    """Represents a processed document chunk for LLM consumption"""
    id: str
    url: str
    title: str
    section: str
    content: str
    metadata: Dict
    timestamp: str
    hash: str
    tokens: int = 0

class UniversalDocProcessor:
    """Main processor for documentation"""
    
    def __init__(self, output_dir: str = "./data", chunk_size: int = 1000):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.chunk_size = chunk_size
        self.processed_docs = []
        
    def _process_document(self, url: str, content: str) -> List[DocumentChunk]:
        """Process a single document into manageable chunks"""
        
        # Extract title from URL or content
        title = self._extract_title(url, content)
        
        # Split content into sections
        sections = self._split_into_sections(content)
        
        chunks = []
        for section_title, section_content in sections:
            # Create smaller chunks if section is too long
            text_chunks = self._split_text(section_content, self.chunk_size)
            
            for i, chunk_text in enumerate(text_chunks):
                chunk_id = self._generate_chunk_id(url, section_title, i)
                
                chunk = DocumentChunk(
                    id=chunk_id,
                    url=url,
                    title=title,
                    section=section_title,
                    content=chunk_text.strip(),
                    metadata={
                        'doc_type': self._get_doc_type(url),
                        'chunk_index': i,
                        'total_chunks': len(text_chunks),
                        'source': 'docharvester'
                    },
                    timestamp=datetime.now().isoformat(),
                    hash=hashlib.md5(chunk_text.encode()).hexdigest(),
                    tokens=self._estimate_tokens(chunk_text)
                )
                
                chunks.append(chunk)
        
        return chunks
    
    def _extract_title(self, url: str, content: str) -> str:
        """Extract document title from URL or content"""
        # Try to extract from content first
        lines = content.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if line and len(line) < 100:
                return line
        
        # Fallback to URL
        from urllib.parse import urlparse
        path_parts = urlparse(url).path.strip('/').split('/')
        if path_parts and path_parts[-1]:
            return path_parts[-1].replace('-', ' ').replace('_', ' ').title()
        
        return "Documentation"
    
    def _split_into_sections(self, content: str) -> List[Tuple[str, str]]:
        """Split content into logical sections"""
        sections = []
        current_section = "Introduction"
        current_content = []
        
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect headers (basic heuristic)
            if (len(line) < 100 and 
                (line.isupper() or 
                 any(keyword in line.lower() for keyword in 
                     ['api', 'guide', 'overview', 'example', 'reference', 
                      'installation', 'setup', 'configuration', 'usage']))):
                
                # Save previous section
                if current_content:
                    sections.append((current_section, '\n'.join(current_content)))
                
                # Start new section
                current_section = line
                current_content = []
            else:
                current_content.append(line)
        
        # Add final section
        if current_content:
            sections.append((current_section, '\n'.join(current_content)))
        
        return sections if sections else [("Main Content", content)]
    
    def _split_text(self, text: str, chunk_size: int) -> List[str]:
        """Split text into chunks of approximately chunk_size characters"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        sentences = re.split(r'(?<=[.!?])\s+', text)
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            if current_length + len(sentence) > chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_length = len(sentence)
            else:
                current_chunk.append(sentence)
                current_length += len(sentence)
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def _generate_chunk_id(self, url: str, section: str, index: int) -> str:
        """Generate unique chunk ID"""
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        section_hash = hashlib.md5(section.encode()).hexdigest()[:4]
        return f"doc_{url_hash}_{section_hash}_{index:03d}"
    
    def _get_doc_type(self, url: str) -> str:
        """Determine document type from URL"""
        from urllib.parse import urlparse
        path = urlparse(url).path.lower()
        
        if '/api/' in path or 'api' in path:
            return 'api_reference'
        elif '/guide' in path or '/tutorial' in path:
            return 'guide'
        elif '/quickstart' in path or '/getting-started' in path:
            return 'quickstart'
        elif '/example' in path:
            return 'example'
        else:
            return 'documentation'
    
    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimation (4 chars ≈ 1 token)"""
        return len(text) // 4
    
    def export_for_llm(self, format_type: str = 'jsonl') -> str:
        """Export processed documents in LLM-friendly format"""
        
        if format_type == 'jsonl':
            output_file = self.output_dir / 'processed_docs.jsonl'
            with open(output_file, 'w', encoding='utf-8') as f:
                for chunk in self.processed_docs:
                    f.write(json.dumps(asdict(chunk)) + '\n')
        
        elif format_type == 'json':
            output_file = self.output_dir / 'processed_docs.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump([asdict(chunk) for chunk in self.processed_docs], f, indent=2)
        
        elif format_type == 'markdown':
            output_file = self.output_dir / 'processed_docs.md'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write("# Processed Documentation\n\n")
                
                for chunk in self.processed_docs:
                    f.write(f"## {chunk.title} - {chunk.section}\n\n")
                    f.write(f"**URL:** {chunk.url}\n\n")
                    f.write(f"**ID:** `{chunk.id}`\n\n")
                    f.write(f"{chunk.content}\n\n")
                    f.write("---\n\n")
        
        print(f"📄 Exported {len(self.processed_docs)} chunks to {output_file}")
        return str(output_file)
