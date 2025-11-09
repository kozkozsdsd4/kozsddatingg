const fs = require('fs');
const path = require('path');

/**
 * DIALOGS GENERATOR - Ana Script
 * 
 * Bu script:
 * - template-dialogs.json'u okur
 * - Her karakter için profile.json'dan bilgi çeker
 * - Değişkenleri doldurur
 * - Karaktere özel dialogs.json oluşturur
 * - Kalite kontrolü yapar
 */

// ============================================
// 1. YARDIMCI FONKSİYONLAR
// ============================================

/**
 * JSON dosyasını oku
 */
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Dosya okunamadı: ${filePath}`);
    console.error(`   Hata: ${error.message}`);
    return null;
  }
}

/**
 * JSON dosyasına yaz
 */
function writeJSON(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ Dosya yazılamadı: ${filePath}`);
    console.error(`   Hata: ${error.message}`);
    return false;
  }
}

/**
 * Klasör var mı kontrol et, yoksa oluştur
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================
// 2. DEĞİŞKEN ÇIKARICI (VARIABLE EXTRACTOR)
// ============================================

/**
 * Profile.json'dan değişkenleri çıkar
 */
function extractVariables(profile) {
  const variables = {};
  
  // Temel bilgiler
  variables.name = profile.name?.tr || 'Karakter';
  variables.character_name = profile.name?.en || 'Character';
  
  // Fiziksel özellikler
  if (profile.physical) {
    variables.age = profile.physical.age || '24';
    variables.height = profile.physical.height || '';
    variables.hair_color = profile.physical.hairColor || '';
    variables.eye_color = profile.physical.eyeColor || '';
  }
  
  // Kişilik
  if (profile.personality) {
    variables.bio = profile.personality.bio || '';
    variables.traits = profile.personality.traits?.join(', ') || '';
    
    // İlgi alanları
    if (profile.personality.interests && profile.personality.interests.length > 0) {
      variables.hobby = profile.personality.interests[0] || 'müzik dinlemek';
      variables.hobby_list = profile.personality.interests.join(', ');
      
      // Spesifik hobiler
      profile.personality.interests.forEach(interest => {
        const lower = interest.toLowerCase();
        if (lower.includes('müzik') || lower.includes('music')) {
          variables.music_interest = interest;
        }
        if (lower.includes('spor') || lower.includes('fitness') || lower.includes('yoga') || lower.includes('koşu') || lower.includes('gym')) {
          variables.sport = interest;
        }
        if (lower.includes('yemek') || lower.includes('food') || lower.includes('cooking')) {
          variables.food_interest = interest;
        }
        if (lower.includes('seyahat') || lower.includes('travel')) {
          variables.travel_interest = interest;
        }
        if (lower.includes('okumak') || lower.includes('kitap') || lower.includes('book')) {
          variables.book_interest = interest;
        }
      });
    }
  }
  
  // Konuşma stili
  if (profile.conversationStyle) {
    variables.tone = profile.conversationStyle.tone || 'friendly';
    variables.vocabulary = profile.conversationStyle.vocabulary || 'casual';
  }
  
  // Varsayılan değerler
  variables.job = variables.bio?.match(/(\w+)\s+olarak\s+çalışıyor/)?.[1] || 'profesyonel';
  variables.morning_activity = 'kahvemi içtim';
  variables.morning_routine = 'sabah rutinini';
  variables.afternoon_activity = 'dinleniyorum';
  variables.evening_mood = 'rahatım';
  variables.night_activity = 'müzik dinliyorum';
  variables.current_activity = 'dinleniyorum';
  variables.activity = 'vakit geçiriyorum';
  variables.daily_routine = 'günlük rutinimle ilgilendim';
  
  // Müzik
  variables.music_genre = 'pop';
  variables.music_mood = 'chill';
  variables.artist_name = 'favori şarkıcımı';
  variables.song_name = 'favori şarkımı';
  
  // Film
  variables.movie_genre = 'komedi';
  variables.movie_name = 'favori filmimi';
  variables.series_name = 'favori dizimi';
  variables.director_name = 'favori yönetmenimi';
  
  // Yemek
  variables.favorite_food = 'pizza';
  variables.cuisine_type = 'İtalyan';
  variables.restaurant_type = 'casual bir';
  
  // Seyahat
  variables.travel_destination = 'Paris';
  variables.place = 'İstanbul';
  variables.travel_style = 'rahat';
  variables.dream_vacation = 'Bali';
  variables.bucket_list_place = 'Japonya';
  
  // Hava durumu
  variables.weather_condition = 'güneşli';
  variables.weather_preference = 'güneşli';
  variables.weather_activity = 'yürüyüş yapmak';
  variables.weather_mood = 'güzel';
  variables.weather_feeling = 'çok güzel';
  
  // Evcil hayvan
  variables.pet_type = 'kediler';
  variables.pet_name = 'kedim';
  
  // Kitap
  variables.book_genre = 'roman';
  variables.book_name = 'son okuduğum kitabı';
  variables.author_name = 'favori yazarımı';
  
  // Spor - VARSAYILAN DEĞER EKLEME (CRITICAL FIX!)
  if (!variables.sport) {
    variables.sport = 'spor yapmayı';
  }
  variables.sport_team = 'favori takımımı';
  
  // Diğer
  variables.appearance_comment = 'Bugün gerçekten iyisin';
  variables.comforting_words = 'Her şey düzelecek';
  variables.stress_relief_suggestion = 'Biraz dinlen';
  variables.intellectual_interest = 'ilginç konular';
  variables.job_feeling = 'eğlenceli';
  variables.work_description = 'İşimle ilgileniyorum';
  variables.shared_hobby = variables.hobby;
  variables.media_type = 'dizi';
  variables.event = 'ilginç bir şey';
  variables.topic = 'o konu';
  variables.user_hobby = 'hobiyle';
  
  return variables;
}

