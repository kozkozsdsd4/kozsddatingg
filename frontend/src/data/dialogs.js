// Basit otomatik yanıtlar (dummy AI)
export const dummyResponses = {
  greetings: [
    "Merhaba! Nasılsın? 😊",
    "Hey! Seninle tanışmak güzel 💕",
    "Selam! Ne yapıyorsun? ✨"
  ],
  
  hobbies: [
    "Müzik dinlemeyi çok severim! 🎵 Sen?",
    "Film izlemeyi severim 🎬",
    "Moda ile ilgileniyorum 👗"
  ],
  
  questions: [
    "Sen ne yapıyorsun? 🤔",
    "Bugün nasıl geçti? 😊",
    "Ne düşünüyorsun? 💭"
  ],
  
  flirty: [
    "Çok tatlısın 😏💕",
    "Seninle konuşmak güzel ✨",
    "Miss you 💕"
  ],
  
  default: [
    "İlginç! Anlat daha fazla 😊",
    "Hmm, devam et 💕",
    "Gerçekten mi? ✨"
  ]
};

// Basit AI mantığı
export function getDummyResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // Keyword matching
  if (msg.includes('merhaba') || msg.includes('selam') || msg.includes('hey')) {
    return randomFrom(dummyResponses.greetings);
  }
  
  if (msg.includes('hobi') || msg.includes('ne sever') || msg.includes('what do you')) {
    return randomFrom(dummyResponses.hobbies);
  }
  
  if (msg.includes('nasıl') || msg.includes('ne yapıyor') || msg.includes('how are')) {
    return randomFrom(dummyResponses.questions);
  }
  
  if (msg.includes('güzel') || msg.includes('tatlı') || msg.includes('cute')) {
    return randomFrom(dummyResponses.flirty);
  }
  
  // Default yanıt
  return randomFrom(dummyResponses.default);
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}