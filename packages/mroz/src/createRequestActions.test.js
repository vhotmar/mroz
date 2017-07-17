import createRequestActions from "./createRequestActions";

jest.mock("uuid/v4", () => () => "uuid");

describe("createRequestActions", () => {
  const actions = createRequestActions("sample");

  it("should return request, succes, fail actionCreator", () => {
    expect(Object.keys(actions)).toEqual(["request", "success", "fail"]);
  });

  it("should return actionCreator with correct toString method", () => {
    expect(actions.request.toString()).toBe("sample/REQUEST");
    expect(actions.success.toString()).toBe("sample/SUCCESS");
    expect(actions.fail.toString()).toBe("sample/FAIL");
  });

  it("should create correct request action creator", () => {
    const actions = createRequestActions("sample", {
      request: [id => ({ id }), (id, data) => ({ id, data })]
    });

    const requestAction = actions.request("id", "data");

    expect(requestAction).toEqual({
      meta: {
        async: { id: "uuid" },
        data: "data",
        id: "id",
        request: { key: "sample.request" }
      },
      payload: { id: "id" },
      type: "sample/REQUEST"
    });
  });

  it("should respect string query key", () => {
    const actions = createRequestActions("sample", { queryKey: "queryKey" });

    expect(actions.request()).toEqual({
      meta: { async: { id: "uuid" }, request: { key: "queryKey" } },
      type: "sample/REQUEST"
    });
  });

  it("should respect function query key", () => {
    const actions = createRequestActions("sample", {
      request: search => ({ search }),
      queryKey: search => `search.${search}`
    });

    expect(actions.request("asdf")).toEqual({
      meta: { async: { id: "uuid" }, request: { key: "search.asdf" } },
      payload: { search: "asdf" },
      type: "sample/REQUEST"
    });
  });
});
