# PowerShell script to add 'use client' to files that import framer-motion

$files = @(
    "app\audio\page.tsx",
    "app\billing\page.tsx", 
    "app\docs\page.tsx",
    "app\image\page.tsx",
    "app\marketing\page.tsx",
    "app\projects\page.tsx",
    "app\script\page.tsx",
    "app\settings\page.tsx",
    "app\signup\page.tsx",
    "app\studio\page.tsx",
    "components\Features.tsx",
    "components\Footer.tsx",
    "components\Hero.tsx",
    "components\Navbar.tsx",
    "components\Pricing.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -notmatch "^'use client'") {
            Write-Host "Adding 'use client' to $file"
            $newContent = "'use client'`n`n" + $content
            Set-Content $file $newContent -NoNewline
        } else {
            Write-Host "$file already has 'use client'"
        }
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Done!"
