// Keyboard and mouse input for the kitchen. Keys steer the chef; a click sets somewhere
// to walk to (a station click walks to its counter and works it on arrival). The world
// reads this through a plain control object, so the shot autopilot can drive the same way.
import { STATIONS, VIEW } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_INTERACT = 2;
export const ACTION_PAUSE = 4;

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

function stationAt(point) {
  for (const [name, station] of Object.entries(STATIONS)) {
    const pad = 14;
    if (
      point.x >= station.x - pad && point.x <= station.x + station.width + pad &&
      point.y >= station.y - pad && point.y <= station.y + station.height + pad
    ) {
      return name;
    }
  }
  return null;
}

export function createInput(canvas) {
  const held = new Set();
  let actions = 0;
  let click = null;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / VIEW.width, rect.height / VIEW.height);
    const offsetX = (rect.width - VIEW.width * scale) / 2;
    const offsetY = (rect.height - VIEW.height * scale) / 2;
    return {
      x: (event.clientX - rect.left - offsetX) / scale,
      y: (event.clientY - rect.top - offsetY) / scale,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.code in KEY_DIRECTIONS) {
      held.add(event.code);
      event.preventDefault();
      return;
    }
    if (event.code === 'Space' || event.code === 'Enter') {
      actions |= ACTION_CONFIRM | ACTION_INTERACT;
      event.preventDefault();
    } else if (event.code === 'KeyE') {
      actions |= ACTION_INTERACT;
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      actions |= ACTION_PAUSE;
    }
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(event);
    const station = stationAt(point);
    click = station
      ? { x: STATIONS[station].approach.x, y: STATIONS[station].approach.y, station }
      : { x: point.x, y: point.y, station: null };
    actions |= ACTION_CONFIRM;
  });

  return {
    /** The held movement keys as a unit vector (zero when nothing is held). */
    direction() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        x += KEY_DIRECTIONS[code].x;
        y += KEY_DIRECTIONS[code].y;
      }
      if (x === 0 && y === 0) return { x: 0, y: 0 };
      const length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    },
    /** Actions pressed since the last call; reading them clears them. */
    takeActions() {
      const found = actions;
      actions = 0;
      return found;
    },
    /** The current click-to-walk target, if the player clicked somewhere. */
    clickTarget() {
      return click;
    },
    clearClickTarget() {
      click = null;
    },
  };
}
