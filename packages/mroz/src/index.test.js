import * as imports from "./index";

describe("index", () => {
  it("should export", () => {
    expect(Object.keys(imports)).toEqual([
      "createStore",
      "createAsyncActions",
      "createAsyncAction",
      "createRequestActions",
      "wrapAction",
      "promisify",
      "epics",
      "arcs",
      "plugins",
      "actions",
      "selectors"
    ]);
  });
});
