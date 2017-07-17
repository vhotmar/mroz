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
      "connectAsync",
      "connectRequest",
      "epics",
      "arcs",
      "plugins",
      "actions",
      "selectors"
    ]);
  });
});
