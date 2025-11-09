/**
 * AIEngine - basit modüler AI arayüzü
 * - provider'ları register eder
 * - setProvider ile aktif sağlayıcı seçilir
 * - generate/metotları çağırır
 *
 * Not: Gerçek model entegrasyonu provider içinde uygulanmalı.
 */

class AIEngine {
  constructor(config = {}) {
    this.providers = new Map();
    this.active = null;
    this.config = config;
  }

  registerProvider(name, providerInstance) {
    this.providers.set(name, providerInstance);
    if (!this.active) this.active = name;
  }

  setProvider(name) {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.active = name;
  }

  getProvider() {
    return this.providers.get(this.active);
  }

  async generate(prompt, options = {}) {
    const provider = this.getProvider();
    if (!provider) throw new Error('No AI provider set');
    if (typeof provider.generate !== 'function') {
      throw new Error('Provider does not implement generate(prompt, options)');
    }
    const mergedOptions = Object.assign({}, this.config.defaultOptions || {}, options);
    return provider.generate(prompt, mergedOptions);
  }

  // helper to load providers from config (optional)
  initFromConfig(config) {
    this.config = Object.assign({}, this.config, config);
  }
}

module.exports = AIEngine;