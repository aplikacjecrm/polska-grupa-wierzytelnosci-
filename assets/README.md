# Ikony aplikacji

Umieść tutaj ikony aplikacji:

- `icon.png` - Ikona PNG (512x512 lub większa)
- `icon.ico` - Ikona dla Windows
- `icon.icns` - Ikona dla macOS

## Generowanie ikon

### Z pliku PNG do ICO (Windows):
Użyj narzędzia online: https://convertio.co/png-ico/

### Z pliku PNG do ICNS (macOS):
```bash
# Zainstaluj imagemagick
brew install imagemagick

# Konwertuj
convert icon.png -resize 512x512 icon.icns
```

### Zalecane rozmiary:
- PNG: 512x512 px lub 1024x1024 px
- ICO: 256x256 px
- ICNS: 512x512 px

## Tymczasowa ikona

Możesz użyć symbolu § jako tymczasowej ikony lub stworzyć własną z logo Pro Meritum.