// ============================================
// 3. DEĞİŞKEN YERLEŞTİRİCİ (VARIABLE REPLACER)
// ============================================

/**
 * String içindeki tüm değişkenleri değiştir
 */
function replaceVariables(text, variables) {
  if (typeof text !== 'string') return text;
  
  let result = text;
  
  // Tüm değişkenleri değiştir
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    const value = variables[key] || placeholder; // Değer yoksa placeholder kalsın
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return result;
}

/**
 * Object içindeki tüm string'leri recursive olarak işle
 */
function processObject(obj, variables) {
  if (typeof obj === 'string') {
    return replaceVariables(obj, variables);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processObject(item, variables));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    Object.keys(obj).forEach(key => {
      result[key] = processObject(obj[key], variables);
    });
    return result;
  }
  
  return obj;
}

// ============================================
// 4. KALİTE KONTROL (QUALITY CHECKER)
// ============================================

/**
 * Tek bir dialog'u kontrol et
 */
function validateDialog(text) {
  const issues = [];
  
  // Uzunluk kontrolü
  if (text.length < 5) {
    issues.push('Çok kısa');
  }
  if (text.length > 150) {
    issues.push('Çok uzun');
  }
  
  // Emoji kontrolü
  const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount === 0) {
    issues.push('Emoji yok');
  }
  if (emojiCount > 4) {
    issues.push('Çok fazla emoji');
  }
  
  // Placeholder kontrolü (değiştirilmemiş)
  const unprocessedPlaceholders = text.match(/\{[^}]+\}/g);
  if (unprocessedPlaceholders) {
    issues.push(`İşlenmemiş değişken: ${unprocessedPlaceholders.join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues: issues,
    text: text
  };
}

/**
 * Tüm dialogs'u recursive olarak kontrol et
 */
function validateDialogs(dialogs, path = '') {
  let totalDialogs = 0;
  let validDialogs = 0;
  const issues = [];
  
  function traverse(obj, currentPath) {
    if (typeof obj === 'string') {
      totalDialogs++;
      const result = validateDialog(obj);
      if (result.valid) {
        validDialogs++;
      } else {
        issues.push({
          path: currentPath,
          text: result.text.substring(0, 50) + '...',
          issues: result.issues
        });
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        traverse(item, `${currentPath}[${index}]`);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        traverse(obj[key], currentPath ? `${currentPath}.${key}` : key);
      });
    }
  }
  
  traverse(dialogs, path);
  
  return {
    total: totalDialogs,
    valid: validDialogs,
    invalid: totalDialogs - validDialogs,
    quality: totalDialogs > 0 ? (validDialogs / totalDialogs * 100).toFixed(1) : 0,
    issues: issues
  };
}

// ============================================
// 5. ANA GENERATOR FONKSİYONU
// ============================================

/**
 * Tek bir karakter için dialogs.json oluştur
 */
function generateDialogsForCharacter(characterFolder, templatePath, charactersDir) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 İşleniyor: ${characterFolder}`);
  console.log(`${'='.repeat(60)}`);
  
  // Dosya yolları
  const characterPath = path.join(charactersDir, characterFolder);
  const profilePath = path.join(characterPath, 'profile.json');
  const outputPath = path.join(characterPath, 'dialogs.json');
  
  // Profile.json kontrolü
  if (!fs.existsSync(profilePath)) {
    console.log(`⚠️  profile.json bulunamadı, atlanıyor...`);
    return { success: false, reason: 'profile.json bulunamadı' };
  }
  
  // Template'i oku
  const template = readJSON(templatePath);
  if (!template) {
    console.log(`❌ Template okunamadı!`);
    return { success: false, reason: 'Template okunamadı' };
  }
  
  // Profile'ı oku
  const profile = readJSON(profilePath);
  if (!profile) {
    console.log(`❌ Profile okunamadı!`);
    return { success: false, reason: 'Profile okunamadı' };
  }
  
  console.log(`✅ Profile yüklendi: ${profile.name?.en} (${profile.name?.tr})`);
  
  // Değişkenleri çıkar
  const variables = extractVariables(profile);
  console.log(`✅ ${Object.keys(variables).length} değişken çıkarıldı`);
  console.log(`   Örnek: {name} → "${variables.name}"`);
  console.log(`   Örnek: {hobby} → "${variables.hobby}"`);
  console.log(`   Örnek: {sport} → "${variables.sport}"`);
  
  // Template'i işle
  console.log(`⚙️  Template işleniyor...`);
  const processedDialogs = processObject(template, variables);
  
  // Metadata güncelle
  processedDialogs.metadata.character = profile.name?.en || characterFolder;
  processedDialogs.metadata.generated_date = new Date().toISOString().split('T')[0];
  
  // Kalite kontrolü
  console.log(`🔍 Kalite kontrolü yapılıyor...`);
  const qualityReport = validateDialogs(processedDialogs);
  
  console.log(`\n📊 Kalite Raporu:`);
  console.log(`   Toplam dialog: ${qualityReport.total}`);
  console.log(`   Geçerli: ${qualityReport.valid} (${qualityReport.quality}%)`);
  console.log(`   Hatalı: ${qualityReport.invalid}`);
  
  if (qualityReport.invalid > 0) {
    console.log(`\n⚠️  Bulunan sorunlar (ilk 5):`);
    qualityReport.issues.slice(0, 5).forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue.path}`);
      console.log(`      "${issue.text}"`);
      console.log(`      Sorunlar: ${issue.issues.join(', ')}`);
    });
  }
  
  // Kalite skorunu metadata'ya ekle
  processedDialogs.metadata.quality_score = qualityReport.quality;
  
  // Dosyaya yaz
  console.log(`\n💾 Kaydediliyor: ${outputPath}`);
  const written = writeJSON(outputPath, processedDialogs);
  
  if (written) {
    console.log(`✅ Başarıyla oluşturuldu!`);
    console.log(`   📄 Dosya: ${outputPath}`);
    console.log(`   📊 Kalite: ${qualityReport.quality}%`);
    return { 
      success: true, 
      quality: qualityReport.quality,
      total: qualityReport.total,
      valid: qualityReport.valid
    };
  } else {
    console.log(`❌ Dosya kaydedilemedi!`);
    return { success: false, reason: 'Dosya yazılamadı' };
  }
}

// ============================================
// 6. TOPLU GENERATOR (BATCH GENERATOR)
// ============================================

/**
 * Tüm karakterler için dialogs.json oluştur
 */
function generateAllDialogs(templatePath, charactersDir) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 DIALOGS GENERATOR - TOPLU OLUŞTURMA`);
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`📂 Karakterler klasörü: ${charactersDir}`);
  console.log(`📄 Template dosyası: ${templatePath}\n`);
  
  // Template kontrolü
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template bulunamadı: ${templatePath}`);
    return;
  }
  
  // Karakterler klasörü kontrolü
  if (!fs.existsSync(charactersDir)) {
    console.error(`❌ Karakterler klasörü bulunamadı: ${charactersDir}`);
    return;
  }
  
  // Tüm karakter klasörlerini listele
  const folders = fs.readdirSync(charactersDir).filter(folder => {
    const folderPath = path.join(charactersDir, folder);
    return fs.statSync(folderPath).isDirectory();
  });
  
  console.log(`📋 Bulunan karakter sayısı: ${folders.length}\n`);
  
  if (folders.length === 0) {
    console.log(`⚠️  Hiç karakter klasörü bulunamadı!`);
    return;
  }
  
  // İstatistikler
  const stats = {
    total: folders.length,
    success: 0,
    failed: 0,
    skipped: 0,
    avgQuality: 0,
    results: []
  };
  
  // Her karakter için işle
  folders.forEach((folder, index) => {
    const result = generateDialogsForCharacter(folder, templatePath, charactersDir);
    
    if (result.success) {
      stats.success++;
      stats.avgQuality += parseFloat(result.quality);
      stats.results.push({
        character: folder,
        status: 'success',
        quality: result.quality,
        dialogs: result.total
      });
    } else if (result.reason === 'profile.json bulunamadı') {
      stats.skipped++;
      stats.results.push({
        character: folder,
        status: 'skipped',
        reason: result.reason
      });
    } else {
      stats.failed++;
      stats.results.push({
        character: folder,
        status: 'failed',
        reason: result.reason
      });
    }
    
    // İlerleme
    const progress = ((index + 1) / folders.length * 100).toFixed(1);
    console.log(`\n📊 İlerleme: ${index + 1}/${folders.length} (${progress}%)`);
  });
  
  // Ortalama kalite
  if (stats.success > 0) {
    stats.avgQuality = (stats.avgQuality / stats.success).toFixed(1);
  }
  
  // Özet rapor
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📊 ÖZET RAPOR`);
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`✅ Başarılı: ${stats.success}`);
  console.log(`❌ Başarısız: ${stats.failed}`);
  console.log(`⚠️  Atlanan: ${stats.skipped}`);
  console.log(`📊 Ortalama Kalite: ${stats.avgQuality}%\n`);
  
  // Başarılı olanlar
  if (stats.success > 0) {
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ BAŞARILI KARAKTERLER:`);
    console.log(`${'='.repeat(80)}\n`);
    
    stats.results
      .filter(r => r.status === 'success')
      .sort((a, b) => b.quality - a.quality)
      .forEach((r, idx) => {
        const num = String(idx + 1).padStart(2, ' ');
        const name = r.character.padEnd(20, ' ');
        console.log(`${num}. ${name} - Kalite: ${r.quality}% (${r.dialogs} dialog)`);
      });
  }
  
  // Başarısız olanlar
  if (stats.failed > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`❌ BAŞARISIZ KARAKTERLER:`);
    console.log(`${'='.repeat(80)}\n`);
    
    stats.results
      .filter(r => r.status === 'failed')
      .forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.character} - Sebep: ${r.reason}`);
      });
  }
  
  // Atlanan karakterler
  if (stats.skipped > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`⚠️  ATLANAN KARAKTERLER:`);
    console.log(`${'='.repeat(80)}\n`);
    
    stats.results
      .filter(r => r.status === 'skipped')
      .forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.character} - Sebep: ${r.reason}`);
      });
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎉 TAMAMLANDI!`);
  console.log(`${'='.repeat(80)}\n`);
  
  return stats;
}

