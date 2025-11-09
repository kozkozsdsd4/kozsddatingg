// Dummy karakter verisi
export const characters = [
  {
    id: 1,
    name: 'Olivia',
    nameTr: 'Olivya',
    age: 24,
    location: 'İstanbul',
    bio: 'Moda tasarımcısı. Müzik ve sanat severim 🎨',
    photos: [
      '/assets/characters/olivia.jpg',
      '/assets/characters/olivia2.jpg'
    ],
    interests: ['Moda', 'Müzik', 'Film'],
    traits: {
      personality: ['Optimistic', 'Energetic', 'Playful'],
      hobbies: ['Music Lover', 'Fashion Enthusiast'],
      discovered: 15 // %15 keşfedildi
    },
    online: true
  },
  {
    id: 2,
    name: 'Emma',
    nameTr: 'Emma',
    age: 22,
    location: 'Ankara',
    bio: 'Grafik tasarımcı. Kahve ve kitap 📚☕',
    photos: ['/assets/characters/emma.jpg'],
    interests: ['Tasarım', 'Okuma', 'Kahve'],
    traits: {
      personality: ['Creative', 'Introverted'],
      hobbies: ['Book Worm', 'Coffee Lover'],
      discovered: 8
    },
    online: false
  },
  {
    id: 3,
    name: 'Amelia',
    nameTr: 'Amelia',
    age: 26,
    location: 'İzmir',
    bio: 'Fitness instructor. Healthy lifestyle 💪',
    photos: ['/assets/characters/amelia.jpg'],
    interests: ['Fitness', 'Yoga', 'Seyahat'],
    traits: {
      personality: ['Ambitious', 'Active'],
      hobbies: ['Fitness Enthusiast', 'Yoga Practitioner'],
      discovered: 22
    },
    online: true
  }
  // Daha fazla karakter eklenebilir...
];