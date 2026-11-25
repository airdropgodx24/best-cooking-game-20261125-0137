# Sizzle & Serve

A complete cooking game in the browser: run the kitchen, chop and cook
ingredients, build each dish on the plate, and serve it before the order
timer runs out. Three missed orders ends the shift.

## How to play

- Move with WASD or the arrow keys, or click where to walk. Clicking a
  station walks the chef there and works it on arrival.
- E or Space works the station the chef is standing at.
- Pick up ingredients from the crates on the left. Chop lettuce and tomato on
  the chopping board. Cook patties and pasta on the burners, but do not leave
  them sitting or they burn. Build the dish on the plate, then serve it at
  the serve window when it matches an open order.
- Burger: bun + cooked patty + chopped lettuce.
- Salad: chopped lettuce + chopped tomato.
- Pasta: cooked pasta + sauce.
- Serving quickly earns a time bonus; serving in a row builds a combo. Every
  five dishes served raises the level: orders arrive faster and their timers
  get shorter.

## Run it

Static files only, no build step and no network request:

```
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

## Entry

Built for the make.fun best cooking game bounty (best-cooking-game-20261125-0137).
`main.ts` hands the game in; `screenshots/` holds four renders of the game
itself, staged with `?shot=start|play|rush|end&seed=1`.
