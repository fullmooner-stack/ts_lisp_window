import { funcs } from "./functions";
import "./std.lib";

type FN = (..._: any) => any;
type LIST = [FN | string, ...any[]];

funcs.set("defn", function (fn_name: string, fn: FN) {
  funcs.set(fn_name, fn);
});

function getFun(x: any): FN | undefined {
  if (!Array.isArray(x)) return;
  let h = x[0];
  if (Array.isArray(h) && getFun(h)) h = lisp(h);
  if (typeof h === "function") return h;
  if (typeof h === "string" && funcs.has(h)) return funcs.get(h);
}

export function lisp(x: LIST | any) {
  const fn = getFun(x);
  if (fn === undefined) return x;

  const l = x.length;
  let i = 0;
  const r: any[] = []; // result
  while (++i < l) r.push(lisp(x[i]));
  return fn(...r);
}
