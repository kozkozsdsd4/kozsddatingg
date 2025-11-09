const fs = require('fs');
const path = require('path');

/**
 * QUALITY CHECKER - Dialogs Kalite Kontrol Sistemi
 * 
 * Bu script:
 * - Tüm karakterlerin dialogs.json dosyalarını analiz eder
 * - Detaylı kalite raporu oluşturur
 * - Sorunları tespit eder ve çözüm önerir
 * - Karşılaştırmalı analiz yapar
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
    return null;
  }
}

/**
 * Renklendirme (Terminal)
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// ============================================
// 2. KALİTE KONTROL KURALLARI
// ============================================

const QualityRules = {
  // Emoji kontrolü
  checkEmoji: (text) => {
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    
    if (emojiCount === 0) {
      return { pass: false, severity: 'low', message: 'Emoji yok' };
    }
    if (emojiCount > 4) {
      return { pass: false, severity: 'medium', message: `Çok fazla emoji (${emojiCount})` };
    }
    
    return { pass: true };
  },
  
  // Uzunluk kontrolü
  checkLength: (text) => {
    const length = text.length;
    
    if (length < 5) {
      return { pass: false, severity: 'high', message: `Çok kısa (${length} karakter)` };
    }
    if (length > 150) {
      return { pass: false, severity: 'medium', message: `Çok uzun (${length} karakter)` };
    }
    if (length < 10) {
      return { pass: false, severity: 'low', message: `Kısa (${length} karakter)` };
    }
    
    return { pass: true };
  },
  
  // Placeholder kontrolü
  checkPlaceholders: (text) => {
    const placeholders = text.match(/\{[^}]+\}/g);
    
    if (placeholders && placeholders.length > 0) {
      return { 
        pass: false, 
        severity: 'critical', 
        message: `İşlenmemiş değişken: ${placeholders.join(', ')}` 
      };
    }
    
    return { pass: true };
  },
  
  // Noktalama kontrolü
  checkPunctuation: (text) => {
    // Metadata alanlarını atla
    if (text.length < 20 && !text.match(/[.!?]/)) {
      return { pass: true }; // Kısa metinler için geçerli
    }
    
    if (!text.match(/[.!?,;:]/)) {
      return { pass: false, severity: 'low', message: 'Noktalama yok' };
    }
    
    return { pass: true };
  },
  
  // Dil kontrolü (Türkçe/İngilizce karışımı)
  checkLanguageMix: (text) => {
    const turkishChars = (text.match(/[ğüşıöçĞÜŞİÖÇ]/g) || []).length;
    const words = text.split(/\s+/).length;
    
    // Türkçe karakter oranı çok düşükse uyar
    if (words > 5 && turkishChars === 0) {
      return { 
        pass: false, 
        severity: 'low', 
        message: 'Türkçe karakter yok (tamamen İngilizce?)' 
      };
    }
    
    return { pass: true };
  },
  
  // Tekrar kontrolü
  checkRepetition: (text) => {
    // Aynı kelime 3+ kez tekrarlanıyor mu?
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Kısa kelimeler atlanır
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    for (const [word, count] of Object.entries(wordCounts)) {
      if (count >= 3) {
        return { 
          pass: false, 
          severity: 'medium', 
          message: `"${word}" kelimesi ${count} kez tekrarlanıyor` 
        };
      }
    }
    
    return { pass: true };
  },
  
  // Büyük/küçük harf kontrolü
  checkCapitalization: (text) => {
    // İlk harf büyük mü?
    if (text.length > 0 && text[0] === text[0].toLowerCase() && text[0].match(/[a-zA-ZğüşıöçĞÜŞİÖÇ]/)) {
      return { 
        pass: false, 
        severity: 'low', 
        message: 'İlk harf küçük' 
      };
    }
    
    return { pass: true };
  }
};

// ============================================
// 3. DIALOG ANALİZCİ
// ============================================

/**
 * Tek bir dialog string'ini analiz et
 */
