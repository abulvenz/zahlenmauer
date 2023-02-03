import m from "mithril";
import tagl from "tagl-mithril";

const { p, h1, table, tr, td, input, button } = tagl(m);
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
const sumsum = (N) =>
  range(N)
    .map((e) => e + 1)
    .reduce((acc, v) => acc + v, 0);
const countUndefined = (arr) => arr.filter((e) => e === undefined).length;
const solvable = (arr) => arr.length === 3 && countUndefined(arr) === 1;

const wall = (values = [], depth = dreieckszahl(values.length), cnt = 0) =>
  range(depth).map((row) =>
    range(row + 1).map((col) => ({
      init: values[cnt],
      value: values[cnt],
      idx: cnt++,
    }))
  );

const randomIndices = (N, MAX) => {
  const result = [];
  while (result.length !== N) {
    const next = randomInt(MAX);
    if (result.findIndex((e) => e === next) < 0) result.push(next);
  }
  return result;
};

const mask = (N, arr) =>
  use(randomIndices(N, arr.length), (inn) =>
    arr.map((e, i) => (inn.findIndex((ind) => ind === i) < 0 ? undefined : e))
  );

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

const solve = (theWall) => {
  while (traverse(theWall, (a, b, c) => solveEquation(a, b, c)).some((e) => e));

  return traverse(
    theWall,
    (a, b, c) =>
      a.value !== undefined && b.value !== undefined && c.value !== undefined
  ).every((e) => e === true);
};

const randomWall = (depth) => {
  const solvableStart = [
    ...range(sumsum(depth - 1)).map((e) => undefined),
    ...range(depth).map((e) => randomInt(4)),
  ];

  const solvedWall = wall(solvableStart);
  solve(solvedWall);

  const arr = solvedWall.flatMap((e) => e).map((e) => e.value);
  let masked = [];

  while (!solve(wall((masked = mask(depth, arr)))))
    console.log("And I tried, yeah I tried!");

  return wall(masked);
};

let size = 3;
let theWall = randomWall(size);

const inputC = (vnode) => ({
  view: (vnode) =>
    input.input({
      type: "number",
      disabled: vnode.attrs.disabled,
      onchange: (e) => vnode.attrs.onchange(+e.target.value),
    }),
});

const check = (top, left, right) =>
  top === undefined ||
  left === undefined ||
  right === undefined ||
  top === left + right;

const checkWall = (wall) =>
  use(
    wall.map((row) => row.map((col) => col.value)),
    (values) =>
      values.every(
        (row, ridx) =>
          ridx === values.length - 1 ||
          row.every((value, cidx) =>
            check(value, values[ridx + 1][cidx], values[ridx + 1][cidx + 1])
          )
      )
  );

const complete = (wall) =>
  use(
    wall.flatMap((e) => e).map((e) => e.value),
    (values) => values.every((e) => e !== undefined)
  );

let count = +localStorage.getItem("correctlySolved") || 0;
let showSchnickSchnack = true;

const increaseCount = () => {
  count = count + 1;
  localStorage.setItem("correctlySolved", count);
  return true;
};

m.mount(document.body, {
  view: (vnode) =>
    use(complete(theWall) && checkWall(theWall), (isSolved) => [
      h1(
        { onclick: (e) => (showSchnickSchnack = !showSchnickSchnack) },
        "Zahlenmauer"
      ),
      table[isSolved ? "solved" : ""][checkWall(theWall) ? "correct" : "wrong"](
        theWall.map((row, ridx) =>
          tr(
            { key: count + "" + ridx },
            range(theWall.length - ridx).map((e) => td.empty()),
            row.map((field, cidx) => [
              td.number(
                field.init === undefined
                  ? m(inputC, {
                      key: count + "" + ridx + "" + cidx,
                      disabled: isSolved,
                      value: field.value,
                      onchange: (e) => (field.value = e),
                    })
                  : field.value !== undefined
                  ? field.value
                  : "-"
              ),
              td.empty(),
            ])
          )
        )
      ),
      isSolved
        ? button(
            { onclick: () => increaseCount() && (theWall = randomWall(size)) },
            "Neu"
          )
        : null,
      showSchnickSchnack
        ? [
            button({ onclick: (e) => (size = max(3, size - 1)) }, "<"),
            " " + size + " ",
            button({ onclick: (e) => (size = min(10, size + 1)) }, ">"),
            count ? "Richtige: " + count : null,
            p(
              "Die Aufgabe ist es in jedem Feld die Summe der beiden darunter liegenden Felder einzutragen. Wenn alles richtig ist wird die ganze Mauer grün! Sobald ein Feld falsch eingetragen ist, färbt sich der Rahmen rot. Wenn du dich besser auf die Aufgabe konzentrieren möchtest, kannst du auf die Überschrift drücken. Los geht's!"
            ),
          ]
        : null,
    ]),
});
