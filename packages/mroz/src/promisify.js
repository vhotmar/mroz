export default function promisify(fn) {
  return (...args) => {
    return new Promise((res, rej) => {
      let called = false;

      fn(...args, (err, resp) => {
        if (called) return;

        called = true;

        if (err) rej(err);
        else res(resp);
      });
    });
  };
}
