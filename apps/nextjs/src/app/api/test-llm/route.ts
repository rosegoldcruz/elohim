// API endpoint to test LLM integration
import { NextRequest, NextResponse } from 'next/server';
import { runAllTests } from '~/lib/test-local-llm';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running LLM integration tests...');
    
    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      logs.push(message);
      originalLog(...args);
    };
    
    try {
      await runAllTests();
    } finally {
      console.log = originalLog;
    }
    
    return NextResponse.json({
      success: true,
      message: 'LLM integration tests completed',
      logs: logs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error running LLM tests:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt } = body;
    
    if (!model || !prompt) {
      return NextResponse.json({
        success: false,
        error: 'Missing model or prompt parameter'
      }, { status: 400 });
    }
    
    // Set the model mode for this request
    process.env.LLM_MODE = model;
    
    // Import and test the specific functionality
    const { ScriptWriterAgent } = await import('~/lib/agents/script-writer-agent');
    const agent = new ScriptWriterAgent();
    
    const testInput = {
      topic: prompt,
      tone: 'professional' as const,
      duration: 30,
      targetAudience: 'general',
      keywords: []
    };
    
    const result = await agent.execute(testInput);
    
    return NextResponse.json({
      success: true,
      model: model,
      result: {
        script: result.script,
        scenes: result.scenes.length,
        duration: result.metadata.estimatedDuration,
        wordCount: result.metadata.wordCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in LLM test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
