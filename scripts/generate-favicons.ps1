Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path (Join-Path $PSScriptRoot "..\public\logo.png")
$publicDir = Resolve-Path (Join-Path $PSScriptRoot "..\public")

Write-Host "Chargement de $srcPath..."
$srcImage = [System.Drawing.Image]::FromFile($srcPath)

function Save-Resized-Png($src, $w, $h, $dest) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $w, $h)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "  -> Généré : $dest ($w x $h)"
}

# 1. Génération des PNG de différentes tailles
Save-Resized-Png $srcImage 16 16 (Join-Path $publicDir "favicon-16x16.png")
Save-Resized-Png $srcImage 32 32 (Join-Path $publicDir "favicon-32x32.png")
Save-Resized-Png $srcImage 64 64 (Join-Path $publicDir "favicon.png")
Save-Resized-Png $srcImage 180 180 (Join-Path $publicDir "apple-touch-icon.png")
Save-Resized-Png $srcImage 192 192 (Join-Path $publicDir "icon-192.png")
Save-Resized-Png $srcImage 512 512 (Join-Path $publicDir "icon-512.png")

# 2. Génération de favicon.ico (32x32 avec canal alpha)
$bmp32 = New-Object System.Drawing.Bitmap 32, 32
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g32.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g32.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g32.Clear([System.Drawing.Color]::Transparent)
$g32.DrawImage($srcImage, 0, 0, 32, 32)
$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoPath = Join-Path $publicDir "favicon.ico"
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Dispose()
$icon.Dispose()
$g32.Dispose()
$bmp32.Dispose()
Write-Host "  -> Généré : $icoPath (Windows ICO)"

$srcImage.Dispose()
Write-Host "Favicons et icônes générés avec succès !"
