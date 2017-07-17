import promisify from "./promisify";

describe("promisify", () => {
  it("should return promise", () => {
    const fn = promisify(cb => cb());

    expect(typeof fn().then).toBe("function");
  });

  it("should do nothing when called more than 1 time", () => {
    const err = new Error();
    const stack = err.stack;

    const fn = promisify(cb => {
      cb(null);
      cb(err);
    });

    const delay = timeout =>
      promisify(cb => {
        setTimeout(() => cb(), timeout);
      })();

    return fn().then(() =>
      delay(1).then(() => {
        expect(stack).toBe(err.stack);
      })
    );
  });

  it("should reject with proper reason", () => {
    const fn = promisify(cb => cb("error"));

    return fn().catch(error => {
      expect(error).toBe("error");
    });
  });
});
