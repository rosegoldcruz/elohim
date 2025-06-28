import { NextRequest, NextResponse } from 'next/server';

interface ProcessingResult {
  url: string;
  status: 'success' | 'error';
  title?: string;
  content?: string;
  error?: string;
  size?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents, format } = body;
    
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'documents array is required' },
        { status: 400 }
      );
    }

    if (!format) {
      return NextResponse.json(
        { error: 'format is required' },
        { status: 400 }
      );
    }

    const results = documents as ProcessingResult[];
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(results, null, 2);
        filename = 'docharvester_export.json';
        mimeType = 'application/json';
        break;
        
      case 'markdown':
        content = generateMarkdown(results);
        filename = 'docharvester_export.md';
        mimeType = 'text/markdown';
        break;
        
      case 'text':
        content = generateText(results);
        filename = 'docharvester_export.txt';
        mimeType = 'text/plain';
        break;
        
      case 'csv':
        content = generateCSV(results);
        filename = 'docharvester_export.csv';
        mimeType = 'text/csv';
        break;
        
      case 'training':
        content = generateTrainingData(results);
        filename = 'docharvester_training.jsonl';
        mimeType = 'application/jsonl';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported: json, markdown, text, csv, training' },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('DocHarvester export error:', error);
    return NextResponse.json(
      { error: 'Failed to export documents' },
      { status: 500 }
    );
  }
}

function generateMarkdown(results: ProcessingResult[]): string {
  let md = '# DocHarvester Export\n\n';
  md += `Generated on: ${new Date().toISOString()}\n\n`;
  md += `Total documents: ${results.length}\n\n`;
  
  results.forEach((result, index) => {
    md += `## ${index + 1}. ${result.title || 'Document'}\n\n`;
    md += `**URL:** ${result.url}\n\n`;
    md += `**Status:** ${result.status}\n\n`;
    
    if (result.status === 'success' && result.content) {
      md += `${result.content}\n\n`;
    } else if (result.error) {
      md += `**Error:** ${result.error}\n\n`;
    }
    
    md += '---\n\n';
  });
  
  return md;
}

function generateText(results: ProcessingResult[]): string {
  let text = 'DOCHARVESTER EXPORT\n';
  text += '='.repeat(50) + '\n\n';
  text += `Generated: ${new Date().toISOString()}\n`;
  text += `Documents: ${results.length}\n\n`;
  
  results.forEach((result, index) => {
    text += `${index + 1}. ${result.title || 'Document'}\n`;
    text += `URL: ${result.url}\n`;
    text += `Status: ${result.status}\n`;
    
    if (result.status === 'success' && result.content) {
      text += `Content:\n${result.content}\n`;
    } else if (result.error) {
      text += `Error: ${result.error}\n`;
    }
    
    text += '\n' + '='.repeat(50) + '\n\n';
  });
  
  return text;
}

function generateCSV(results: ProcessingResult[]): string {
  const headers = ['URL', 'Title', 'Status', 'Size', 'Error'];
  let csv = headers.join(',') + '\n';
  
  results.forEach(result => {
    const row = [
      `"${result.url}"`,
      `"${result.title || ''}"`,
      result.status,
      result.size || 0,
      `"${result.error || ''}"`
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

function generateTrainingData(results: ProcessingResult[]): string {
  let jsonl = '';
  
  results.forEach(result => {
    if (result.status === 'success' && result.content) {
      const trainingItem = {
        text: `# ${result.title}\n\n${result.content}`,
        metadata: {
          url: result.url,
          title: result.title,
          size: result.size
        }
      };
      jsonl += JSON.stringify(trainingItem) + '\n';
    }
  });
  
  return jsonl;
}
