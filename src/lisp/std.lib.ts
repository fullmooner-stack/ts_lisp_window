import { funcs } from "./functions";

funcs.set("+", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result += args[i];
  return result;
});

funcs.set("-", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result -= args[i];
  return result;
});

funcs.set("*", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result *= args[i];
  return result;
});

funcs.set("/", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result /= args[i];
  return result;
});

funcs.set("%", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result %= args[i];
  return result;
});

funcs.set("^", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result **= args[i];
  return result;
});

funcs.set("XOR", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result ^= args[i];
  return result;
});

funcs.set("AND", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len && result) result &&= args[i];
  return result;
});

funcs.set("OR", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len && !result) result ||= args[i];
  return result;
});

funcs.set("&", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result &= args[i];
  return result;
});

funcs.set("|", function (...args: number[]) {
  const len = args.length;
  let i = 0;
  let result = args[0];
  while (++i < len) result |= args[i];
  return result;
});

funcs.set("max", Math.max);

funcs.set("min", Math.min);
