Add-Type -AssemblyName System.Drawing

function New-QuintalzimIcon {
    param(
        [string]$Path,
        [int]$Size,
        [double]$LetterScale = 0.56,
        [bool]$RoundedCorners = $true
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::Transparent)

    $verde = [System.Drawing.ColorTranslator]::FromHtml("#3F6B34")
    $brush = New-Object System.Drawing.SolidBrush $verde

    if ($RoundedCorners) {
        $radius = [int]($Size * 0.22)
        $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $gp.AddArc(0, 0, $d, $d, 180, 90)
        $gp.AddArc($Size - $d, 0, $d, $d, 270, 90)
        $gp.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90)
        $gp.AddArc(0, $Size - $d, $d, $d, 90, 90)
        $gp.CloseFigure()
        $g.FillPath($brush, $gp)
    } else {
        $g.FillRectangle($brush, 0, 0, $Size, $Size)
    }

    $fontSize = [float]($Size * $LetterScale)
    $font = New-Object System.Drawing.Font("Segoe UI Black", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#FBF7EC"))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF(0, [float]($Size * -0.03), $Size, $Size)
    $g.DrawString("Q", $font, $textBrush, $rect, $format)

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot

New-QuintalzimIcon -Path "$root/public/icons/icon-192.png" -Size 192 -LetterScale 0.56 -RoundedCorners $true
New-QuintalzimIcon -Path "$root/public/icons/icon-512.png" -Size 512 -LetterScale 0.56 -RoundedCorners $true
New-QuintalzimIcon -Path "$root/public/icons/icon-maskable-512.png" -Size 512 -LetterScale 0.4 -RoundedCorners $false
New-QuintalzimIcon -Path "$root/app/icon.png" -Size 512 -LetterScale 0.56 -RoundedCorners $true
New-QuintalzimIcon -Path "$root/app/apple-icon.png" -Size 180 -LetterScale 0.56 -RoundedCorners $false

Write-Host "Icones gerados."
