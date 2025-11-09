/**
 * KeyboardHandler.js - Mobile Keyboard Detection & Management
 * iOS/Android keyboard-aware layout handler
 * Liquid Glass Keyboard compatibility
 */

class KeyboardHandler {
  constructor() {
    this.isKeyboardVisible = false;
    this.keyboardHeight = 0;
    this.platform = this.detectPlatform();
    this.listeners = [];
    
    this.init();
  }

  detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'ios';
    }
    
    // Android detection
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    
    return 'web';
  }

  init() {
    if (this.platform === 'web') {
      console.log('🖥️ Web platform detected - standard keyboard handling');
      return;
    }

    // iOS Keyboard Detection
    if (this.platform === 'ios') {
      this.initIOSKeyboard();
    }
    
    // Android Keyboard Detection
    if (this.platform === 'android') {
      this.initAndroidKeyboard();
    }

    // Universal handlers
    this.initUniversalHandlers();
  }

  initIOSKeyboard() {
    console.log('🍎 iOS detected - initializing keyboard handlers');

    // Visual Viewport API (iOS 13+)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleIOSViewportResize();
      });

      window.visualViewport.addEventListener('scroll', () => {
        this.handleIOSViewportScroll();
      });
    }

    // Fallback for older iOS
    window.addEventListener('focusin', (e) => {
      if (this.isInputElement(e.target)) {
        this.handleKeyboardShow('ios-focusin');
      }
    });

    window.addEventListener('focusout', (e) => {
      if (this.isInputElement(e.target)) {
        this.handleKeyboardHide('ios-focusout');
      }
    });
  }

  initAndroidKeyboard() {
    console.log('🤖 Android detected - initializing keyboard handlers');

    // Android uses resize events
    let initialHeight = window.innerHeight;

    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;

      // Keyboard is visible if height decreased by more than 150px
      if (heightDifference > 150) {
        this.keyboardHeight = heightDifference;
        this.handleKeyboardShow('android-resize');
      } else {
        this.handleKeyboardHide('android-resize');
      }
    });

    // Focus handlers as backup
    window.addEventListener('focusin', (e) => {
      if (this.isInputElement(e.target)) {
        setTimeout(() => {
          this.handleKeyboardShow('android-focusin');
        }, 300);
      }
    });

    window.addEventListener('focusout', (e) => {
      if (this.isInputElement(e.target)) {
        setTimeout(() => {
          this.handleKeyboardHide('android-focusout');
        }, 100);
      }
    });
  }

  initUniversalHandlers() {
    // Handle input focus
    document.addEventListener('focusin', (e) => {
      if (this.isInputElement(e.target)) {
        this.scrollToInput(e.target);
      }
    });

    // Prevent body scroll when keyboard is open
    document.addEventListener('touchmove', (e) => {
      if (this.isKeyboardVisible && !this.isScrollableElement(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  handleIOSViewportResize() {
    const viewport = window.visualViewport;
    const viewportHeight = viewport.height;
    const windowHeight = window.innerHeight;
    
    this.keyboardHeight = windowHeight - viewportHeight;

    if (this.keyboardHeight > 150) {
      this.handleKeyboardShow('ios-viewport');
    } else {
      this.handleKeyboardHide('ios-viewport');
    }
  }

  handleIOSViewportScroll() {
    // Keep input in view when scrolling with keyboard open
    if (this.isKeyboardVisible) {
      const activeElement = document.activeElement;
      if (this.isInputElement(activeElement)) {
        this.scrollToInput(activeElement, false);
      }
    }
  }

  handleKeyboardShow(source) {
    if (this.isKeyboardVisible) return;

    this.isKeyboardVisible = true;
    console.log(`⌨️ Keyboard shown (${source})`);

    // Add class to body
    document.body.classList.add('keyboard-visible');
    document.body.classList.add(`keyboard-${this.platform}`);

    // Adjust viewport
    this.adjustViewport();

    // Notify listeners
    this.notifyListeners('show', {
      height: this.keyboardHeight,
      platform: this.platform,
      source
    });
  }

  handleKeyboardHide(source) {
    if (!this.isKeyboardVisible) return;

    this.isKeyboardVisible = false;
    console.log(`⌨️ Keyboard hidden (${source})`);

    // Remove class from body
    document.body.classList.remove('keyboard-visible');
    document.body.classList.remove(`keyboard-${this.platform}`);

    // Reset viewport
    this.resetViewport();

    // Notify listeners
    this.notifyListeners('hide', {
      platform: this.platform,
      source
    });
  }

  adjustViewport() {
    const chatScreen = document.querySelector('.chat-screen');
    const inputContainer = document.querySelector('.chat-input-container');
    
    if (chatScreen && this.keyboardHeight > 0) {
      chatScreen.style.height = `calc(100vh - ${this.keyboardHeight}px)`;
    }

    if (inputContainer) {
      inputContainer.style.paddingBottom = `${Math.max(16, this.keyboardHeight)}px`;
    }
  }

  resetViewport() {
    const chatScreen = document.querySelector('.chat-screen');
    const inputContainer = document.querySelector('.chat-input-container');
    
    if (chatScreen) {
      chatScreen.style.height = '100vh';
    }

    if (inputContainer) {
      inputContainer.style.paddingBottom = '';
    }
  }

  scrollToInput(inputElement, animated = true) {
    if (!inputElement) return;

    setTimeout(() => {
      const rect = inputElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const scrollOffset = rect.bottom - viewportHeight + 100; // 100px padding

      if (scrollOffset > 0) {
        const behavior = animated ? 'smooth' : 'auto';
        window.scrollBy({ top: scrollOffset, behavior });
      }

      // Also scroll input into view
      inputElement.scrollIntoView({
        behavior: animated ? 'smooth' : 'auto',
        block: 'center'
      });
    }, 100);
  }

  isInputElement(element) {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || 
           tagName === 'textarea' || 
           element.isContentEditable ||
           element.classList.contains('message-input');
  }

  isScrollableElement(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    
    return overflowY === 'auto' || 
           overflowY === 'scroll' ||
           element.classList.contains('messages-container');
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  notifyListeners(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Keyboard listener error:', error);
      }
    });
  }

  // Public API
  getStatus() {
    return {
      isVisible: this.isKeyboardVisible,
      height: this.keyboardHeight,
      platform: this.platform
    };
  }

  destroy() {
    // Remove all listeners
    this.listeners = [];
    
    // Remove body classes
    document.body.classList.remove('keyboard-visible');
    document.body.classList.remove(`keyboard-${this.platform}`);
    
    console.log('🗑️ KeyboardHandler destroyed');
  }
}

// Singleton instance
let keyboardHandlerInstance = null;

export const getKeyboardHandler = () => {
  if (!keyboardHandlerInstance) {
    keyboardHandlerInstance = new KeyboardHandler();
  }
  return keyboardHandlerInstance;
};

export default KeyboardHandler;