// The screenshot scenes behind ?shot=start|play|rush|end. Each one plays the real rules
// forward from a fresh world for a fixed script of kitchen jobs, so the frame is what a
// short game really looks like and the same seed always gives the same frame.
import { STATIONS } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const STEP = 1 / 60;
const START_SECONDS = 5;
const MAX_SCRIPT_SECONDS = 200;

/** A kitchen job: walk to a station, work it once, then optionally wait in place. */
function job(station, waitSeconds = 0) {
  return { station, waitSeconds, walkOnly: false };
}

/** Walk to an exact floor point and stop there (keeps the plate in full view). */
function standAt(x, y) {
  return { station: null, waitSeconds: 0, walkOnly: true, point: { x, y } };
}

/**
 * The play scene builds a burger and stops with the bun in hand at the plate:
 * a dish mid-assembly, the order board ticking, the timer running.
 */
const PLAY_SCRIPT = [
  job('crateLettuce'),
  job('chop', 1.8),
  job('chop'),
  job('plate'),
  job('cratePatty'),
  job('stove1', 4.2),
  job('stove1'),
  job('plate'),
  job('crateBun'),
  standAt(636, 268),
];

/** The rush scene finishes that burger, serves it if an order matches, and starts a salad. */
const RUSH_SCRIPT = [
  ...PLAY_SCRIPT.slice(0, -1),
  job('plate'),
  job('serve'),
  job('crateTomato'),
  job('chop', 1.8),
  job('chop'),
  job('plate'),
  job('crateLettuce'),
  job('chop', 1.8),
  job('chop'),
  standAt(636, 268),
];

/**
 * Drive the chef through a script of jobs. Each job walks to the station's approach
 * point, works it once (unless it is a walk-only job), then waits out its seconds.
 */
function runScript(world, script) {
  const chef = world.state.chef;
  let elapsed = 0;
  for (const step of script) {
    const target = step.point ?? STATIONS[step.station].approach;
    let arrived = false;
    let spent = 0;
    while (!arrived && spent < 12) {
      const dx = target.x - chef.x;
      const dy = target.y - chef.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 10) {
        arrived = true;
        break;
      }
      const control = { dx: dx / distance, dy: dy / distance, interact: false };
      world.step(STEP, control, false);
      spent += STEP;
      elapsed += STEP;
    }
    if (arrived && !step.walkOnly) {
      world.step(STEP, { dx: 0, dy: 0, interact: true }, false);
      elapsed += STEP;
    }
    let waited = 0;
    while (waited < step.waitSeconds) {
      world.step(STEP, { dx: 0, dy: 0, interact: false }, false);
      waited += STEP;
      elapsed += STEP;
    }
    if (elapsed > MAX_SCRIPT_SECONDS) return;
  }
}

/**
 * Set `world` to the named scene (start, play, rush or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    runScript(world, PLAY_SCRIPT);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'rush') {
    runScript(world, RUSH_SCRIPT);
    return { screen: SCREEN_PLAY, best: world.state.score };
  }
  if (name === 'end') {
    // A chef who never lifts a finger: the orders run out one by one.
    for (let index = 0; index < 170 / STEP; index += 1) {
      world.step(STEP, { dx: 0, dy: 0, interact: false }, false);
      if (world.state.lives <= 0) break;
    }
    return { screen: SCREEN_OVER, best: world.state.score };
  }
  for (let index = 0; index < START_SECONDS / STEP; index += 1) {
    world.step(STEP, { dx: 0, dy: 0, interact: false }, true);
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
