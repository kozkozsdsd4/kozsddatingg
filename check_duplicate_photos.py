import os
import hashlib
from pathlib import Path
from collections import defaultdict
from PIL import Image
import json

def get_file_hash(filepath):
    """Dosyanın MD5 hash'ini hesapla"""
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def get_image_dimensions(filepath):
    """Resim boyutlarını al"""
    try:
        with Image.open(filepath) as img:
            return img.size
    except Exception as e:
        print(f"⚠️ Resim boyutu okunamadı ({filepath}): {e}")
        return None

def create_html_report(character_info, hash_dict):
    """HTML raporu oluştur"""
    
    # Tekrar eden fotoğrafları bul
    duplicate_hashes = {h for h, chars in hash_dict.items() if len(chars) > 1}
    
    # Karakter kartlarını oluştur
    cards = []
    for info in character_info:
        is_duplicate = info['hash'] in duplicate_hashes
        duplicate_class = " duplicate" if is_duplicate else ""
        duplicate_badge = '<span class="duplicate-badge">⚠️ TEKRAR</span>' if is_duplicate else ""
        
        dimensions_str = f"{info['dimensions'][0]}x{info['dimensions'][1]}" if info['dimensions'] else "?"
        
        # Windows path'i web path'e çevir
        photo_path = info['photo_path'].replace('\\', '/')
        
        card = f"""
            <div class="character-card{duplicate_class}">
                <img src="{photo_path}" alt="{info['english_name']}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22250%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E'">
                <div class="character-info">
                    <div class="character-name">{info['english_name']}</div>
                    <div class="character-turkish">{info['turkish_name']}</div>
                    <div class="character-details">
                        {dimensions_str} • {info['size_kb']:.1f} KB
                    </div>
                    {duplicate_badge}
                </div>
            </div>"""
        cards.append(card)
    
    total_characters = len(character_info)
    duplicate_count = len(duplicate_hashes)
    character_cards_html = "\n".join(cards)
    
    # HTML şablonu
    html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Karakter Fotoğrafları Raporu</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
            text-align: center;
        }}
        .stats {{
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }}
        .gallery {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        .character-card {{
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            background: white;
            transition: transform 0.2s;
        }}
        .character-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }}
        .character-card.duplicate {{
            border: 3px solid #ff5252;
            background: #ffebee;
        }}
        .character-card img {{
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 5px;
        }}
        .character-info {{
            margin-top: 10px;
        }}
        .character-name {{
            font-weight: bold;
            font-size: 16px;
            color: #333;
        }}
        .character-turkish {{
            color: #666;
            font-size: 14px;
        }}
        .character-details {{
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }}
        .duplicate-badge {{
            background: #ff5252;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            display: inline-block;
            margin-top: 5px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎭 Karakter Fotoğrafları Raporu</h1>
        
        <div class="stats">
            <h2>📊 İstatistikler</h2>
            <p>Toplam Karakter: <strong>{total_characters}</strong></p>
            <p>Tekrar Eden Fotoğraflar: <strong>{duplicate_count}</strong></p>
        </div>
        
        <h2>🖼️ Tüm Karakterler</h2>
        <div class="gallery">
{character_cards_html}
        </div>
    </div>
</body>
</html>"""
    
    # Dosyaya yaz
    with open("character_photos_report.html", "w", encoding="utf-8") as f:
        f.write(html)

def check_duplicate_photos(characters_dir="data/characters"):
    """Tekrar eden fotoğrafları kontrol et"""
    
    # Hash bazlı tekrar kontrolü
    hash_dict = defaultdict(list)
    character_info = []
    
    print("🔍 Karakterler taranıyor...\n")
    
    # Tüm karakter klasörlerini tara
    for character_folder in sorted(os.listdir(characters_dir)):
        character_path = os.path.join(characters_dir, character_folder)
        
        if not os.path.isdir(character_path):
            continue
        
        # Fotoğraf dosyasını bul
        photo_path = None
        for photo_name in ["photo.jpg", "photo.png", "model.jpg", "model.png"]:
            potential_path = os.path.join(character_path, photo_name)
            if os.path.exists(potential_path):
                photo_path = potential_path
                break
        
        if not photo_path:
            print(f"⚠️  {character_folder}: Fotoğraf bulunamadı!")
            continue
        
        # Profile bilgisini al
        profile_path = os.path.join(character_path, "profile.json")
        turkish_name = "?"
        english_name = character_folder
        
        if os.path.exists(profile_path):
            try:
                with open(profile_path, 'r', encoding='utf-8') as f:
                    profile = json.load(f)
                    # Daha güvenli veri çekme
                    if "name" in profile:
                        turkish_name = profile["name"].get("tr", "?")
                        english_name = profile["name"].get("en", character_folder)
                    else:
                        print(f"⚠️  {character_folder}: profile.json'da 'name' anahtarı bulunamadı!")
            except json.JSONDecodeError as e:
                print(f"⚠️  {character_folder}: JSON parse hatası - {e}")
            except Exception as e:
                print(f"⚠️  {character_folder}: Profile okuma hatası - {e}")
        
        # Fotoğraf hash'i ve boyutları
        file_hash = get_file_hash(photo_path)
        dimensions = get_image_dimensions(photo_path)
        file_size = os.path.getsize(photo_path)
        
        # Bilgileri kaydet
        info = {
            "folder": character_folder,
            "english_name": english_name,
            "turkish_name": turkish_name,
            "photo_path": photo_path,
            "hash": file_hash,
            "dimensions": dimensions,
            "size_kb": file_size / 1024
        }
        
        character_info.append(info)
        hash_dict[file_hash].append(info)
    
    # Sonuçları yazdır
    print(f"\n{'='*80}")
    print(f"📊 TOPLAM KARAKTER: {len(character_info)}")
    print(f"{'='*80}\n")
    
    # Tüm karakterleri listele
    print("📋 TÜM KARAKTERLER:\n")
    for idx, info in enumerate(character_info, 1):
        dimensions_str = f"{info['dimensions'][0]}x{info['dimensions'][1]}" if info['dimensions'] else "?"
        print(f"{idx:2d}. {info['english_name']:20s} ({info['turkish_name']:15s}) - "
              f"{dimensions_str:10s} - {info['size_kb']:7.1f} KB")
    
    # Tekrar eden fotoğrafları bul
    print(f"\n{'='*80}")
    print("🔍 TEKRAR EDEN FOTOĞRAFLAR:\n")
    
    duplicates_found = False
    for file_hash, chars in hash_dict.items():
        if len(chars) > 1:
            duplicates_found = True
            print(f"⚠️  AYNI FOTOĞRAF KULLANILIYOR ({len(chars)} karakter):")
            for char in chars:
                print(f"   - {char['english_name']} ({char['turkish_name']})")
            print()
    
    if not duplicates_found:
        print("✅ Tekrar eden fotoğraf bulunamadı! Harika! 🎉\n")
    
    # Benzer boyutları kontrol et
    print(f"{'='*80}")
    print("📐 FOTOĞRAF BOYUTLARI DAĞILIMI:\n")
    
    dimension_dict = defaultdict(list)
    for info in character_info:
        if info['dimensions']:
            dimension_dict[info['dimensions']].append(info)
    
    for dimensions, chars in sorted(dimension_dict.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"📏 {dimensions[0]}x{dimensions[1]}: {len(chars)} karakter")
        if len(chars) <= 5:  # Sadece 5 veya daha az karakter varsa listele
            for char in chars:
                print(f"   - {char['english_name']} ({char['turkish_name']})")
    
    print(f"\n{'='*80}")
    
    return character_info, hash_dict

if __name__ == "__main__":
    # Repo dizinine göre ayarlayın
    characters_dir = "data/characters"
    
    if not os.path.exists(characters_dir):
        print(f"❌ Hata: '{characters_dir}' klasörü bulunamadı!")
        print("   Lütfen scripti repo kök dizininde çalıştırın veya yolu düzenleyin.")
        exit(1)
    
    character_info, hash_dict = check_duplicate_photos(characters_dir)
    
    # HTML raporu oluştur
    print("\n📝 HTML raporu oluşturuluyor...")
    create_html_report(character_info, hash_dict)
    print("✅ 'character_photos_report.html' dosyası oluşturuldu!")
    print("   Dosyayı tarayıcınızda açarak tüm fotoğrafları görebilirsiniz!")