// ============================================
// 7. ANA PROGRAM
// ============================================

/**
 * Komut satırı argümanlarını parse et
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  const config = {
    mode: 'all', // 'all' veya 'single'
    character: null,
    templatePath: path.join(__dirname, 'template-dialogs.json'),
    charactersDir: path.join(__dirname, '..', 'data', 'characters')
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--character' || args[i] === '-c') {
      config.mode = 'single';
      config.character = args[i + 1];
      i++;
    } else if (args[i] === '--template' || args[i] === '-t') {
      config.templatePath = args[i + 1];
      i++;
    } else if (args[i] === '--dir' || args[i] === '-d') {
      config.charactersDir = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
📚 DIALOGS GENERATOR - Kullanım Kılavuzu

KULLANIM:
  node dialogs-generator.js [seçenekler]

SEÇENEKLER:
  -c, --character <name>   Tek bir karakter için oluştur
  -t, --template <path>    Template dosyası yolu
  -d, --dir <path>         Karakterler klasörü yolu
  -h, --help               Bu yardım mesajını göster

ÖRNEKLER:
  # Tüm karakterler için
  node dialogs-generator.js
  
  # Sadece Olivia için
  node dialogs-generator.js --character Olivia
  
  # Farklı dizin
  node dialogs-generator.js --dir /path/to/characters
      `);
      process.exit(0);
    }
  }
  
  return config;
}

/**
 * Ana fonksiyon
 */
function main() {
  const config = parseArgs();
  
  if (config.mode === 'single') {
    // Tek karakter
    if (!config.character) {
      console.error('❌ Karakter adı belirtilmedi! --character kullanın.');
      process.exit(1);
    }
    
    const result = generateDialogsForCharacter(
      config.character,
      config.templatePath,
      config.charactersDir
    );
    
    process.exit(result.success ? 0 : 1);
  } else {
    // Tüm karakterler
    const stats = generateAllDialogs(config.templatePath, config.charactersDir);
    
    process.exit(stats.failed === 0 ? 0 : 1);
  }
}

// Programı çalıştır
if (require.main === module) {
  main();
}

// Export (diğer scriptler için)
module.exports = {
  generateDialogsForCharacter,
  generateAllDialogs,
  extractVariables,
  replaceVariables,
  validateDialogs
};