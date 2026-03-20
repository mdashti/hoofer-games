export type Question = {
  id: string;
  text: string;
  answer: boolean;
  category: 'general' | 'science' | 'food' | 'animals' | 'math' | 'geography' | 'silly' | 'easy';
  difficulty: 'easy' | 'medium' | 'tricky';
};

export const questions: Question[] = [
  // === GENERAL ===
  { id: 'g01', text: 'The sky is blue', answer: true, category: 'general', difficulty: 'easy' },
  { id: 'g02', text: 'Humans have 3 arms', answer: false, category: 'general', difficulty: 'easy' },
  { id: 'g03', text: 'There are 7 days in a week', answer: true, category: 'general', difficulty: 'easy' },
  { id: 'g04', text: 'The alphabet has 24 letters', answer: false, category: 'general', difficulty: 'easy' },
  { id: 'g05', text: 'A year has 365 days', answer: true, category: 'general', difficulty: 'easy' },
  { id: 'g06', text: 'The color of grass is purple', answer: false, category: 'general', difficulty: 'easy' },
  { id: 'g07', text: 'There are 60 minutes in an hour', answer: true, category: 'general', difficulty: 'easy' },
  { id: 'g08', text: 'Diamonds are the hardest natural material', answer: true, category: 'general', difficulty: 'medium' },
  { id: 'g09', text: 'A triangle has 4 sides', answer: false, category: 'general', difficulty: 'easy' },
  { id: 'g10', text: 'The Mona Lisa was painted by Picasso', answer: false, category: 'general', difficulty: 'medium' },

  // === SCIENCE ===
  { id: 's01', text: 'Water boils at 100\u00B0C', answer: true, category: 'science', difficulty: 'easy' },
  { id: 's02', text: 'The Sun is a planet', answer: false, category: 'science', difficulty: 'easy' },
  { id: 's03', text: 'Humans have 206 bones', answer: true, category: 'science', difficulty: 'medium' },
  { id: 's04', text: 'Sound travels faster than light', answer: false, category: 'science', difficulty: 'easy' },
  { id: 's05', text: 'The Earth is flat', answer: false, category: 'science', difficulty: 'easy' },
  { id: 's06', text: 'Lightning is hotter than the surface of the Sun', answer: true, category: 'science', difficulty: 'tricky' },
  { id: 's07', text: 'Mars is known as the Blue Planet', answer: false, category: 'science', difficulty: 'easy' },
  { id: 's08', text: 'Oxygen is the most abundant element in the Earth\'s crust', answer: true, category: 'science', difficulty: 'tricky' },
  { id: 's09', text: 'Gravity pulls things upward', answer: false, category: 'science', difficulty: 'easy' },
  { id: 's10', text: 'Venus is the hottest planet in our solar system', answer: true, category: 'science', difficulty: 'medium' },

  // === FOOD ===
  { id: 'f01', text: 'Bananas are berries', answer: true, category: 'food', difficulty: 'tricky' },
  { id: 'f02', text: 'Pizza was invented in France', answer: false, category: 'food', difficulty: 'easy' },
  { id: 'f03', text: 'Strawberries are berries', answer: false, category: 'food', difficulty: 'tricky' },
  { id: 'f04', text: 'Chocolate comes from a bean', answer: true, category: 'food', difficulty: 'easy' },
  { id: 'f05', text: 'Sushi always contains raw fish', answer: false, category: 'food', difficulty: 'medium' },
  { id: 'f06', text: 'Peanuts are nuts', answer: false, category: 'food', difficulty: 'tricky' },
  { id: 'f07', text: 'Honey never spoils', answer: true, category: 'food', difficulty: 'medium' },
  { id: 'f08', text: 'Tomatoes are fruits', answer: true, category: 'food', difficulty: 'medium' },
  { id: 'f09', text: 'Carrots were originally purple', answer: true, category: 'food', difficulty: 'tricky' },
  { id: 'f10', text: 'Rice is a type of pasta', answer: false, category: 'food', difficulty: 'easy' },

  // === ANIMALS ===
  { id: 'a01', text: 'Dolphins are mammals', answer: true, category: 'animals', difficulty: 'easy' },
  { id: 'a02', text: 'Spiders have 6 legs', answer: false, category: 'animals', difficulty: 'easy' },
  { id: 'a03', text: 'A group of flamingos is called a flamboyance', answer: true, category: 'animals', difficulty: 'tricky' },
  { id: 'a04', text: 'Sharks are mammals', answer: false, category: 'animals', difficulty: 'easy' },
  { id: 'a05', text: 'Octopuses have 3 hearts', answer: true, category: 'animals', difficulty: 'medium' },
  { id: 'a06', text: 'Penguins can fly', answer: false, category: 'animals', difficulty: 'easy' },
  { id: 'a07', text: 'Cows have 4 stomachs', answer: true, category: 'animals', difficulty: 'tricky' },
  { id: 'a08', text: 'A snail can sleep for 3 years', answer: true, category: 'animals', difficulty: 'tricky' },
  { id: 'a09', text: 'Elephants can jump', answer: false, category: 'animals', difficulty: 'medium' },
  { id: 'a10', text: 'Cats have 9 lives', answer: false, category: 'animals', difficulty: 'easy' },

  // === MATH ===
  { id: 'm01', text: '2 + 2 = 4', answer: true, category: 'math', difficulty: 'easy' },
  { id: 'm02', text: '10 \u00D7 3 = 33', answer: false, category: 'math', difficulty: 'easy' },
  { id: 'm03', text: '100 \u00F7 4 = 25', answer: true, category: 'math', difficulty: 'easy' },
  { id: 'm04', text: '7 + 5 = 13', answer: false, category: 'math', difficulty: 'easy' },
  { id: 'm05', text: 'A square has 4 equal sides', answer: true, category: 'math', difficulty: 'easy' },
  { id: 'm06', text: '2 + 2 = 5', answer: false, category: 'math', difficulty: 'easy' },
  { id: 'm07', text: '9 \u00D7 9 = 81', answer: true, category: 'math', difficulty: 'easy' },
  { id: 'm08', text: 'Pi equals exactly 3.14', answer: false, category: 'math', difficulty: 'medium' },
  { id: 'm09', text: 'Zero is an even number', answer: true, category: 'math', difficulty: 'tricky' },
  { id: 'm10', text: '15 + 27 = 43', answer: false, category: 'math', difficulty: 'easy' },

  // === GEOGRAPHY ===
  { id: 'geo01', text: 'Australia is a continent', answer: true, category: 'geography', difficulty: 'easy' },
  { id: 'geo02', text: 'Paris is in Germany', answer: false, category: 'geography', difficulty: 'easy' },
  { id: 'geo03', text: 'The Amazon is the longest river in the world', answer: false, category: 'geography', difficulty: 'tricky' },
  { id: 'geo04', text: 'There are 7 continents', answer: true, category: 'geography', difficulty: 'easy' },
  { id: 'geo05', text: 'Mount Everest is the tallest mountain on Earth', answer: true, category: 'geography', difficulty: 'easy' },
  { id: 'geo06', text: 'Africa is a country', answer: false, category: 'geography', difficulty: 'easy' },
  { id: 'geo07', text: 'Japan is in South America', answer: false, category: 'geography', difficulty: 'easy' },
  { id: 'geo08', text: 'Iceland is covered mostly in ice', answer: false, category: 'geography', difficulty: 'tricky' },
  { id: 'geo09', text: 'Russia is the largest country by area', answer: true, category: 'geography', difficulty: 'easy' },
  { id: 'geo10', text: 'The Great Wall of China is visible from space', answer: false, category: 'geography', difficulty: 'tricky' },

  // === SILLY ===
  { id: 'si01', text: 'Clouds are made of cotton candy', answer: false, category: 'silly', difficulty: 'easy' },
  { id: 'si02', text: 'Fish can fly', answer: false, category: 'silly', difficulty: 'easy' },
  { id: 'si03', text: 'Trees can talk to each other underground', answer: true, category: 'silly', difficulty: 'tricky' },
  { id: 'si04', text: 'Unicorns are real animals', answer: false, category: 'silly', difficulty: 'easy' },
  { id: 'si05', text: 'The Moon is made of cheese', answer: false, category: 'silly', difficulty: 'easy' },
  { id: 'si06', text: 'You eat about 8 spiders a year in your sleep', answer: false, category: 'silly', difficulty: 'medium' },
  { id: 'si07', text: 'A jiffy is an actual unit of time', answer: true, category: 'silly', difficulty: 'tricky' },
  { id: 'si08', text: 'Dinosaurs and humans lived at the same time', answer: false, category: 'silly', difficulty: 'easy' },
  { id: 'si09', text: 'You can hear sounds in outer space', answer: false, category: 'silly', difficulty: 'easy' },
  { id: 'si10', text: 'A group of crows is called a murder', answer: true, category: 'silly', difficulty: 'medium' },

  // === EASY (for Kid Mode) ===
  { id: 'e01', text: 'Fire is hot', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e02', text: 'Dogs say meow', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e03', text: 'Bananas are yellow', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e04', text: 'Snow is warm', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e05', text: 'The Sun comes out during the day', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e06', text: 'Fish live in trees', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e07', text: 'Ice cream is cold', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e08', text: 'Cats can bark', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e09', text: 'Water is wet', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e10', text: 'Birds have wings', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e11', text: 'Rocks are soft', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e12', text: 'Apples grow on trees', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e13', text: 'The Moon comes out at night', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e14', text: 'Elephants are tiny', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e15', text: 'Frogs can jump', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e16', text: 'Shoes go on your hands', answer: false, category: 'easy', difficulty: 'easy' },
  { id: 'e17', text: 'Rain falls from the sky', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e18', text: 'Cars have wheels', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e19', text: 'Fish live in water', answer: true, category: 'easy', difficulty: 'easy' },
  { id: 'e20', text: 'Cows can fly', answer: false, category: 'easy', difficulty: 'easy' },
];

/**
 * Shuffle an array in-place using Fisher-Yates and return a new copy.
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Get a random selection of questions, optionally filtering by category and difficulty.
 * Excludes any question IDs provided in the exclude array.
 */
export function getRandomQuestions(
  count: number,
  options?: {
    categories?: string[];
    difficulty?: string[];
    exclude?: string[];
  },
): Question[] {
  let pool = [...questions];

  if (options?.categories && options.categories.length > 0) {
    pool = pool.filter((q) => options.categories!.includes(q.category));
  }

  if (options?.difficulty && options.difficulty.length > 0) {
    pool = pool.filter((q) => options.difficulty!.includes(q.difficulty));
  }

  if (options?.exclude && options.exclude.length > 0) {
    const excludeSet = new Set(options.exclude);
    pool = pool.filter((q) => !excludeSet.has(q.id));
  }

  const shuffled = shuffle(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get easy questions only (for Kid Mode).
 */
export function getEasyQuestions(count: number, exclude?: string[]): Question[] {
  return getRandomQuestions(count, {
    categories: ['easy'],
    difficulty: ['easy'],
    exclude,
  });
}