function analyzeDialog(text, path = '') {
  const issues = [];
  let severity = 'none';
  
  // Tüm kuralları uygula
  for (const [ruleName, ruleFunc] of Object.entries(QualityRules)) {
    const result = ruleFunc(text);
    
    if (!result.pass) {
      issues.push({
        rule: ruleName,
        severity: result.severity,
        message: result.message
      });
      
      // En yüksek severity'yi belirle
      if (result.severity === 'critical') severity = 'critical';
      else if (result.severity === 'high' && severity !== 'critical') severity = 'high';
      else if (result.severity === 'medium' && !['critical', 'high'].includes(severity)) severity = 'medium';
      else if (result.severity === 'low' && severity === 'none') severity = 'low';
    }
  }
  
  return {
    text: text,
    path: path,
    length: text.length,
    emojiCount: (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
    wordCount: text.split(/\s+/).length,
    valid: issues.length === 0,
    severity: severity,
    issues: issues
  };
}

/**
 * Dialogs object'ini recursive olarak analiz et
 */
function analyzeDialogs(dialogs, basePath = '') {
  const results = {
    total: 0,
    valid: 0,
    issues: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    details: []
  };
  
  function traverse(obj, currentPath) {
    if (typeof obj === 'string') {
      results.total++;
      
      const analysis = analyzeDialog(obj, currentPath);
      
      if (analysis.valid) {
        results.valid++;
      } else {
        results.issues[analysis.severity]++;
        results.details.push(analysis);
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
  
  traverse(dialogs, basePath);
  
  // Kalite skoru hesapla
  results.qualityScore = results.total > 0 
    ? ((results.valid / results.total) * 100).toFixed(1) 
    : 0;
  
  // Ağırlıklı skor (critical issues daha fazla etkiler)
  const weightedInvalid = 
    results.issues.critical * 4 + 
    results.issues.high * 3 + 
    results.issues.medium * 2 + 
    results.issues.low * 1;
  
  results.weightedScore = results.total > 0
    ? Math.max(0, 100 - (weightedInvalid / results.total * 100)).toFixed(1)
    : 0;
  
  return results;
}

// ============================================
// 4. KARAKTER ANALİZCİ
// ============================================

/**
 * Tek bir karakter için analiz yap
 */
function analyzeCharacter(characterFolder, charactersDir) {
  const characterPath = path.join(charactersDir, characterFolder);
  const dialogsPath = path.join(characterPath, 'dialogs.json');
  const profilePath = path.join(characterPath, 'profile.json');
  
  // Dialogs.json kontrolü
  if (!fs.existsSync(dialogsPath)) {
    return {
      character: characterFolder,
      status: 'missing',
      error: 'dialogs.json bulunamadı'
    };
  }
  
  // Dialogs'u oku
  const dialogs = readJSON(dialogsPath);
  if (!dialogs) {
    return {
      character: characterFolder,
      status: 'error',
      error: 'dialogs.json okunamadı (geçersiz JSON)'
    };
  }
  
  // Profile'ı oku (opsiyonel)
  const profile = readJSON(profilePath);
  
  // Analiz yap
  const analysis = analyzeDialogs(dialogs);
  
  return {
    character: characterFolder,
    characterName: profile?.name?.en || characterFolder,
    status: 'analyzed',
    metadata: dialogs.metadata,
    analysis: analysis
  };
}

// ============================================
// 5. TOPLU ANALİZ
// ============================================

/**
 * Tüm karakterleri analiz et
 */
function analyzeAllCharacters(charactersDir) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(colorize('🔍 QUALITY CHECKER - Kalite Kontrol Sistemi', 'cyan'));
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`📂 Karakterler klasörü: ${charactersDir}\n`);
  
  // Karakter klasörlerini listele
  const folders = fs.readdirSync(charactersDir).filter(folder => {
    const folderPath = path.join(charactersDir, folder);
    return fs.statSync(folderPath).isDirectory();
  });
  
  console.log(`📋 Bulunan karakter sayısı: ${folders.length}\n`);
  
  if (folders.length === 0) {
    console.log(colorize('⚠️  Hiç karakter klasörü bulunamadı!', 'yellow'));
    return;
  }
  
  const results = [];
  const stats = {
    total: folders.length,
    analyzed: 0,
    missing: 0,
    error: 0,
    totalDialogs: 0,
    totalValid: 0,
    totalIssues: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  // Her karakter için analiz
  folders.forEach((folder, index) => {
    const result = analyzeCharacter(folder, charactersDir);
    results.push(result);
    
    if (result.status === 'analyzed') {
      stats.analyzed++;
      stats.totalDialogs += result.analysis.total;
      stats.totalValid += result.analysis.valid;
      stats.totalIssues.critical += result.analysis.issues.critical;
      stats.totalIssues.high += result.analysis.issues.high;
      stats.totalIssues.medium += result.analysis.issues.medium;
      stats.totalIssues.low += result.analysis.issues.low;
    } else if (result.status === 'missing') {
      stats.missing++;
    } else if (result.status === 'error') {
      stats.error++;
    }
    
    // İlerleme göster
    const progress = ((index + 1) / folders.length * 100).toFixed(1);
    process.stdout.write(`\r⏳ İlerleme: ${index + 1}/${folders.length} (${progress}%) - ${folder.padEnd(20)} `);
  });
  
  console.log('\n');
  
  return { results, stats };
}

// ============================================
// 6. RAPOR OLUŞTURUCU
// ============================================

/**
 * Konsol raporu oluştur
 */
function generateConsoleReport(data) {
  const { results, stats } = data;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(colorize('📊 ÖZET RAPOR', 'bright'));
  console.log(`${'='.repeat(80)}\n`);
  
  // Genel istatistikler
  console.log(colorize('📈 Genel İstatistikler:', 'cyan'));
  console.log(`   Toplam Karakter: ${stats.total}`);
  console.log(`   ${colorize('✅', 'green')} Analiz Edilen: ${stats.analyzed}`);
  console.log(`   ${colorize('⚠️', 'yellow')}  Eksik: ${stats.missing}`);
  console.log(`   ${colorize('❌', 'red')} Hatalı: ${stats.error}`);
  console.log(`   Toplam Dialog: ${stats.totalDialogs.toLocaleString()}`);
  console.log(`   Geçerli Dialog: ${stats.totalValid.toLocaleString()} (${(stats.totalValid / stats.totalDialogs * 100).toFixed(1)}%)`);
  
  // Sorun dağılımı
  const totalIssues = stats.totalIssues.critical + stats.totalIssues.high + 
                      stats.totalIssues.medium + stats.totalIssues.low;
  
  console.log(`\n${colorize('🐛 Sorun Dağılımı:', 'cyan')}`);
  console.log(`   ${colorize('🔴 Critical:', 'red')} ${stats.totalIssues.critical.toLocaleString()}`);
  console.log(`   ${colorize('🟠 High:', 'yellow')} ${stats.totalIssues.high.toLocaleString()}`);
  console.log(`   ${colorize('🟡 Medium:', 'yellow')} ${stats.totalIssues.medium.toLocaleString()}`);
  console.log(`   ${colorize('🟢 Low:', 'green')} ${stats.totalIssues.low.toLocaleString()}`);
  console.log(`   Toplam: ${totalIssues.toLocaleString()}`);
  
  // En iyi karakterler
  const analyzed = results.filter(r => r.status === 'analyzed');
  const sortedByScore = [...analyzed].sort((a, b) => 
    parseFloat(b.analysis.weightedScore) - parseFloat(a.analysis.weightedScore)
  );
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(colorize('🏆 EN İYİ 10 KARAKTER (Ağırlıklı Skor)', 'green'));
  console.log(`${'='.repeat(80)}\n`);
  
  sortedByScore.slice(0, 10).forEach((r, idx) => {
    const score = parseFloat(r.analysis.weightedScore);
    const scoreColor = score >= 90 ? 'green' : score >= 75 ? 'yellow' : 'red';
    const num = String(idx + 1).padStart(2, ' ');
    const name = r.character.padEnd(20, ' ');
    
    console.log(`${num}. ${name} - ${colorize(`${r.analysis.weightedScore}%`, scoreColor)} ` +
                `(${r.analysis.valid}/${r.analysis.total} dialog)`);
  });
  
  // En kötü karakterler
  console.log(`\n${'='.repeat(80)}`);
  console.log(colorize('⚠️  İYİLEŞTİRME GEREKENLERİ (En Düşük 10)', 'yellow'));
  console.log(`${'='.repeat(80)}\n`);
  
  sortedByScore.slice(-10).reverse().forEach((r, idx) => {
    const score = parseFloat(r.analysis.weightedScore);
    const scoreColor = score >= 90 ? 'green' : score >= 75 ? 'yellow' : 'red';
    const num = String(idx + 1).padStart(2, ' ');
    const name = r.character.padEnd(20, ' ');
    
    const criticalIssues = r.analysis.issues.critical > 0 
      ? colorize(` 🔴${r.analysis.issues.critical}`, 'red')
      : '';
    
    console.log(`${num}. ${name} - ${colorize(`${r.analysis.weightedScore}%`, scoreColor)} ` +
                `(${r.analysis.issues.critical + r.analysis.issues.high + r.analysis.issues.medium + r.analysis.issues.low} sorun)${criticalIssues}`);
  });
  
  // Critical sorunları olan karakterler
  const withCritical = analyzed.filter(r => r.analysis.issues.critical > 0);
  
  if (withCritical.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(colorize('🔴 CRİTİCAL SORUNLAR (Acil Düzeltme Gerekli!)', 'red'));
    console.log(`${'='.repeat(80)}\n`);
    
    withCritical.forEach((r, idx) => {
      console.log(`${idx + 1}. ${colorize(r.character, 'red')} - ${r.analysis.issues.critical} critical sorun`);
      
      // İlk 3 critical sorunu göster
      const criticalDetails = r.analysis.details
        .filter(d => d.severity === 'critical')
        .slice(0, 3);
      
      criticalDetails.forEach(detail => {
        console.log(`   📍 ${detail.path}`);
        console.log(`      "${detail.text.substring(0, 60)}..."`);
        detail.issues.forEach(issue => {
          console.log(`      ${colorize('→', 'red')} ${issue.message}`);
        });
      });
      console.log('');
    });
  }
  
  // Eksik dosyalar
  const missing = results.filter(r => r.status === 'missing');
  
  if (missing.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(colorize('⚠️  EKSİK DOSYALAR', 'yellow'));
    console.log(`${'='.repeat(80)}\n`);
    
    missing.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.character} - ${r.error}`);
    });
  }
  
  // Final score
  const avgScore = analyzed.length > 0
    ? (analyzed.reduce((sum, r) => sum + parseFloat(r.analysis.weightedScore), 0) / analyzed.length).toFixed(1)
    : 0;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(colorize('🎯 GENEL KALİTE SKORU', 'cyan'));
  console.log(`${'='.repeat(80)}\n`);
  
  const scoreColor = avgScore >= 90 ? 'green' : avgScore >= 75 ? 'yellow' : 'red';
  console.log(`   Ortalama Ağırlıklı Skor: ${colorize(`${avgScore}%`, scoreColor)}`);
  console.log(`   Basit Skor: ${(stats.totalValid / stats.totalDialogs * 100).toFixed(1)}%`);
  
  if (avgScore >= 90) {
    console.log(`\n   ${colorize('🌟 MÜKEMMEL! Kalite standartları sağlanıyor!', 'green')}`);
  } else if (avgScore >= 75) {
    console.log(`\n   ${colorize('✅ İYİ! Birkaç iyileştirme ile mükemmel olabilir.', 'yellow')}`);
  } else {
    console.log(`\n   ${colorize('⚠️  İYİLEŞTİRME GEREKLİ! Critical sorunları çözün.', 'red')}`);
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(colorize('🎉 KONTROL TAMAMLANDI!', 'cyan'));
  console.log(`${'='.repeat(80)}\n`);
}

/**
 * JSON raporu oluştur
 */
function generateJSONReport(data, outputPath) {
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: data.stats,
    characters: data.results.map(r => ({
      character: r.character,
      characterName: r.characterName,
      status: r.status,
      score: r.analysis?.weightedScore,
      dialogs: r.analysis?.total,
      issues: r.analysis?.issues
    }))
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf-8');
  console.log(colorize(`\n💾 JSON rapor kaydedildi: ${outputPath}`, 'green'));
}

// ============================================
// 7. ANA PROGRAM
// ============================================

function parseArgs() {
  const args = process.argv.slice(2);
  
  const config = {
    charactersDir: path.join(__dirname, '..', 'data', 'characters'),
    jsonReport: false,
    jsonOutput: path.join(__dirname, 'quality-report.json')
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' || args[i] === '-d') {
      config.charactersDir = args[i + 1];
      i++;
    } else if (args[i] === '--json' || args[i] === '-j') {
      config.jsonReport = true;
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        config.jsonOutput = args[i + 1];
        i++;
      }
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
📚 QUALITY CHECKER - Kullanım Kılavuzu

KULLANIM:
  node quality-checker.js [seçenekler]

SEÇENEKLER:
  -d, --dir <path>         Karakterler klasörü yolu
  -j, --json [output]      JSON rapor oluştur (opsiyonel çıktı yolu)
  -h, --help               Bu yardım mesajını göster

ÖRNEKLER:
  # Standart analiz
  node quality-checker.js
  
  # JSON rapor ile
  node quality-checker.js --json
  
  # Özel dizin
  node quality-checker.js --dir /path/to/characters --json report.json
      `);
      process.exit(0);
    }
  }
  
  return config;
}

function main() {
  const config = parseArgs();
  
  // Analiz yap
  const data = analyzeAllCharacters(config.charactersDir);
  
  if (!data) {
    process.exit(1);
  }
  
  // Konsol raporu
  generateConsoleReport(data);
  
  // JSON rapor (opsiyonel)
  if (config.jsonReport) {
    generateJSONReport(data, config.jsonOutput);
  }
  
  process.exit(0);
}

// Programı çalıştır
if (require.main === module) {
  main();
}

// Export
module.exports = {
  analyzeCharacter,
  analyzeAllCharacters,
  analyzeDialog,
  QualityRules
};