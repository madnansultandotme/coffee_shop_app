export function generateOrderNumber() {
  const ts = Date.now().toString().slice(-6);
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `CF${ts}${rnd}`;
}