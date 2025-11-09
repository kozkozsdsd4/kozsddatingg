import json
import os

def validate_all_profiles(characters_dir="data/characters"):
    """Tüm profile.json dosyalarını kontrol et"""
    
    print("🔍 Tüm karakter JSON dosyaları kontrol ediliyor...\n")
    
    errors = []
    success = []
    
    # Klasör var mı kontrol et
    if not os.path.exists(characters_dir):
        print(f"❌ Hata: '{characters_dir}' klasörü bulunamadı!")
        return success, errors
    
    # Tüm karakterleri tara
    try:
        folders = sorted(os.listdir(characters_dir))
    except Exception as e:
        print(f"❌ Klasör okunamadı: {e}")
        return success, errors
    
    for character_folder in folders:
        character_path = os.path.join(characters_dir, character_folder)
        
        # Klasör mü kontrol et
        if not os.path.isdir(character_path):
            continue
        
        profile_path = os.path.join(character_path, "profile.json")
        
        # Dosya var mı kontrol et
        if not os.path.exists(profile_path):
            error_msg = f"{character_folder}: profile.json bulunamadı!"
            errors.append(error_msg)
            print(f"⚠️  {error_msg}")
            continue
        
        # JSON'u oku ve validate et
        try:
            with open(profile_path, 'r', encoding='utf-8') as f:
                profile = json.load(f)
                
                # İsim kontrolü
                if "name" not in profile:
                    error_msg = f"{character_folder}: 'name' anahtarı yok!"
                    errors.append(error_msg)
                    print(f"❌ {error_msg}")
                elif not isinstance(profile["name"], dict):
                    error_msg = f"{character_folder}: 'name' bir dict değil!"
                    errors.append(error_msg)
                    print(f"❌ {error_msg}")
                elif "tr" not in profile["name"] or "en" not in profile["name"]:
                    error_msg = f"{character_folder}: 'name.tr' veya 'name.en' eksik!"
                    errors.append(error_msg)
                    print(f"❌ {error_msg}")
                else:
                    en_name = profile['name']['en']
                    tr_name = profile['name']['tr']
                    success_msg = f"{character_folder}: {en_name} ({tr_name})"
                    success.append(success_msg)
                    print(f"✅ {character_folder:20s} - {en_name:20s} ({tr_name})")
                    
        except json.JSONDecodeError as e:
            error_msg = f"{character_folder}: JSON Parse Hatası (Satır {e.lineno}, Kolon {e.colno})"
            errors.append(error_msg)
            print(f"❌ {error_msg}")
            print(f"   Detay: {str(e)[:100]}")
        except UnicodeDecodeError as e:
            error_msg = f"{character_folder}: Encoding hatası!"
            errors.append(error_msg)
            print(f"❌ {error_msg}")
        except Exception as e:
            error_msg = f"{character_folder}: {type(e).__name__}: {str(e)[:50]}"
            errors.append(error_msg)
            print(f"❌ {error_msg}")
    
    # Özet
    print(f"\n{'='*80}")
    print(f"📊 ÖZET:")
    print(f"{'='*80}")
    print(f"✅ Başarılı: {len(success)}")
    print(f"❌ Hatalı: {len(errors)}")
    
    if errors:
        print(f"\n{'='*80}")
        print("❌ HATALI DOSYALAR:")
        print(f"{'='*80}")
        for idx, error in enumerate(errors, 1):
            print(f"{idx:2d}. {error}")
    else:
        print("\n🎉 Tüm JSON dosyaları geçerli!")
    
    print(f"\n{'='*80}")
    
    return success, errors

if __name__ == "__main__":
    characters_dir = "data/characters"
    
    success, errors = validate_all_profiles(characters_dir)
    
    # Exit code
    exit(0 if len(errors) == 0 else 1)