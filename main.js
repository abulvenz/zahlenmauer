import m from "mithril";
import tagl from "tagl-mithril";
import t from "./tr";

// prettier-ignore
const { div, p, h1, table, tr, td, input, button, select, option, hr, br, a, label,} = tagl(m);
const { trunc, random, sqrt, min, max } = Math;

const range = (N) => {
  const r = [];
  for (let i = 0; i < N; i++) {
    r.push(i);
  }
  return r;
};

const randomInt = (N) => trunc(random() * N);
const dreieckszahl = (theta) => trunc((sqrt(8 * theta + 1) - 1) / 2);
const use = (v, fn) => fn(v);

const gauss = (N) => (N * (N + 1)) / 2;
const countUndefined = (arr) => arr.filter((e) => e === undefined).length;
const solvable = (arr) => arr.length === 3 && countUndefined(arr) === 1;

/**
 * Creates a wall as doubly nested array starting at the top.
 * Each field receives its initial value from the supplied values array.
 */
const wall = (values = [], depth = dreieckszahl(values.length), cnt = 0) =>
  range(depth).map((row) =>
    range(row + 1).map(() => ({
      init: values[cnt],
      value: values[cnt],
      idx: cnt++,
    }))
  );

/**
 * Returns an array with N unique values that are smaller than MAX.
 */
const randomIndices = (N, MAX) => {
  const result = [];
  while (result.length !== N) {
    const next = randomInt(MAX);
    if (result.findIndex((e) => e === next) < 0) result.push(next);
  }
  return result;
};

/**
 * Returns a copy of the supplied array but all fields
 * except N are set to undefined.
 */
const randomlyMask = (N, arr) =>
  use(randomIndices(N, arr.length), (rndIdxes) =>
    arr.map((element, index) =>
      rndIdxes.findIndex((rndIdx) => rndIdx === index) < 0 ? undefined : element
    )
  );

/**
 * Maps a wall to all its equations and calls
 * tripleCB on the fields belonging to the equation.
 * Returns all equations mapped by tripleCB to an array.
 */
const traverse = (wall, tripleCB, results = []) => {
  wall.forEach((row, ridx) =>
    ridx < wall.length - 1
      ? row.forEach((col, cidx) =>
          results.push(
            tripleCB(col, wall[ridx + 1][cidx], wall[ridx + 1][cidx + 1])
          )
        )
      : null
  );
  return results;
};

/**
 * Given the values a,b,c solves the equation for the last unknown.
 * Returns true when solved.
 */
const solveEquation = (a, b, c) => {
  if (solvable([a.value, b.value, c.value])) {
    if (a.value === undefined) {
      a.value = b.value + c.value;
    }
    if (b.value === undefined) {
      b.value = a.value - c.value;
    }
    if (c.value === undefined) {
      c.value = a.value - b.value;
    }
    return true;
  }
  return false;
};

/**
 * True when all fields in the wall are filled.
 * Not necessarily correctly filled.
 */
const isComplete = (wall) =>
  use(
    wall.flatMap((e) => e).map((e) => e.value),
    (values) => values.every((e) => e !== undefined)
  );

/**
 * Iteratively solves all solvable equations in the given wall.
 * Returns if the resulting wall is completely filled.
 */
const solveWall = (theWall) => {
  while (traverse(theWall, (a, b, c) => solveEquation(a, b, c)).some((e) => e));
  return isComplete(theWall);
};

const createRandomWall = (depth, onlyAddition = false, baseMaxValue = 4) => {
  const solvableStart = [
    ...range(gauss(depth - 1)).map((e) => undefined),
    ...range(depth).map((e) => randomInt(baseMaxValue)),
  ];

  const solvedWall = wall(solvableStart);
  if (onlyAddition) return solvedWall;

  solveWall(solvedWall);

  const arr = solvedWall.flatMap((e) => e).map((e) => e.value);
  let masked = [];

  while (!solveWall(wall((masked = randomlyMask(depth, arr)))));
  return wall(masked);
};

/**
 * When an equation has all its variables defined
 * check if the sum of left and right equals top.
 * An incomplete equation is always correct.
 */
const checkEquation = (top, left, right) =>
  top === undefined ||
  left === undefined ||
  right === undefined ||
  top === left + right;

/**
 * Check all equations on the wall.
 * True when all solved equations are correct.
 * False when at least one is incorrect.
 */
const checkWall = (wall) =>
  traverse(wall, (top, left, right) =>
    checkEquation(top.value, left.value, right.value)
  ).every((e) => e);

