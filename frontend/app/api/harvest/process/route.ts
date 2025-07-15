import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface ProcessingResult {
  url: string;
  status: 'success' | 'error';
  title?: string;
  content?: string;
  error?: string;
  size?: number;
}

interface ProcessRequest {
  documents: ProcessingResult[];
}

interface LLMChunk {
  id: string;
  url: string;
  title: string;
  content: string;
  chunk_index: number;
  total_chunks: number;
  word_count: number;
  char_count: number;
  metadata: {
    source_url: string;
    source_title: string;
    chunk_size: number;
    overlap: number;
    timestamp: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log('⚙️ DocHarvester Process: Starting LLM processing...');
    const body: ProcessRequest = await req.json();
    const { documents } = body;

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents provided for processing" },
        { status: 400 }
      );
    }

    console.log(`📋 Processing ${documents.length} documents for LLM use`);

    // Filter successful documents
    const successfulDocs = documents.filter(doc => doc.status === 'success' && doc.content);
    
    if (successfulDocs.length === 0) {
      return NextResponse.json(
        { error: "No successful documents with content to process" },
        { status: 400 }
      );
    }

    console.log(`✅ Found ${successfulDocs.length} documents with content`);

    // Process documents into LLM-ready chunks
    const chunks: LLMChunk[] = [];
    let totalChunks = 0;

    for (const doc of successfulDocs) {
      const docChunks = createChunks(doc);
      chunks.push(...docChunks);
      totalChunks += docChunks.length;
      console.log(`📄 Processed ${doc.title}: ${docChunks.length} chunks`);
    }

    // Save processed chunks to file
    const timestamp = Date.now();
    const outputDir = path.resolve(process.cwd(), 'output', 'processed');
    await mkdir(outputDir, { recursive: true });
    
    const fileName = `llm_chunks_${timestamp}.json`;
    const filePath = path.join(outputDir, fileName);
    
    const processedData = {
      metadata: {
        timestamp: new Date().toISOString(),
        total_documents: successfulDocs.length,
        total_chunks: totalChunks,
        chunk_size: 1000, // words
        overlap: 100, // words
        processing_version: '1.0.0'
      },
      chunks
    };

    await writeFile(filePath, JSON.stringify(processedData, null, 2));
    
    console.log(`✅ LLM processing complete! Created ${totalChunks} chunks in ${fileName}`);
    
    return NextResponse.json({
      message: "LLM processing complete",
      file: filePath,
      chunks_created: totalChunks,
      documents_processed: successfulDocs.length,
      chunk_size: 1000,
      overlap: 100
    });

  } catch (error) {
    console.error('❌ Processing error:', error);
    return NextResponse.json(
      { 
        error: "Processing failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

function createChunks(doc: ProcessingResult): LLMChunk[] {
  if (!doc.content) return [];

  const chunkSize = 1000; // words
  const overlap = 100; // words
  
  // Split content into words
  const words = doc.content.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= chunkSize) {
    // Document is small enough to be a single chunk
    return [{
      id: `${generateId()}_0`,
      url: doc.url,
      title: doc.title || 'Untitled',
      content: doc.content,
      chunk_index: 0,
      total_chunks: 1,
      word_count: words.length,
      char_count: doc.content.length,
      metadata: {
        source_url: doc.url,
        source_title: doc.title || 'Untitled',
        chunk_size: chunkSize,
        overlap: overlap,
        timestamp: new Date().toISOString()
      }
    }];
  }

  // Create overlapping chunks
  const chunks: LLMChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    const chunkContent = chunkWords.join(' ');

    chunks.push({
      id: `${generateId()}_${chunkIndex}`,
      url: doc.url,
      title: doc.title || 'Untitled',
      content: chunkContent,
      chunk_index: chunkIndex,
      total_chunks: 0, // Will be updated after all chunks are created
      word_count: chunkWords.length,
      char_count: chunkContent.length,
      metadata: {
        source_url: doc.url,
        source_title: doc.title || 'Untitled',
        chunk_size: chunkSize,
        overlap: overlap,
        timestamp: new Date().toISOString()
      }
    });

    // Move start index forward, accounting for overlap
    if (endIndex >= words.length) {
      break; // We've reached the end
    }
    
    startIndex = endIndex - overlap;
    chunkIndex++;
  }

  // Update total_chunks for all chunks
  chunks.forEach(chunk => {
    chunk.total_chunks = chunks.length;
  });

  return chunks;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
