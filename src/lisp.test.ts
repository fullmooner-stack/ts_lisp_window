import { describe, expect, it } from "vitest";
import { lisp } from "./lisp";

describe("lisp evaluator", () => {
  //
  it("+", () => expect(lisp(["+", 1, 2, 3])).toBe(6));
  it("-", () => expect(lisp(["-", 10, 3, 2])).toBe(5));
  it("*", () => expect(lisp(["*", 2, 3, 4])).toBe(24));
  it("/", () => expect(lisp(["/", 100, 5, 2])).toBe(10));
  it("%", () => expect(lisp(["%", 10, 4])).toBe(2));
  it("^ is power, folded left", () => {
    expect(lisp(["^", 2, 10])).toBe(1024);
    expect(lisp(["^", 2, 3, 2])).toBe(64); // (2**3)**2
  });
  it("XOR", () => expect(lisp(["XOR", 5, 3])).toBe(6));
  it("&", () => expect(lisp(["&", 6, 3])).toBe(2));
  it("|", () => expect(lisp(["|", 4, 1])).toBe(5));
  it("single arg returns itself", () => expect(lisp(["+", 7])).toBe(7));

  describe("AND / OR", () => {
    it("AND returns the last value when all are truthy", () =>
      expect(lisp(["AND", 1, 2, 3])).toBe(3));
    it("AND returns the first falsy value", () => {
      expect(lisp(["AND", 1, 0, 3])).toBe(0);
      expect(lisp(["AND", 0, 5])).toBe(0);
    });
    it("OR returns the first truthy value", () => {
      expect(lisp(["OR", 0, 0, 5])).toBe(5);
      expect(lisp(["OR", 0, 3, 5])).toBe(3);
    });
    it("OR returns the last value when all are falsy", () =>
      expect(lisp(["OR", 0, 0])).toBe(0));
  });
});

describe("nesting", () => {
  it("evaluates nested macro forms", () =>
    expect(lisp(["+", 1, ["*", 2, 3]])).toBe(7));

  it("evaluates deeply nested forms", () =>
    expect(lisp(["+", 1, ["+", 1, ["+", 1, ["+", 1]]]])).toBe(4));

  it("mixes function heads and macro heads", () =>
    expect(lisp(["*", [Math.max, 1, 5], ["-", 10, 7]])).toBe(15));

  it("evaluates args left to right", () => {
    const log: number[] = [];
    const t = (n: number) => (log.push(n), n);
    lisp(["+", [t, 1], [t, 2], [t, 3]]);
    expect(log).toEqual([1, 2, 3]);
  });
});

describe("function heads", () => {
  it("calls the function with evaluated args", () =>
    expect(lisp([Math.max, 1, ["+", 2, 3]])).toBe(5));

  it("works with zero args", () => expect(lisp([() => 42])).toBe(42));

  it("passes data arrays to the function untouched", () =>
    expect(lisp([(a: number[]) => a.length, [1, 2, 3]])).toBe(3));
});

describe("data pass-through", () => {
  it("non-arrays come back as-is", () => {
    const o = { a: 1 };
    expect(lisp(5)).toBe(5);
    expect(lisp("hi")).toBe("hi");
    expect(lisp(null)).toBe(null);
    expect(lisp(undefined)).toBe(undefined);
    expect(lisp(o)).toBe(o);
  });

  it("arrays without a function or macro head come back as-is", () => {
    const a = [1, 2, 3];
    expect(lisp(a)).toBe(a);
    expect(lisp([])).toEqual([]);
    expect(
      lisp([
        [0, 0],
        [5, 5],
      ]),
    ).toEqual([
      [0, 0],
      [5, 5],
    ]);
  });

  it("does not evaluate forms nested inside a data array", () =>
    expect(lisp([1, ["+", 1, 2]])).toEqual([1, ["+", 1, 2]]));

  it("unknown string heads are data", () =>
    expect(lisp(["foo", 1])).toEqual(["foo", 1]));

  it("prototype keys are not treated as macros", () => {
    for (const key of [
      "toString",
      "constructor",
      "hasOwnProperty",
      "__proto__",
    ])
      expect(lisp([key, 1])).toEqual([key, 1]);
  });
});

