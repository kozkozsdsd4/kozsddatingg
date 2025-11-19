# Dating Sim Core

AI-powered local dating simulator game (React Native + Gemini Nano).

This repository contains the initial data and project scaffolding for a local (on-device) otome/dating simulator:
- 50 characters (English names + Turkish equivalents)
- 150 traits organized in categories
- 30 language support skeleton
- AI modular interface (planned for Gemini Nano as default)

How to use
1. Create a GitHub repository (public).
2. Copy the files from this scaffold into your repo root (or use git commands below).
3. Initialize a React Native project and import `data/` into `src/data/`.

Quick local upload (example)
```
# in your local project folder (with the files below)
git init
git add .
git commit -m "Initial dating-sim scaffold"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/YOURREPO.git
git push -u origin main
```

Türkçe Özet
Bu repo, yerel çalışan bir dating-sim için başlangıç verilerini içerir:
- 50 karakter (İngilizce isimler ve Türkçe karşılık)
- 150 özellik (traits) kategorilere ayrılmış
- 30 dil desteği iskeleti
- AI modüler arayüzü (varsayılan: Gemini Nano)

## Raspberry Pi Desteği

Bu proje Raspberry Pi üzerinde çalıştırılabilir. Raspberry Pi 5'te SSD kullanımı ve sorun giderme için:
- 📖 [Raspberry Pi SSD Kurtarma Rehberi](RASPBERRY_PI_RECOVERY.md) - SSD tanınmama, dosya kurtarma ve SD kart yedekleme çözümleri