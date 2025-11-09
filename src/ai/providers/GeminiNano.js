/**
 * GeminiNano provider (stub)
 *
 * Bu dosya Gemini Nano veya başka bir yerel model / LLM entegrasyonu için örnek stub'tır.
 * Gerçek entegasyon:
 * - On-device model API'sine çağrı yapın (ör. local server, native bridge veya model kütüphanesi)
 * - generate(prompt, options) async olarak text döndürsün
 *
 * Örnek kullanım:
 * const GeminiNano = require('./providers/GeminiNano');
 * const provider = new GeminiNano({ model: 'gemini-nano', device: '/dev/ml' });
 * engine.registerProvider('GeminiNano', provider);
 */

class GeminiNano {
  constructor(opts = {}) {
    this.opts = opts;
    // this.client = initializeLocalClient(opts) // placeholder
  }

  /**
   * generate - prompt'u modele gönderir ve response döner
   * @param {string} prompt
   * @param {object} opts
   * @returns {Promise<{text: string, usage?: object}>}
   */
  async generate(prompt, opts = {}) {
    // TODO: Burada gerçek model çağrısını yapın.
    // Örnek (pseudo):
    // const resp = await this.client.predict({ model: this.opts.model, prompt, ...opts });
    // return { text: resp.output, usage: resp.usage };
    //
    // Şu anda stub döndürüyor:
    return {
      text: `[[GeminiNano stub reply]] Received prompt length: ${prompt.length}`,
      usage: { promptLength: prompt.length }
    };
  }
}

module.exports = GeminiNano;