describe("purity", () => {
  it("does not mutate the input form", () => {
    const form = ["+", 1, ["*", 2, 3]];
    const copy = structuredClone(form);
    lisp(form);
    expect(form).toEqual(copy);
  });

  it("gives the same result when evaluated twice", () => {
    const form = ["+", 1, ["*", 2, 3]];
    expect(lisp(form)).toBe(lisp(form));
  });
});

describe("dispatch table use case", () => {
  enum Direction {
    Right,
    Left,
    Up,
    Down,
  }
  type Pos = [number, number];

  const directionHandlers = [
    ([x, y]: Pos, d: number): Pos => [x + d, y], // Right
    ([x, y]: Pos, d: number): Pos => [x - d, y], // Left
    ([x, y]: Pos, d: number): Pos => [x, y + d], // Up
    ([x, y]: Pos, d: number): Pos => [x, y - d], // Down
  ];

  it("looks up by enum and fires in one expression", () => {
    expect(lisp([directionHandlers[Direction.Right], [0, 0], 5])).toEqual([
      5, 0,
    ]);
    expect(lisp([directionHandlers[Direction.Left], [0, 0], 5])).toEqual([
      -5, 0,
    ]);
    expect(lisp([directionHandlers[Direction.Up], [0, 0], 5])).toEqual([0, 5]);
    expect(lisp([directionHandlers[Direction.Down], [0, 0], 5])).toEqual([
      0, -5,
    ]);
  });

  it("evaluates computed args before dispatch", () =>
    expect(
      lisp([directionHandlers[Direction.Up], [0, 0], ["+", 2, 3]]),
    ).toEqual([0, 5]));

  it("chains handlers by nesting", () =>
    expect(
      lisp([
        directionHandlers[Direction.Up],
        [directionHandlers[Direction.Right], [0, 0], 3],
        4,
      ]),
    ).toEqual([3, 4]));
  //

  it("returns primitive values unchanged", () => {
    expect(lisp(42)).toBe(42);
    expect(lisp("hello")).toBe("hello");
    expect(lisp(null)).toBe(null);
  });

  it("returns an array unchanged when it has no callable head", () => {
    const value = [1, 2, 3];
    expect(lisp(value)).toBe(value);
  });

  it("calls a function in the first position", () => {
    const add = (a: number, b: number) => a + b;

    expect(lisp([add, 2, 3])).toBe(5);
  });

  it("recursively evaluates arguments before calling the function", () => {
    const add = (a: number, b: number) => a + b;
    const multiply = (a: number, b: number) => a * b;

    // (add (multiply 2 3) 4) => 10
    expect(lisp([add, [multiply, 2, 3], 4])).toBe(10);
  });

  it("recursively evaluates multiple nested arguments", () => {
    const add = (a: number, b: number) => a + b;
    const multiply = (a: number, b: number) => a * b;

    // (add (multiply 2 3) (add 4 5)) => 15
    expect(lisp([add, [multiply, 2, 3], [add, 4, 5]])).toBe(15);
  });

  it("passes all evaluated arguments to the function", () => {
    const collect = (...args: unknown[]) => args;

    expect(lisp([collect, [1], 2, [3]])).toEqual([[1], 2, [3]]);
  });

  it("supports a function selected from a lookup table", () => {
    const handlers = [
      (speed: number) => speed + 1,
      (speed: number) => speed + 2,
      (speed: number) => speed + 3,
      (speed: number) => speed + 4,
    ];

    const direction = 2;

    expect(lisp([handlers[direction], 10])).toBe(13);
  });

  it("supports a lookup expression as the function position", () => {
    const handlers = [
      (speed: number) => speed + 1,
      (speed: number) => speed + 2,
      (speed: number) => speed + 3,
      (speed: number) => speed + 4,
    ];
    const getHandler = (direction: number) => handlers[direction];
    expect(lisp([[getHandler, 2], 10])).toBe(13);
  });

  it("computed head returns a function", () =>
    expect(lisp([[() => Math.max], 1, 5])).toBe(5));

  it("computed head returns a macro key", () =>
    expect(lisp([[() => "+"], 1, 2])).toBe(3));

  it("nested data arrays still pass through", () =>
    expect(
      lisp([
        [0, 0],
        [5, 5],
      ]),
    ).toEqual([
      [0, 0],
      [5, 5],
    ]));
});
