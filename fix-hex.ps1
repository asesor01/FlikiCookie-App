$map = [ordered]@{
 "#E91E8C"="art-accent"; "#D1177D"="art-accent-hover"; "#1A0F0A"="art-text";
 "#2D1F15"="art-muted"; "#E5A84B"="art-border"; "#FAF2EB"="art-panel"; "#FDF8F3"="art-bg";
 "#FAF7F2"="art-card"; "#FAF8F5"="art-card"; "#FAFBF9"="art-card";
 "#D9C5B2"="art-line"; "#E8D8C8"="art-line";
 "#EAE0D5"="art-linesoft"; "#F0E6DD"="art-linesoft"; "#F2EDE4"="art-linesoft"; "#F0F0F0"="art-linesoft";
 "#523A2A"="art-brown"; "#5D4E37"="art-brown"; "#4A3728"="art-brown"; "#6B5344"="art-brown"; "#705845"="art-brown";
 "#3D2B1F"="art-deep"; "#2C1810"="art-deep";
 "#8C7A6B"="art-soft"; "#8B7355"="art-soft";
 "#EAD8C3"="art-cream"; "#F5EDE3"="art-cream"; "#D1C3B7"="art-cream-soft"; "#C4B4A5"="art-cream-soft"; "#E6DBD0"="art-cream-text";
 "#4D3A2C"="art-dark"; "#5C4839"="art-dark-line"; "#543E2F"="art-dark-line"; "#4E3C30"="art-dark-line";
 "#FFB6C1"="art-rose"; "#C25E00"="art-caramel"; "#D97706"="art-caramel"; "#A67C52"="art-caramel";
 "#25D366"="wa"; "#20BA5C"="wa-dark"; "#128C7E"="wa-deep"; "#075E54"="wa-darkest"; "#ECE5DD"="wa-bg";
 "#3b5998"="social-fb"; "#e1306c"="social-ig"; "#C13584"="social-ig-deep"
}
# Backup de seguridad
New-Item -ItemType Directory -Force -Path backup_hex | Out-Null
Copy-Item src\App.tsx backup_hex\ -Force
Copy-Item src\components\*.tsx backup_hex\ -Force

$files = @("src\App.tsx") + (Get-ChildItem src\components -Filter *.tsx | ForEach-Object { $_.FullName })
foreach ($f in $files) {
  $c = Get-Content -Raw -Encoding UTF8 $f
  foreach ($k in $map.Keys) { $c = $c.Replace("[$k]", $map[$k]) }                      # Fase 1: clases Tailwind
  foreach ($k in $map.Keys) { $c = $c.Replace($k, "var(--color-" + $map[$k] + ")") }  # Fase 2: CSS/styles/SVG
  $c = $c -replace '#f0f0f0', 'var(--color-art-linesoft)'                             # minúsculas de los gráficos
  Set-Content -Path $f -Value $c -Encoding UTF8 -NoNewline
}
Write-Host "Listo. Verifica con rg."