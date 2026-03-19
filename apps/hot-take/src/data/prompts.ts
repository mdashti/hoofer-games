export type Prompt = {
  id: string;
  text: string;
  category: string;
};

export const prompts: Prompt[] = [
  // ── Food ──────────────────────────────────────────────────────
  { id: 'food-01', text: 'Pineapple on pizza is a masterpiece.', category: 'Food' },
  { id: 'food-02', text: 'Ketchup on eggs is totally normal.', category: 'Food' },
  { id: 'food-03', text: 'Cereal is a soup.', category: 'Food' },
  { id: 'food-04', text: 'A hot dog IS a sandwich.', category: 'Food' },
  { id: 'food-05', text: 'Crunchy peanut butter is superior to creamy.', category: 'Food' },
  { id: 'food-06', text: 'Breakfast for dinner is better than dinner for dinner.', category: 'Food' },
  { id: 'food-07', text: 'Ranch goes with everything.', category: 'Food' },
  { id: 'food-08', text: 'Boneless wings are just chicken nuggets.', category: 'Food' },
  { id: 'food-09', text: 'Well-done steak is perfectly acceptable.', category: 'Food' },
  { id: 'food-10', text: 'Candy corn is actually delicious.', category: 'Food' },
  { id: 'food-11', text: 'Water is the best drink and it is not even close.', category: 'Food' },
  { id: 'food-12', text: 'Oatmeal raisin cookies are better than chocolate chip.', category: 'Food' },

  // ── Life ──────────────────────────────────────────────────────
  { id: 'life-01', text: 'Monday is actually the best day of the week.', category: 'Life' },
  { id: 'life-02', text: 'Socks with sandals is a power move.', category: 'Life' },
  { id: 'life-03', text: 'Napping is better than sleeping in.', category: 'Life' },
  { id: 'life-04', text: 'Making your bed every morning is a waste of time.', category: 'Life' },
  { id: 'life-05', text: 'Adults should still be allowed to trick-or-treat.', category: 'Life' },
  { id: 'life-06', text: 'It is better to be early than exactly on time.', category: 'Life' },
  { id: 'life-07', text: 'Cold showers are superior to hot showers.', category: 'Life' },
  { id: 'life-08', text: 'Texting is better than phone calls.', category: 'Life' },
  { id: 'life-09', text: 'Working from home is overrated.', category: 'Life' },
  { id: 'life-10', text: 'Homework should not exist.', category: 'Life' },
  { id: 'life-11', text: 'Morning people have life figured out.', category: 'Life' },
  { id: 'life-12', text: 'Everyone should learn to cook before they move out.', category: 'Life' },

  // ── Entertainment ─────────────────────────────────────────────
  { id: 'ent-01', text: 'The book is NOT always better than the movie.', category: 'Entertainment' },
  { id: 'ent-02', text: 'Sequels are usually better than originals.', category: 'Entertainment' },
  { id: 'ent-03', text: 'Cartoons are better than live action.', category: 'Entertainment' },
  { id: 'ent-04', text: 'Spoilers do not actually ruin a movie.', category: 'Entertainment' },
  { id: 'ent-05', text: 'Video games are a better form of entertainment than movies.', category: 'Entertainment' },
  { id: 'ent-06', text: 'Reality TV is genuinely entertaining.', category: 'Entertainment' },
  { id: 'ent-07', text: 'Watching a movie at home is better than in a theater.', category: 'Entertainment' },
  { id: 'ent-08', text: 'Old music was better than today\'s music.', category: 'Entertainment' },
  { id: 'ent-09', text: 'Subtitles should always be on.', category: 'Entertainment' },
  { id: 'ent-10', text: 'Board games are more fun than video games.', category: 'Entertainment' },

  // ── Hot Debates ───────────────────────────────────────────────
  { id: 'hot-01', text: 'Toilet paper should go OVER, not under.', category: 'Hot Debates' },
  { id: 'hot-02', text: 'Water is wet.', category: 'Hot Debates' },
  { id: 'hot-03', text: 'GIF is pronounced with a hard G.', category: 'Hot Debates' },
  { id: 'hot-04', text: 'Aliens definitely exist somewhere in the universe.', category: 'Hot Debates' },
  { id: 'hot-05', text: 'The chicken came before the egg.', category: 'Hot Debates' },
  { id: 'hot-06', text: 'Math is the most important school subject.', category: 'Hot Debates' },
  { id: 'hot-07', text: 'Cats are better pets than dogs.', category: 'Hot Debates' },
  { id: 'hot-08', text: 'It is okay to recline your seat on an airplane.', category: 'Hot Debates' },
  { id: 'hot-09', text: 'People who back into parking spots are showing off.', category: 'Hot Debates' },
  { id: 'hot-10', text: 'The middle seat on a plane gets BOTH armrests.', category: 'Hot Debates' },

  // ── Disney / Theme Park ───────────────────────────────────────
  { id: 'disney-01', text: 'Churros are the best theme park snack.', category: 'Theme Park' },
  { id: 'disney-02', text: 'The last row of a roller coaster is the best seat.', category: 'Theme Park' },
  { id: 'disney-03', text: 'Waiting in line is half the fun.', category: 'Theme Park' },
  { id: 'disney-04', text: 'Water rides are only fun if you get soaked.', category: 'Theme Park' },
  { id: 'disney-05', text: 'Theme park food is worth the price.', category: 'Theme Park' },
  { id: 'disney-06', text: 'Matching outfits at a theme park are adorable, not cringe.', category: 'Theme Park' },
  { id: 'disney-07', text: 'The gift shop is the best part of a ride.', category: 'Theme Park' },
  { id: 'disney-08', text: 'You should always ride the biggest coaster first.', category: 'Theme Park' },
  { id: 'disney-09', text: 'Character meet-and-greets are worth the wait.', category: 'Theme Park' },
  { id: 'disney-10', text: 'Nighttime shows are better than daytime parades.', category: 'Theme Park' },

  // ── Would You Rather (opinion form) ──────────────────────────
  { id: 'wyr-01', text: 'Living without music is worse than living without movies.', category: 'Would You Rather' },
  { id: 'wyr-02', text: 'Being too hot is better than being too cold.', category: 'Would You Rather' },
  { id: 'wyr-03', text: 'Having the power of flight is better than being invisible.', category: 'Would You Rather' },
  { id: 'wyr-04', text: 'Being famous would be more of a curse than a blessing.', category: 'Would You Rather' },
  { id: 'wyr-05', text: 'It is better to be the funniest person in the room than the smartest.', category: 'Would You Rather' },
  { id: 'wyr-06', text: 'Living in the city is better than living in the countryside.', category: 'Would You Rather' },
  { id: 'wyr-07', text: 'Having unlimited money is better than unlimited time.', category: 'Would You Rather' },
  { id: 'wyr-08', text: 'Knowing the future would make life worse, not better.', category: 'Would You Rather' },
  { id: 'wyr-09', text: 'A vacation at the beach beats a vacation in the mountains.', category: 'Would You Rather' },
  { id: 'wyr-10', text: 'Being able to talk to animals would be the best superpower.', category: 'Would You Rather' },
];

/**
 * Returns `count` random prompts, excluding any with IDs in the `exclude` set.
 * Uses Fisher-Yates partial shuffle so we never repeat within a game session.
 */
export const getRandomPrompts = (
  count: number,
  exclude: string[] = [],
): Prompt[] => {
  const excludeSet = new Set(exclude);
  const pool = prompts.filter((p) => !excludeSet.has(p.id));

  // Fisher-Yates partial shuffle — pick `count` from the pool
  const shuffled = [...pool];
  const results: Prompt[] = [];
  const n = Math.min(count, shuffled.length);

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    results.push(shuffled[i]);
  }

  return results;
};
