export default function promisify(fn) {
  return (...args) => {
    return new Promise((res, rej) =>
      fn(...args, (err, resp) => {
        if (err) rej(err);
        else res(resp);
      })
    );
  };
}
