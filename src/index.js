/**
 * Basit kullanım örneği
 *
 * - AIEngine'i başlatır
 * - GeminiNano provider'ı register eder (stub)
 * - test generate çağrısı yapar
 */

const AIEngine = require('./ai/AIEngine');
const GeminiNano = require('./ai/providers/GeminiNano');
const config = require('./ai/config');

async function main() {
  const engine = new AIEngine(config);
  const gem = new GeminiNano(config.providers.GeminiNano || {});
  engine.registerProvider('GeminiNano', gem);
  engine.setProvider(config.defaultProvider);

  const prompt = "Merhaba, tanışma metni oluştur: kısa, 2 cümle, nazik ve esprili.";
  const resp = await engine.generate(prompt, { maxTokens: 120 });
  console.log('AI reply:', resp.text);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}