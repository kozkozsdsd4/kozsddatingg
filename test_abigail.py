import json
import os

# Abigail'in profile.json dosyasını oku
profile_path = "data/characters/Abigail/profile.json"

print("🔍 Abigail'in profile.json dosyası kontrol ediliyor...\n")
print(f"Dosya yolu: {profile_path}")
print(f"Dosya var mı: {os.path.exists(profile_path)}\n")

if os.path.exists(profile_path):
    # Dosya boyutu
    file_size = os.path.getsize(profile_path)
    print(f"Dosya boyutu: {file_size} bytes\n")
    
    # Raw içerik
    print("=" * 80)
    print("RAW İÇERİK (ilk 500 karakter):")
    print("=" * 80)
    with open(profile_path, 'r', encoding='utf-8') as f:
        raw_content = f.read(500)
        print(raw_content)
    print("\n")
    
    # JSON parse
    print("=" * 80)
    print("JSON PARSE DENEMESİ:")
    print("=" * 80)
    try:
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile = json.load(f)
            print("✅ JSON başarıyla parse edildi!")
            print(f"\nToplam anahtar: {len(profile.keys())}")
            print(f"Anahtarlar: {list(profile.keys())}\n")
            
            # Name kontrolü
            if "name" in profile:
                print("✅ 'name' anahtarı bulundu!")
                print(f"name içeriği: {profile['name']}")
                print(f"name type: {type(profile['name'])}")
                
                if isinstance(profile['name'], dict):
                    print(f"\n'tr' anahtarı var mı: {'tr' in profile['name']}")
                    print(f"'en' anahtarı var mı: {'en' in profile['name']}")
                    
                    if 'tr' in profile['name']:
                        turkish_name = profile['name']['tr']
                        print(f"\n✅ Türkçe isim bulundu: '{turkish_name}'")
                        print(f"   Type: {type(turkish_name)}")
                        print(f"   Length: {len(turkish_name)}")
                        print(f"   Bytes: {turkish_name.encode('utf-8')}")
                    else:
                        print("\n❌ 'tr' anahtarı bulunamadı!")
                    
                    if 'en' in profile['name']:
                        english_name = profile['name']['en']
                        print(f"\n✅ İngilizce isim bulundu: '{english_name}'")
                else:
                    print(f"\n❌ 'name' bir dict değil! Type: {type(profile['name'])}")
            else:
                print("❌ 'name' anahtarı bulunamadı!")
                
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Hatası: {e}")
        print(f"   Satır: {e.lineno}, Kolon: {e.colno}")
    except Exception as e:
        print(f"❌ Genel Hata: {type(e).__name__}: {e}")
else:
    print("❌ Dosya bulunamadı!")

print("\n" + "=" * 80)