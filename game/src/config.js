// Sizzle & Serve: the numbers that define the kitchen. Recipes, stations, timing and
// colours all live here so the world, the renderer and the shot scenes agree on them.

export const VIEW = { width: 960, height: 600 };
export const STEP = 1 / 60;
export const BEST_KEY = 'sizzle-and-serve-best';
export const LIVES = 3;
export const SHIFT_SECONDS = 180;

export const CHEF = {
  radius: 20,
  speed: 250,
  // The floor the chef can walk on.
  floor: { x: 128, y: 196, width: 712, height: 392 },
};

// Every station is a rectangle on the counter wall plus the point the chef walks to.
export const STATIONS = {
  crateBun: { label: 'Buns', x: 16, y: 210, width: 96, height: 56, approach: { x: 128, y: 238 } },
  cratePatty: { label: 'Patties', x: 16, y: 278, width: 96, height: 56, approach: { x: 128, y: 306 } },
  crateLettuce: { label: 'Lettuce', x: 16, y: 346, width: 96, height: 56, approach: { x: 128, y: 374 } },
  crateTomato: { label: 'Tomatoes', x: 16, y: 414, width: 96, height: 56, approach: { x: 128, y: 442 } },
  cratePasta: { label: 'Pasta', x: 16, y: 482, width: 96, height: 56, approach: { x: 128, y: 510 } },
  crateSauce: { label: 'Sauce', x: 16, y: 550, width: 96, height: 40, approach: { x: 128, y: 566 } },
  chop: { label: 'Chop', x: 176, y: 116, width: 128, height: 56, approach: { x: 240, y: 200 } },
  stove1: { label: 'Burner 1', x: 336, y: 116, width: 92, height: 56, approach: { x: 382, y: 200 } },
  stove2: { label: 'Burner 2', x: 440, y: 116, width: 92, height: 56, approach: { x: 486, y: 200 } },
  plate: { label: 'Plate', x: 576, y: 116, width: 120, height: 56, approach: { x: 636, y: 200 } },
  serve: { label: 'Serve', x: 856, y: 210, width: 88, height: 96, approach: { x: 836, y: 258 } },
  bin: { label: 'Bin', x: 856, y: 330, width: 88, height: 72, approach: { x: 836, y: 366 } },
};

// Items the chef can carry or place. `prep` says what a raw item becomes and where.
export const ITEMS = {
  bun: { name: 'Bun', kind: 'bun' },
  patty: { name: 'Patty', kind: 'patty', cookSeconds: 3.5, burntSeconds: 4 },
  lettuce: { name: 'Lettuce', kind: 'lettuce', chopSeconds: 1.4 },
  tomato: { name: 'Tomato', kind: 'tomato', chopSeconds: 1.4 },
  pasta: { name: 'Pasta', kind: 'pasta', cookSeconds: 3.5, burntSeconds: 4 },
  sauce: { name: 'Sauce', kind: 'sauce' },
};

// A cooked or chopped item carries its finished name.
export const FINISHED = {
  patty: 'cooked patty',
  lettuce: 'chopped lettuce',
  tomato: 'chopped tomato',
  pasta: 'cooked pasta',
};

export const RECIPES = {
  Burger: ['bun', 'cooked patty', 'chopped lettuce'],
  Salad: ['chopped lettuce', 'chopped tomato'],
  Pasta: ['cooked pasta', 'sauce'],
};
export const RECIPE_NAMES = Object.keys(RECIPES);

export const ORDER = {
  maxOpen: 3,
  firstAfterSeconds: 3,
  spawnEverySeconds: 13,
  timeLimitSeconds: 52,
  timeLimitFloorSeconds: 30,
  timeLimitCutPerLevel: 3,
  serveBasePoints: 100,
  serveTimeBonusMax: 60,
  comboBonus: 25,
};

export const COLOURS = {
  wall: '#f3e3c2',
  floor: '#c98f5f',
  floorTile: '#bd8252',
  counter: '#8a5a33',
  counterTop: '#a9713f',
  board: '#f7f0dd',
  orderTicket: '#fff8e1',
  orderUrgent: '#ffdfdf',
  ink: '#2e2118',
  muted: '#7a5c42',
  chefCoat: '#ffffff',
  chefSkin: '#f2c094',
  chefHat: '#ffffff',
  accent: '#d94f30',
  gold: '#f2b705',
  green: '#4d9b4d',
  red: '#d94f30',
};
