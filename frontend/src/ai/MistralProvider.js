/**
 * MistralProvider.js - Mistral 7B On-Device AI Integration
 * Dating Sim için optimize edilmiş AI provider
 * 
 * Features:
 * - On-device inference (privacy-first)
 * - Character personality-based responses
 * - Turkish language optimized
 * - Quantized INT4 for mobile performance
 */

class MistralProvider {
  constructor(options = {}) {
    this.model = null;
    this.isInitialized = false;
    this.options = {
      modelPath: options.modelPath || '/models/mistral-7b-instruct-int4.bin',
      maxTokens: options.maxTokens || 150,
      temperature: options.temperature || 0.8,
      topP: options.topP || 0.95,
      topK: options.topK || 40,
      repetitionPenalty: options.repetitionPenalty || 1.1,
      ...options
    };
  }

  /**
   * Initialize Mistral 7B model
   * Loads quantized INT4 model for mobile devices
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('✅ Mistral 7B already initialized');
      return;
    }

    try {
      console.log('🚀 Loading Mistral 7B model...');
      
      // Dynamic import for tree-shaking
      const { LlmInference } = await import('@mediapipe/tasks-genai');
      
      this.model = await LlmInference.createFromOptions({
        baseOptions: {
          modelAssetPath: this.options.modelPath,
          delegate: 'GPU' // Use GPU acceleration if available
        },
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature,
        topK: this.options.topK,
        randomSeed: Date.now()
      });

      this.isInitialized = true;
      console.log('✅ Mistral 7B loaded successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize Mistral 7B:', error);
      throw new Error(`Mistral initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate character response based on user message
   * @param {string} userMessage - User's message
   * @param {object} character - Character data (name, personality, traits, etc.)
   * @returns {Promise<string>} - AI-generated response
   */
  async generate(userMessage, character) {
    if (!this.isInitialized) {
      throw new Error('Mistral model not initialized. Call initialize() first.');
    }

    try {
      const prompt = this.buildCharacterPrompt(userMessage, character);
      
      console.log('💭 Generating response for:', character.name);
      
      const response = await this.model.generateResponse(prompt);
      
      // Clean and format response
      const cleanedResponse = this.cleanResponse(response, character.name);
      
      return cleanedResponse;
      
    } catch (error) {
      console.error('❌ Generation error:', error);
      return this.getFallbackResponse(character);
    }
  }

  /**
   * Build character-specific prompt for Mistral 7B
   * Optimized for dating sim dialogues in Turkish
   */
  buildCharacterPrompt(userMessage, character) {
    const {
      name = 'Character',
      personality = 'friendly',
      traits = [],
      background = '',
      speakingStyle = 'casual',
      mood = 'neutral',
      relationshipLevel = 0
    } = character;

    // Relationship context
    let relationshipContext = '';
    if (relationshipLevel < 20) {
      relationshipContext = 'Henüz yeni tanışıyorsunuz. Nazik ve ilgili ol.';
    } else if (relationshipLevel < 50) {
      relationshipContext = 'Arkadaş oluyorsunuz. Samimi ve eğlenceli ol.';
    } else if (relationshipLevel < 80) {
      relationshipContext = 'Yakın arkadaşsınız. Flörtöz ve sevimli ol.';
    } else {
      relationshipContext = 'Çok yakınsınız. Romantik ve içten ol.';
    }

    // Build instruction prompt (Mistral format)
    const prompt = `<s>[INST] Sen ${name} adında bir karaktersin.\n\nKişiliğin: ${personality}\nÖzelliklerinin: ${traits.join(', ')}\nGeçmişin: ${background}\nKonuşma tarzın: ${speakingStyle}\nŞu anki ruh halin: ${mood}\n\n${relationshipContext}\n\nÖNEMLİ KURALLAR:\n- Türkçe yanıt ver\n- Maksimum 2-3 cümle kullan\n- ${name} olarak konuş (1. tekil şahıs)\n- Doğal ve samimi ol\n- Emoji kullanabilirsin (ama aşırıya kaçma)\n- Kullanıcıyla flört et ama abartma\n- Kısa ve özlü yanıtlar ver\n\nKullanıcı: ${userMessage}\n[/INST]\n\n${name}:`;

    return prompt;
  }

  /**
   * Clean AI response (remove prompt artifacts)
   */
  cleanResponse(rawResponse, characterName) {
    let cleaned = rawResponse;

    // Remove instruction tags if present
    cleaned = cleaned.replace(/\[INST\].*?\[\/INST\]/gs, '');
    cleaned = cleaned.replace(/<s>|<\/s>/g, '');
    
    // Remove character name prefix if duplicated
    const namePattern = new RegExp(`^${characterName}:?\s*`, 'i');
    cleaned = cleaned.replace(namePattern, '');
    
    // Remove extra whitespace
    cleaned = cleaned.trim();
    
    // Limit response length (safety check)
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    if (sentences.length > 3) {
      cleaned = sentences.slice(0, 3).join(' ');
    }
    
    return cleaned;
  }

  /**
   * Fallback response if AI fails
   */
  getFallbackResponse(character) {
    const fallbacks = [
      `Özür dilerim, şu an ne diyeceğimi bilemedim... 😅`,
      `Hmmm... ne desem acaba? 🤔`,
      `Bir dakika düşünmeme izin ver... 💭`,
      `Şey... biraz dalgınım galiba 😊`
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Batch generate responses (for multiple characters)
   */
  async generateBatch(messages) {
    const promises = messages.map(({ userMessage, character }) => 
      this.generate(userMessage, character)
    );
    return Promise.all(promises);
  }

  /**
   * Get model status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      modelPath: this.options.modelPath,
      config: {
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature,
        topP: this.options.topP,
        topK: this.options.topK
      }
    };
  }

  /**
   * Cleanup and free resources
   */
  async dispose() {
    if (this.model) {
      await this.model.close();
      this.model = null;
      this.isInitialized = false;
      console.log('🗑️ Mistral 7B model disposed');
    }
  }
}

export default MistralProvider;