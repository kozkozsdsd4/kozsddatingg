/**
 * AI default configuration
 *
 * Bu dosyada provider seçimi, model varsayılanları ve genel parametreleri tutabilirsiniz.
 */

module.exports = {
  defaultProvider: 'GeminiNano',
  defaultOptions: {
    maxTokens: 512,
    temperature: 0.8,
    topP: 0.95
  },
  providers: {
    GeminiNano: {
      model: 'gemini-nano',
      // ek entegrasyon parametreleri:
      // localServerUrl: 'http://127.0.0.1:8000',
      // device: '/dev/ml0'
    }
  }
};