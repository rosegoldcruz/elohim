$inputDir  = "C:\Users\Administrator\Documents\.Vercel.com"
$outputDir = "C:\Users\Administrator\Documents\.Vercel.com_Docs"

$categoryMap = @{
    "auth-docs.md"        = @("auth", "login", "supabase", "token", "oauth", "access")
    "storage-docs.md"     = @("blob", "kv", "storage", "postgres", "planetscale", "upstash", "redis")
    "edge-docs.md"        = @("edge", "middleware", "headers", "region", "ip-blocking", "firewall")
    "deploy-docs.md"      = @("vercel", "cli", "config", "domains", "deploy", "environment", "env", "region", "hosting")
    "framework-docs.md"   = @("next", "nuxt", "remix", "astro", "svelte", "boilerplate", "turborepo", "react")
    "ai-docs.md"          = @("ai", "gpt", "langchain", "pinecone", "openai", "chatbot", "morphic")
    "infra-docs.md"       = @("observability", "infrastructure", "logs", "preview", "monitor", "analytics", "rendering")
    "misc-docs.md"        = @()
}

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$categoryContent = @{}
foreach ($key in $categoryMap.Keys) {
    $categoryContent[$key] = @()
}

$mdFiles = Get-ChildItem -Path $inputDir -Filter *.md -File

foreach ($file in $mdFiles) {
    $added = $false
    $lowerName = $file.Name.ToLower()

    foreach ($category in $categoryMap.Keys) {
        foreach ($keyword in $categoryMap[$category]) {
            if ($lowerName -like "*$keyword*") {
                $content = Get-Content $file.FullName
                $categoryContent[$category] += "# $($file.BaseName)`n`n" + ($content -join "`n") + "`n`n---`n`n"
                $added = $true
                break
            }
        }
        if ($added) { break }
    }

    if (-not $added) {
        $content = Get-Content $file.FullName
        $categoryContent["misc-docs.md"] += "# $($file.BaseName)`n`n" + ($content -join "`n") + "`n`n---`n`n"
    }
}

foreach ($category in $categoryContent.Keys) {
    $outputPath = Join-Path $outputDir $category
    Set-Content -Path $outputPath -Value $categoryContent[$category] -Encoding UTF8
    Write-Host "Created: $outputPath"
}

Write-Host ""
Write-Host "DONE - Master docs saved to:"
Write-Host $outputDir