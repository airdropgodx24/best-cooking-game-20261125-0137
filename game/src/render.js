// Sizzle & Serve: everything the player sees. The kitchen, the stations, the chef, the
// order board and the HUD are all drawn as canvas vector art — no image assets, no
// network — so the game is a handful of static files and nothing else.
import { CHEF, COLOURS, STATIONS, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

/** Draw one ingredient or finished dish piece, centred at (x, y), about `size` wide. */
export function drawItem(ctx, item, x, y, size) {
  const s = size / 40;
  ctx.save();
  ctx.translate(x, y);
  if (item === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, 2 * s, 16 * s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98a35';
    ctx.fillRect(-16 * s, 2 * s, 32 * s, 6 * s);
    ctx.fillStyle = '#fff2cf';
    for (const dot of [[-8, -6], [0, -10], [8, -6]]) {
      ellipse(ctx, dot[0] * s, dot[1] * s, 2 * s, 1.4 * s);
      ctx.fill();
    }
  } else if (item === 'patty' || item === 'cooked patty' || item === 'burnt patty') {
    ctx.fillStyle = item === 'patty' ? '#c96f4a' : item === 'cooked patty' ? '#7a4a26' : '#2b1a12';
    roundRect(ctx, -17 * s, -7 * s, 34 * s, 14 * s, 6 * s);
    ctx.fill();
    if (item === 'cooked patty') {
      ctx.strokeStyle = '#4a2c14';
      ctx.lineWidth = 2 * s;
      for (const offset of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.moveTo(offset * s, -6 * s);
        ctx.lineTo(offset * s, 6 * s);
        ctx.stroke();
      }
    }
  } else if (item === 'lettuce' || item === 'chopped lettuce') {
    ctx.fillStyle = '#5da85d';
    if (item === 'lettuce') {
      for (const offset of [-10, 0, 10]) {
        ellipse(ctx, offset * s, 0, 9 * s, 12 * s);
        ctx.fill();
      }
      ctx.fillStyle = '#7cc47c';
      ellipse(ctx, 0, -2 * s, 7 * s, 9 * s);
      ctx.fill();
    } else {
      ctx.fillStyle = '#69b869';
      for (const [dx, dy] of [[-10, -4], [0, 4], [10, -4], [-4, -8], [5, 8]]) {
        roundRect(ctx, dx * s - 6 * s, dy * s - 2.5 * s, 12 * s, 5 * s, 2 * s);
        ctx.fill();
      }
    }
  } else if (item === 'tomato' || item === 'chopped tomato') {
    if (item === 'tomato') {
      ctx.fillStyle = '#d9382b';
      ellipse(ctx, 0, 0, 15 * s, 14 * s);
      ctx.fill();
      ctx.fillStyle = '#3f8f3f';
      ctx.beginPath();
      ctx.moveTo(0, -12 * s);
      ctx.lineTo(-6 * s, -4 * s);
      ctx.lineTo(0, -7 * s);
      ctx.lineTo(6 * s, -4 * s);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#d9382b';
      for (const angle of [0, 1.05, 2.1, 3.15, 4.2, 5.25]) {
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 13 * s, -0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#f2a09a';
      ellipse(ctx, -3 * s, -3 * s, 4 * s, 3 * s);
      ctx.fill();
    }
  } else if (item === 'pasta' || item === 'cooked pasta' || item === 'burnt pasta') {
    ctx.strokeStyle = item === 'burnt pasta' ? '#33241a' : item === 'cooked pasta' ? '#f2c14e' : '#e8b93c';
    ctx.lineWidth = 4 * s;
    ctx.lineCap = 'round';
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      const wave = index * 7 - 7;
      ctx.moveTo(-14 * s, wave * s);
      ctx.bezierCurveTo(-7 * s, (wave - 5) * s, 0, (wave + 5) * s, 7 * s, wave * s);
      ctx.bezierCurveTo(11 * s, (wave - 3) * s, 13 * s, (wave + 2) * s, 14 * s, wave * s);
      ctx.stroke();
    }
    if (item === 'cooked pasta') {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2 * s;
      for (const dx of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.moveTo(dx * s, -14 * s);
        ctx.quadraticCurveTo((dx + 3) * s, -20 * s, dx * s, -25 * s);
        ctx.stroke();
      }
    }
  } else if (item === 'sauce') {
    ctx.fillStyle = '#b02818';
    roundRect(ctx, -7 * s, -12 * s, 14 * s, 24 * s, 4 * s);
    ctx.fill();
    ctx.fillStyle = '#8a1c10';
    ctx.fillRect(-4 * s, -18 * s, 8 * s, 7 * s);
    ctx.fillStyle = '#fff8e1';
    ctx.fillRect(-7 * s, -4 * s, 14 * s, 9 * s);
    ctx.fillStyle = '#b02818';
    ctx.font = `bold ${9 * s}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 0, 1 * s);
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#d9382b' : 'rgba(255,255,255,0.35)';
  ctx.fill();
  ctx.restore();
}

function drawChef(ctx, chef, carrying) {
  const x = chef.x;
  const y = chef.y;
  ctx.save();
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ellipse(ctx, x, y + 18, 20, 7);
  ctx.fill();
  // Body and apron.
  ctx.fillStyle = COLOURS.chefCoat;
  roundRect(ctx, x - 16, y - 6, 32, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#7fb3d5';
  roundRect(ctx, x - 11, y + 2, 22, 16, 5);
  ctx.fill();
  // Head and hat.
  ctx.fillStyle = COLOURS.chefSkin;
  ellipse(ctx, x, y - 16, 13, 12);
  ctx.fill();
  ctx.fillStyle = COLOURS.chefHat;
  ctx.fillRect(x - 12, y - 30, 24, 7);
  ellipse(ctx, x - 7, y - 31, 7, 7);
  ctx.fill();
  ellipse(ctx, x + 7, y - 31, 7, 7);
  ctx.fill();
  ellipse(ctx, x, y - 35, 8, 7);
  ctx.fill();
  // Eyes.
  ctx.fillStyle = '#2e2118';
  ellipse(ctx, x - 5, y - 17, 1.8, 2.4);
  ctx.fill();
  ellipse(ctx, x + 5, y - 17, 1.8, 2.4);
  ctx.fill();
  // Carried item floats above the hat.
  if (carrying !== null) {
    ctx.fillStyle = 'rgba(255,248,225,0.95)';
    ellipse(ctx, x, y - 52, 22, 18);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawItem(ctx, carrying, x, y - 52, 26);
  }
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawStationLabel(text, x, y) {
    ctx.fillStyle = COLOURS.ink;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function drawProgressRing(x, y, radius, fraction, colour) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
    ctx.stroke();
  }

  function drawOrders(state) {
    const ticketWidth = 150;
    const ticketHeight = 84;
    const gap = 10;
    const total = state.orders.length * ticketWidth + (state.orders.length - 1) * gap;
    let x = (VIEW.width - total) / 2;
    for (const order of state.orders) {
      const urgent = order.timeLeft < 12;
      ctx.fillStyle = urgent ? COLOURS.orderUrgent : COLOURS.orderTicket;
      roundRect(ctx, x, 10, ticketWidth, ticketHeight, 10);
      ctx.fill();
      ctx.strokeStyle = '#d8c08a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = COLOURS.ink;
      ctx.font = 'bold 17px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(order.recipe, x + 10, 28);
      // Ingredient dots: the finished pieces the dish needs.
      const needs = {
        Burger: ['bun', 'cooked patty', 'chopped lettuce'],
        Salad: ['chopped lettuce', 'chopped tomato'],
        Pasta: ['cooked pasta', 'sauce'],
      }[order.recipe];
      needs.forEach((item, index) => {
        drawItem(ctx, item, x + 24 + index * 34, 56, 24);
      });
      // Countdown bar.
      const fraction = Math.max(0, order.timeLeft / order.timeLimit);
      ctx.fillStyle = '#e5d3ae';
      roundRect(ctx, x + 10, 76, ticketWidth - 20, 8, 4);
      ctx.fill();
      ctx.fillStyle = fraction > 0.5 ? COLOURS.green : fraction > 0.25 ? COLOURS.gold : COLOURS.red;
      roundRect(ctx, x + 10, 76, (ticketWidth - 20) * fraction, 8, 4);
      ctx.fill();
      x += ticketWidth + gap;
    }
  }

  function drawStations(state) {
    // Counters along the top wall.
    for (const name of ['chop', 'stove1', 'stove2', 'plate']) {
      const station = STATIONS[name];
      ctx.fillStyle = COLOURS.counter;
      roundRect(ctx, station.x, station.y, station.width, station.height, 8);
      ctx.fill();
      ctx.fillStyle = COLOURS.counterTop;
      roundRect(ctx, station.x + 4, station.y + 4, station.width - 8, 14, 5);
      ctx.fill();
    }
    // Chopping board: pale board, the item being chopped, its progress.
    const chop = STATIONS.chop;
    ctx.fillStyle = '#e8dcc0';
    roundRect(ctx, chop.x + 14, chop.y + 24, chop.width - 28, 26, 6);
    ctx.fill();
    if (state.chop.item !== null) {
      drawItem(ctx, state.chop.progress >= 1 ? { lettuce: 'chopped lettuce', tomato: 'chopped tomato' }[state.chop.item] : state.chop.item, chop.x + chop.width / 2, chop.y + 37, 26);
      if (state.chop.progress < 1) {
        ctx.fillStyle = '#e5d3ae';
        roundRect(ctx, chop.x + 18, chop.y + 44, chop.width - 36, 5, 2);
        ctx.fill();
        ctx.fillStyle = COLOURS.green;
        roundRect(ctx, chop.x + 18, chop.y + 44, (chop.width - 36) * state.chop.progress, 5, 2);
        ctx.fill();
      }
    }
    drawStationLabel('Chop', chop.x + chop.width / 2, chop.y + chop.height + 12);
    // Burners: dark cooktop, the pan, the progress ring.
    state.burners.forEach((burner, index) => {
      const station = STATIONS[index === 0 ? 'stove1' : 'stove2'];
      const centreX = station.x + station.width / 2;
      const centreY = station.y + 28;
      ctx.fillStyle = '#3a3a3f';
      ellipse(ctx, centreX, centreY, 30, 13);
      ctx.fill();
      if (burner.item !== null) {
        ctx.fillStyle = '#55555c';
        ellipse(ctx, centreX, centreY - 2, 24, 10);
        ctx.fill();
        const shown = burner.overcook >= 1 ? `burnt ${burner.item}` : burner.progress >= 1 ? { patty: 'cooked patty', pasta: 'cooked pasta' }[burner.item] : burner.item;
        drawItem(ctx, shown, centreX, centreY - 4, 26);
        const fraction = burner.progress < 1 ? burner.progress : 1 - burner.overcook;
        drawProgressRing(centreX, centreY - 2, 30, Math.max(0, fraction), burner.progress < 1 ? COLOURS.gold : COLOURS.red);
      }
      drawStationLabel(`Burner ${index + 1}`, centreX, station.y + station.height + 12);
    });
    // Assembly plate: white plate with what is on it, and a shake when a serve misses.
    const plate = STATIONS.plate;
    const shakeX = state.shake > 0 ? Math.sin(state.time * 40) * 4 * state.shake : 0;
    ctx.fillStyle = '#ffffff';
    ellipse(ctx, plate.x + plate.width / 2 + shakeX, plate.y + 34, 52, 16);
    ctx.fill();
    ctx.strokeStyle = '#d8d8d8';
    ctx.lineWidth = 2;
    ctx.stroke();
    state.plate.forEach((item, index) => {
      drawItem(ctx, item, plate.x + 34 + index * 26, plate.y + 30, 24);
    });
    drawStationLabel('Plate', plate.x + plate.width / 2, plate.y + plate.height + 12);
    // Ingredient crates down the left wall.
    for (const [name, station] of Object.entries(STATIONS)) {
      if (!name.startsWith('crate')) continue;
      const kind = name.slice('crate'.length).toLowerCase();
      ctx.fillStyle = '#7a4a26';
      roundRect(ctx, station.x, station.y, station.width, station.height, 8);
      ctx.fill();
      ctx.fillStyle = '#8f5a30';
      roundRect(ctx, station.x + 4, station.y + 4, station.width - 8, station.height - 8, 6);
      ctx.fill();
      drawItem(ctx, kind, station.x + station.width / 2, station.y + station.height / 2 - 6, 30);
      drawStationLabel(station.label, station.x + station.width / 2, station.y + station.height - 8);
    }
    // Serve window and bin on the right wall.
    const serve = STATIONS.serve;
    ctx.fillStyle = '#5a3a22';
    roundRect(ctx, serve.x, serve.y, serve.width, serve.height, 8);
    ctx.fill();
    ctx.fillStyle = '#2e2118';
    roundRect(ctx, serve.x + 8, serve.y + 8, serve.width - 16, 52, 6);
    ctx.fill();
    ctx.fillStyle = COLOURS.gold;
    ellipse(ctx, serve.x + serve.width / 2, serve.y + 34, 12, 8);
    ctx.fill();
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(serve.x + serve.width / 2 - 2, serve.y + 40, 4, 8);
    drawStationLabel('Serve', serve.x + serve.width / 2, serve.y + serve.height - 8);
    const bin = STATIONS.bin;
    ctx.fillStyle = '#6b7280';
    roundRect(ctx, bin.x, bin.y, bin.width, bin.height, 8);
    ctx.fill();
    ctx.fillStyle = '#4b5563';
    roundRect(ctx, bin.x + 6, bin.y + 6, bin.width - 12, 12, 4);
    ctx.fill();
    drawStationLabel('Bin', bin.x + bin.width / 2, bin.y + bin.height - 8);
  }

  function drawHud(state, best) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`Score ${state.score}`, 16, 24);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`Served ${state.served}  ·  Level ${state.level}  ·  Best ${best}`, 16, 48);
    // Shift timer bar.
    const shiftFraction = Math.max(0, state.shiftLeft / 180);
    const minutes = Math.floor(Math.max(0, state.shiftLeft) / 60);
    const seconds = Math.floor(Math.max(0, state.shiftLeft) % 60);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, 16, 60, 180, 9, 4);
    ctx.fill();
    ctx.fillStyle = shiftFraction > 0.25 ? COLOURS.gold : COLOURS.red;
    roundRect(ctx, 16, 60, 180 * shiftFraction, 9, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(`Shift ${minutes}:${String(seconds).padStart(2, '0')}`, 204, 65);
    // Hearts, top right.
    for (let index = 0; index < 3; index += 1) {
      drawHeart(ctx, VIEW.width - 28 - index * 34, 26, 22, index < state.lives);
    }
    if (state.combo >= 2) {
      ctx.fillStyle = COLOURS.gold;
      ctx.font = 'bold 17px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Combo x${state.combo}`, VIEW.width - 16, 56);
    }
    // Toast message along the bottom.
    if (state.message !== '' && state.time < state.messageUntil) {
      ctx.font = 'bold 17px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const width = ctx.measureText(state.message).width + 28;
      ctx.fillStyle = 'rgba(46,33,24,0.85)';
      roundRect(ctx, (VIEW.width - width) / 2, 566, width, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#fff8e1';
      ctx.fillText(state.message, VIEW.width / 2, 581);
    }
  }

  function drawOverlay(title, lines, best) {
    ctx.fillStyle = 'rgba(36,26,18,0.72)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff8e1';
    ctx.font = 'bold 54px system-ui, sans-serif';
    ctx.fillText(title, VIEW.width / 2, 210);
    ctx.font = '19px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,248,225,0.92)';
    lines.forEach((line, index) => {
      ctx.fillText(line, VIEW.width / 2, 268 + index * 30);
    });
    if (best > 0) {
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillStyle = COLOURS.gold;
      ctx.fillText(`Best score: ${best}`, VIEW.width / 2, 268 + lines.length * 30 + 12);
    }
  }

  return {
    draw(state, screen, best) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const scale = Math.min(width / VIEW.width, height / VIEW.height);
      const offsetX = (width - VIEW.width * scale) / 2;
      const offsetY = (height - VIEW.height * scale) / 2;
      ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
      ctx.fillStyle = COLOURS.wall;
      ctx.fillRect(-offsetX / scale, -offsetY / scale, width / scale, height / scale);
      // Floor tiles.
      ctx.fillStyle = COLOURS.floor;
      ctx.fillRect(CHEF.floor.x, CHEF.floor.y, CHEF.floor.width, CHEF.floor.height);
      ctx.fillStyle = COLOURS.floorTile;
      for (let x = CHEF.floor.x; x < CHEF.floor.x + CHEF.floor.width; x += 56) {
        for (let y = CHEF.floor.y; y < CHEF.floor.y + CHEF.floor.height; y += 56) {
          if (((x - CHEF.floor.x) / 56 + (y - CHEF.floor.y) / 56) % 2 === 0) {
            ctx.fillRect(x, y, 56, 56);
          }
        }
      }
      // A worn rug in the middle of the floor, where the chef does most of the walking.
      ctx.fillStyle = '#a34a2e';
      roundRect(ctx, 330, 330, 300, 130, 14);
      ctx.fill();
      ctx.strokeStyle = '#e8b93c';
      ctx.lineWidth = 4;
      roundRect(ctx, 342, 342, 276, 106, 10);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(232,185,60,0.5)';
      ctx.lineWidth = 2;
      roundRect(ctx, 354, 354, 252, 82, 8);
      ctx.stroke();
      // Counter wall band behind the top stations.
      ctx.fillStyle = COLOURS.counter;
      ctx.fillRect(128, 108, 712, 72);
      ctx.fillStyle = COLOURS.counterTop;
      ctx.fillRect(128, 108, 712, 10);

      drawOrders(state);
      drawStations(state);
      drawChef(ctx, state.chef, state.chef.carrying);
      drawHud(state, best);

      if (screen === SCREEN_TITLE) {
        drawOverlay('SIZZLE & SERVE', [
          'Run the kitchen. Chop, cook, build the dish, serve it in time.',
          'Move with WASD or arrows, or click where to walk. E or Space works a station.',
          'Burger: bun + cooked patty + chopped lettuce.  Salad: chopped lettuce + chopped tomato.',
          'Pasta: cooked pasta + sauce.  Three missed orders ends the shift.',
          'Press Space or click to start.',
        ], best);
      } else if (screen === SCREEN_PAUSED) {
        drawOverlay('PAUSED', ['Press P or Space to keep cooking.'], 0);
      } else if (screen === SCREEN_OVER) {
        const reason = state.overReason === 'hearts'
          ? 'Three orders missed. The kitchen closes.'
          : 'Shift complete. Service is over.';
        drawOverlay('SERVICE OVER', [
          reason,
          `Score ${state.score}  ·  Dishes served ${state.served}  ·  Level ${state.level}`,
          'Press Space or click to cook again.',
        ], best);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
  };
}
