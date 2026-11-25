// Sizzle & Serve: the kitchen itself. Orders, the chef, the chopping board, the burners,
// the plate and the serve window all live here, advanced in fixed steps by the main loop
// (or by the shot scenes, which play the same rules forward from a fresh world).
import {
  CHEF, COLOURS, FINISHED, ITEMS, LIVES, ORDER, RECIPES, RECIPE_NAMES, SHIFT_SECONDS, STATIONS,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_MISSED = 2;
export const EVENT_OVER = 4;
export const EVENT_READY = 8;

let orderId = 0;

function emptyBurner() {
  return { item: null, progress: 0, overcook: 0 };
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      time: 0,
      shiftLeft: SHIFT_SECONDS,
      level: 1,
      score: 0,
      served: 0,
      combo: 0,
      lives: LIVES,
      chef: { x: 480, y: 400, carrying: null },
      orders: [],
      plate: [],
      chop: { item: null, progress: 0 },
      burners: [emptyBurner(), emptyBurner()],
      message: '',
      messageUntil: 0,
      shake: 0,
      spawnTimer: ORDER.firstAfterSeconds,
      overReason: '',
    };
  }

  function say(text) {
    state.message = text;
    state.messageUntil = state.time + 2.2;
  }

  function orderTimeLimit() {
    return Math.max(
      ORDER.timeLimitFloorSeconds,
      ORDER.timeLimitSeconds - (state.level - 1) * ORDER.timeLimitCutPerLevel,
    );
  }

  function spawnOrder() {
    const recipe = random.pick(RECIPE_NAMES);
    const limit = orderTimeLimit();
    state.orders.push({ id: orderId += 1, recipe, timeLeft: limit, timeLimit: limit });
  }

  function plateMatches(order) {
    const wanted = [...RECIPES[order.recipe]].sort();
    const have = [...state.plate].sort();
    return wanted.length === have.length && wanted.every((item, index) => item === have[index]);
  }

  function nearestStation() {
    let best = null;
    let bestDistance = 72;
    for (const [name, station] of Object.entries(STATIONS)) {
      const distance = Math.hypot(
        state.chef.x - station.approach.x,
        state.chef.y - station.approach.y,
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        best = name;
      }
    }
    return best;
  }

  function interact(stationName) {
    const chef = state.chef;
    if (stationName === null) return;

    if (stationName.startsWith('crate')) {
      if (chef.carrying !== null) {
        say('Hands full!');
        return;
      }
      const kind = stationName.slice('crate'.length).toLowerCase();
      chef.carrying = kind;
      return;
    }

    if (stationName === 'chop') {
      const board = state.chop;
      if (board.item === null) {
        if (chef.carrying === 'lettuce' || chef.carrying === 'tomato') {
          board.item = chef.carrying;
          board.progress = 0;
          chef.carrying = null;
        } else if (chef.carrying !== null) {
          say('That does not need chopping.');
        }
        return;
      }
      if (board.progress >= 1) {
        if (chef.carrying === null) {
          chef.carrying = FINISHED[board.item];
          board.item = null;
          board.progress = 0;
        } else {
          say('Hands full!');
        }
      }
      return;
    }

    if (stationName === 'stove1' || stationName === 'stove2') {
      const burner = state.burners[stationName === 'stove1' ? 0 : 1];
      if (burner.item === null) {
        if (chef.carrying === 'patty' || chef.carrying === 'pasta') {
          burner.item = chef.carrying;
          burner.progress = 0;
          burner.overcook = 0;
          chef.carrying = null;
        } else if (chef.carrying !== null) {
          say('That does not go on the stove.');
        }
        return;
      }
      if (burner.progress >= 1) {
        if (chef.carrying === null) {
          chef.carrying = burner.item === 'patty' || burner.item === 'pasta'
            ? FINISHED[burner.item]
            : burner.item;
          if (burner.overcook >= 1) chef.carrying = `burnt ${burner.item}`;
          burner.item = null;
          burner.progress = 0;
          burner.overcook = 0;
        } else {
          say('Hands full!');
        }
      }
      return;
    }

    if (stationName === 'plate') {
      if (chef.carrying !== null) {
        if (state.plate.length < 3) {
          state.plate.push(chef.carrying);
          chef.carrying = null;
        } else {
          say('The plate is full.');
        }
      } else if (state.plate.length > 0) {
        chef.carrying = state.plate.pop();
      }
      return;
    }

    if (stationName === 'serve') {
      if (state.plate.length === 0) {
        say('The plate is empty.');
        return;
      }
      const order = state.orders.find((candidate) => plateMatches(candidate));
      if (order === undefined) {
        state.shake = 0.4;
        say('No order wants that dish.');
        return;
      }
      const timeBonus = Math.round((order.timeLeft / order.timeLimit) * ORDER.serveTimeBonusMax);
      const comboBonus = state.combo * ORDER.comboBonus;
      const points = ORDER.serveBasePoints + timeBonus + comboBonus;
      state.score += points;
      state.served += 1;
      state.combo += 1;
      state.level = 1 + Math.floor(state.served / 5);
      state.orders = state.orders.filter((candidate) => candidate !== order);
      state.plate = [];
      say(`Served ${order.recipe}! +${points}`);
      state.lastServe = EVENT_SERVED;
      return;
    }

    if (stationName === 'bin') {
      if (chef.carrying !== null) {
        chef.carrying = null;
        say('Binned it.');
      } else if (state.plate.length > 0) {
        state.plate = [];
        say('Plate cleared.');
      }
      return;
    }
  }

  return {
    state,
    reset() {
      Object.assign(state, freshState());
    },
    /**
     * Advance the kitchen by `dt` seconds. `control` is { dx, dy, interact }.
     * In attract mode the orders sit on the board and nothing is lost.
     * Returns an events bitmask.
     */
    step(dt, control, attract) {
      let events = 0;
      state.time += dt;
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);

      // Move the chef inside the floor.
      const chef = state.chef;
      chef.x = Math.min(
        CHEF.floor.x + CHEF.floor.width,
        Math.max(CHEF.floor.x, chef.x + control.dx * CHEF.speed * dt),
      );
      chef.y = Math.min(
        CHEF.floor.y + CHEF.floor.height,
        Math.max(CHEF.floor.y, chef.y + control.dy * CHEF.speed * dt),
      );

      if (control.interact && !attract) interact(nearestStation());

      // Chopping finishes on its own; the chopped item waits on the board.
      const board = state.chop;
      if (board.item !== null && board.progress < 1) {
        board.progress += dt / ITEMS[board.item].chopSeconds;
        if (board.progress >= 1) {
          board.progress = 1;
          events |= EVENT_READY;
          say(`${FINISHED[board.item]} ready!`);
        }
      }

      // Burners cook on their own, then overcook if left sitting.
      for (const burner of state.burners) {
        if (burner.item === null) continue;
        if (burner.progress < 1) {
          burner.progress += dt / ITEMS[burner.item].cookSeconds;
          if (burner.progress >= 1) {
            burner.progress = 1;
            events |= EVENT_READY;
            say(`${FINISHED[burner.item]} ready!`);
          }
        } else if (burner.overcook < 1) {
          burner.overcook += dt / ITEMS[burner.item].burntSeconds;
          if (burner.overcook >= 1) say('Something burnt!');
        }
      }

      // Orders arrive, count down, and cost a heart when they run out.
      if (!attract) {
        state.shiftLeft -= dt;
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0 && state.orders.length < ORDER.maxOpen) {
          spawnOrder();
          state.spawnTimer = Math.max(8, ORDER.spawnEverySeconds - (state.level - 1));
        }
        for (const order of [...state.orders]) {
          order.timeLeft -= dt;
          if (order.timeLeft <= 0) {
            state.orders = state.orders.filter((candidate) => candidate !== order);
            state.lives -= 1;
            state.combo = 0;
            events |= EVENT_MISSED;
            say(`Missed a ${order.recipe}!`);
          }
        }
        if (state.lastServe === EVENT_SERVED) {
          events |= EVENT_SERVED;
          state.lastServe = 0;
        }
        if (state.lives <= 0) {
          state.overReason = 'hearts';
          events |= EVENT_OVER;
        } else if (state.shiftLeft <= 0) {
          state.overReason = 'shift';
          events |= EVENT_OVER;
        }
      } else {
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0 && state.orders.length < 2) {
          spawnOrder();
          state.spawnTimer = ORDER.spawnEverySeconds;
        }
      }
      return events;
    },
  };
}

// Re-exported for the renderer and shots so they agree on the names.
export { COLOURS, FINISHED, ITEMS, RECIPES, STATIONS };
