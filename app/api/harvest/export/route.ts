import { NextRequest, NextResponse } from "next/server";

interface ProcessingResult {
  url: string;
  status: 'success' | 'error';
  title?: string;
  content?: string;
  error?: string;
  size?: number;
}

interface ExportRequest {
  documents: ProcessingResult[];
  format: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('📤 DocHarvester Export: Starting export...');
    const body: ExportRequest = await req.json();
    const { documents, format } = body;

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents provided for export" },
        { status: 400 }
      );
    }

    console.log(`📋 Exporting ${documents.length} documents in ${format} format`);

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(documents, null, 2);
        contentType = 'application/json';
        filename = 'docharvester_export.json';
        break;

      case 'markdown':
        exportData = generateMarkdown(documents);
        contentType = 'text/markdown';
        filename = 'docharvester_export.md';
        break;

      case 'text':
        exportData = generateText(documents);
        contentType = 'text/plain';
        filename = 'docharvester_export.txt';
        break;

      case 'csv':
        exportData = generateCSV(documents);
        contentType = 'text/csv';
        filename = 'docharvester_export.csv';
        break;

      case 'training':
        exportData = generateTrainingData(documents);
        contentType = 'application/jsonl';
        filename = 'docharvester_export.jsonl';
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported export format: ${format}` },
          { status: 400 }
        );
    }

    console.log(`✅ Export complete: ${filename} (${exportData.length} characters)`);

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': exportData.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Export error:', error);
    return NextResponse.json(
      { 
        error: "Export failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

function generateMarkdown(documents: ProcessingResult[]): string {
  let markdown = '# DocHarvester Export\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n`;
  markdown += `Total Documents: ${documents.length}\n\n`;

  documents.forEach((doc, index) => {
    markdown += `## Document ${index + 1}: ${doc.title || 'Untitled'}\n\n`;
    markdown += `**URL:** ${doc.url}\n`;
    markdown += `**Status:** ${doc.status}\n`;
    
    if (doc.status === 'success') {
      markdown += `**Size:** ${doc.size || 0} characters\n\n`;
      markdown += `### Content\n\n`;
      markdown += `${doc.content || 'No content'}\n\n`;
    } else {
      markdown += `**Error:** ${doc.error || 'Unknown error'}\n\n`;
    }
    
    markdown += '---\n\n';
  });

  return markdown;
}

function generateText(documents: ProcessingResult[]): string {
  let text = 'DocHarvester Export\n';
  text += '===================\n\n';
  text += `Generated: ${new Date().toISOString()}\n`;
  text += `Total Documents: ${documents.length}\n\n`;

  documents.forEach((doc, index) => {
    text += `Document ${index + 1}: ${doc.title || 'Untitled'}\n`;
    text += `URL: ${doc.url}\n`;
    text += `Status: ${doc.status}\n`;
    
    if (doc.status === 'success') {
      text += `Size: ${doc.size || 0} characters\n\n`;
      text += `Content:\n${doc.content || 'No content'}\n\n`;
    } else {
      text += `Error: ${doc.error || 'Unknown error'}\n\n`;
    }
    
    text += '----------------------------------------\n\n';
  });

  return text;
}

function generateCSV(documents: ProcessingResult[]): string {
  let csv = 'URL,Title,Status,Size,Error,Content\n';
  
  documents.forEach(doc => {
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
    
    csv += [
      escapeCsv(doc.url),
      escapeCsv(doc.title || ''),
      escapeCsv(doc.status),
      doc.size || 0,
      escapeCsv(doc.error || ''),
      escapeCsv((doc.content || '').substring(0, 1000)) // Limit content for CSV
    ].join(',') + '\n';
  });

  return csv;
}

function generateTrainingData(documents: ProcessingResult[]): string {
  const trainingData = documents
    .filter(doc => doc.status === 'success' && doc.content)
    .map(doc => ({
      text: doc.content,
      metadata: {
        url: doc.url,
        title: doc.title,
        size: doc.size,
        timestamp: new Date().toISOString()
      }
    }));

  return trainingData.map(item => JSON.stringify(item)).join('\n');
}