/**
 * Application state
 */

const maxHeight = 10;

const state = {
  correctlySolved: +localStorage.getItem("correctlySolved") || 0,
  showSchnickSchnack: true,
  language: t.currentLanguage(),
  wallHeight: 3,
  onlyAddition: false,
  currentWall: null,
};

state.currentWall = createRandomWall(state.wallHeight, state.onlyAddition);

const increaseCount = () => {
  state.correctlySolved = state.correctlySolved + 1;
  localStorage.setItem("correctlySolved", state.correctlySolved);
  return true;
};

const inputComponent = (vnode) => ({
  view: (vnode) =>
    input.input({
      type: "number",
      value: vnode.attrs.field.value,
      disabled: vnode.attrs.disabled,
      onchange: (e) => vnode.attrs.onchange(+e.target.value),
    }),
});

const halfNeeded = (N, ridx) => (N + ridx) % 2 === 0;
const fullNeeded = (N, ridx) => trunc((N - ridx - 1) / 2);

m.mount(document.body, {
  view: (vnode) =>
    use(
      isComplete(state.currentWall) && checkWall(state.currentWall),
      (isSolved) => [
        h1(
          {
            onclick: (e) =>
              (state.showSchnickSchnack = !state.showSchnickSchnack),
          },
          t("Zahlenmauer")
        ),
        state.showSchnickSchnack
          ? [
              t("Größe") + ": ",
              button(
                {
                  onclick: (e) => {
                    state.wallHeight = max(3, state.wallHeight - 1);
                    state.currentWall = createRandomWall(
                      state.wallHeight,
                      state.onlyAddition
                    );
                  },
                },
                "<"
              ),
              " " + state.wallHeight + " ",
              button(
                {
                  onclick: (e) => {
                    state.wallHeight = min(maxHeight, state.wallHeight + 1);
                    state.currentWall = createRandomWall(
                      state.wallHeight,
                      state.onlyAddition
                    );
                  },
                },
                ">"
              ),
            ]
          : null,
        br(),

        table[isSolved ? "solved" : ""][
          checkWall(state.currentWall) ? "correct" : "wrong"
        ](
          { cellspacing: 0 },
          state.currentWall.map((r, ridx) =>
            tr(
              halfNeeded(state.currentWall.length, ridx)
                ? td.half.wall.empty({ colspan: 1 })
                : null,
              range(fullNeeded(state.currentWall.length, ridx)).map((c, cidx) =>
                td.full.wall.empty({ colspan: 2 })
              ),
              r.map((field, cidx) =>
                td.full.wall.number(
                  { colspan: 2 },
                  field.init === undefined
                    ? m(inputComponent, {
                        key: state.correctlySolved + "" + ridx + "" + cidx,
                        disabled: isSolved,
                        field,
                        onchange: (e) => (field.value = e),
                      })
                    : field.value !== undefined
                    ? field.value
                    : "-"
                )
              ),
              range(fullNeeded(state.currentWall.length, ridx)).map((c, cidx) =>
                td.full.wall.empty({ colspan: 2 })
              ),

              halfNeeded(state.currentWall.length, ridx)
                ? td.half.wall.empty({ colspan: 1 })
                : null
            )
          ),
          tr(range(state.currentWall.length * 2).map((e) => td({ colspan: 1 })))
        ),
        isSolved
          ? [
              button(
                {
                  onclick: () =>
                    increaseCount() &&
                    (state.currentWall = createRandomWall(
                      state.wallHeight,
                      state.onlyAddition
                    )),
                },
                t("Neu")
              ),
              " ",
            ]
          : null,
        state.showSchnickSchnack
          ? [
              state.correctlySolved
                ? " " + t("Richtige") + ": " + state.correctlySolved
                : null,
              br(),
              label(
                input({
                  type: "checkbox",
                  checked: state.onlyAddition,
                  oninput: (e) => (state.onlyAddition = e.target.checked),
                }),
                tr("Nur Addition")
              ),
              p(t("Instructions")),
              select(
                {
                  value: state.language,
                  oninput: (e) => {
                    state.language = e.target.value;
                    t.setLanguage(e.target.value);
                  },
                },
                t.getLanguages().map((c) => option(c))
              ),
              hr(),
              div(
                t("Impressum1"),
                a(
                  { href: "https://github.com/abulvenz/zahlenmauer" },
                  "github"
                ),
                t("Impressum2")
              ),
            ]
          : null,
      ]
    ),
});
