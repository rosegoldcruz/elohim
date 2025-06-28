import fs from 'fs'
import { put } from '@vercel/blob'
import { createClient } from '@supabase/supabase-js'

async function runLLMRunner() {
  try {
    console.log("🧠 Starting LLM Runner...")
    
    // Simulate LLM output
    const result = "LLM runner output: " + new Date().toISOString()
    const fileName = "llm_output.txt"
    
    // Write output to file
    fs.writeFileSync(fileName, result)
    console.log("📝 Generated output:", result)
    
    // Upload to Vercel Blob
    const upload = await put(fileName, fs.readFileSync(fileName), {
      access: 'public',
      contentType: 'text/plain'
    })
    console.log("📤 Uploaded to Blob:", upload.url)
    
    // Save metadata to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
    )
    
    const { data, error } = await supabase.from('llm_outputs').insert({
      timestamp: new Date().toISOString(),
      blob_url: upload.url,
      content: result
    })
    
    if (error) {
      console.error("❌ Supabase error:", error)
    } else {
      console.log("📊 Logged to Supabase successfully")
    }
    
    // Clean up local file
    fs.unlinkSync(fileName)
    console.log("🧹 Cleaned up local file")
    
    console.log("✅ LLM Runner completed successfully")
    
  } catch (error) {
    console.error("💥 LLM Runner failed:", error)
    process.exit(1)
  }
}

// Run the LLM runner
runLLMRunner()
