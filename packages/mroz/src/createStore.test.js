import createStore from "./createStore";

describe("createStore", () => {
  it("should return store", () => {
    const store = createStore({
      reducers: {
        sample: (state = {}) => state
      }
    });

    expect(typeof store.getState).toBe("function");
    expect(typeof store.dispatch).toBe("function");
  });

  it("should apply plugins", () => {
    const plugin = jest.fn(plugin => ({
      ...plugin,
      reducers: { ...plugin.reducers, sample: (state = {}) => state }
    }));

    const store = createStore({
      plugins: [plugin]
    });

    expect(plugin).toHaveBeenCalledTimes(1);
    expect(plugin).toHaveBeenCalledWith({
      enhancers: [],
      hooks: [],
      middleware: [],
      reducers: {}
    });
  });

  it("should call hooks", () => {
    const hook = jest.fn();

    const store = createStore({
      reducers: {
        sample: (state = {}) => state
      },
      hooks: [hook]
    });

    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith(store);
  });
});
