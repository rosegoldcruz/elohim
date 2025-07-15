import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

interface APIKeyStatus {
  name: string;
  configured: boolean;
  valid?: boolean;
  error?: string;
}

export async function GET() {
  try {
    console.log('🔑 Validating API keys...');
    
    const keyStatuses: APIKeyStatus[] = [];

    // Check OpenAI API Key
    const openaiStatus: APIKeyStatus = {
      name: 'OpenAI',
      configured: !!env.OPENAI_API_KEY
    };

    if (openaiStatus.configured) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
        });
        openaiStatus.valid = response.ok;
        if (!response.ok) {
          openaiStatus.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        openaiStatus.valid = false;
        openaiStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    keyStatuses.push(openaiStatus);

    // Check Replicate API Key
    const replicateStatus: APIKeyStatus = {
      name: 'Replicate',
      configured: !!env.REPLICATE_API_TOKEN
    };

    if (replicateStatus.configured) {
      try {
        const response = await fetch('https://api.replicate.com/v1/account', {
          headers: {
            'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
          },
        });
        replicateStatus.valid = response.ok;
        if (!response.ok) {
          replicateStatus.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        replicateStatus.valid = false;
        replicateStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    keyStatuses.push(replicateStatus);

    // Check Supabase Configuration
    const supabaseStatus: APIKeyStatus = {
      name: 'Supabase',
      configured: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    };

    if (supabaseStatus.configured) {
      try {
        const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });
        supabaseStatus.valid = response.ok;
        if (!response.ok) {
          supabaseStatus.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        supabaseStatus.valid = false;
        supabaseStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    keyStatuses.push(supabaseStatus);

    // Check ElevenLabs (optional)
    if (env.ELEVENLABS_API_KEY) {
      const elevenLabsStatus: APIKeyStatus = {
        name: 'ElevenLabs',
        configured: true
      };

      try {
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': env.ELEVENLABS_API_KEY,
          },
        });
        elevenLabsStatus.valid = response.ok;
        if (!response.ok) {
          elevenLabsStatus.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        elevenLabsStatus.valid = false;
        elevenLabsStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      keyStatuses.push(elevenLabsStatus);
    }

    // Calculate overall status
    const configuredKeys = keyStatuses.filter(k => k.configured);
    const validKeys = keyStatuses.filter(k => k.configured && k.valid);
    const requiredKeys = ['OpenAI', 'Replicate', 'Supabase'];
    const requiredConfigured = keyStatuses.filter(k => requiredKeys.includes(k.name) && k.configured);
    const requiredValid = keyStatuses.filter(k => requiredKeys.includes(k.name) && k.configured && k.valid);

    const allRequiredConfigured = requiredConfigured.length === requiredKeys.length;
    const allRequiredValid = requiredValid.length === requiredKeys.length;

    console.log(`✅ API Key Validation Complete:`);
    console.log(`   - Configured: ${configuredKeys.length}/${keyStatuses.length}`);
    console.log(`   - Valid: ${validKeys.length}/${configuredKeys.length}`);
    console.log(`   - Required Valid: ${requiredValid.length}/${requiredKeys.length}`);

    return NextResponse.json({
      success: true,
      overall_status: allRequiredValid ? 'ready' : allRequiredConfigured ? 'configured_but_invalid' : 'missing_keys',
      pipeline_ready: allRequiredValid,
      summary: {
        total_keys: keyStatuses.length,
        configured_keys: configuredKeys.length,
        valid_keys: validKeys.length,
        required_keys: requiredKeys.length,
        required_configured: requiredConfigured.length,
        required_valid: requiredValid.length
      },
      keys: keyStatuses,
      recommendations: generateRecommendations(keyStatuses, requiredKeys)
    });

  } catch (error) {
    console.error('❌ API key validation failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "API key validation failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

function generateRecommendations(keyStatuses: APIKeyStatus[], requiredKeys: string[]): string[] {
  const recommendations: string[] = [];

  // Check for missing required keys
  const missingRequired = requiredKeys.filter(
    required => !keyStatuses.find(k => k.name === required && k.configured)
  );

  if (missingRequired.length > 0) {
    recommendations.push(`Configure missing required API keys: ${missingRequired.join(', ')}`);
  }

  // Check for invalid keys
  const invalidKeys = keyStatuses.filter(k => k.configured && k.valid === false);
  if (invalidKeys.length > 0) {
    recommendations.push(`Fix invalid API keys: ${invalidKeys.map(k => `${k.name} (${k.error})`).join(', ')}`);
  }

  // Check for optional keys
  const hasElevenLabs = keyStatuses.find(k => k.name === 'ElevenLabs');
  if (!hasElevenLabs) {
    recommendations.push('Consider adding ElevenLabs API key for voice generation');
  }

  if (recommendations.length === 0) {
    recommendations.push('All API keys are properly configured! Pipeline is ready.');
  }

  return recommendations;
}
