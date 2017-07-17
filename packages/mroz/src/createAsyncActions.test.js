import createAsyncActions from "./createAsyncActions";

jest.mock("uuid/v4", () => () => "uuid");

describe("createAsyncActions", () => {
  const actions = createAsyncActions("sample");

  it("should return request, succes, fail actionCreator", () => {
    expect(Object.keys(actions)).toEqual(["request", "success", "fail"]);
  });

  it("should return actionCreator with correct toString method", () => {
    expect(actions.request.toString()).toBe("sample/REQUEST");
    expect(actions.success.toString()).toBe("sample/SUCCESS");
    expect(actions.fail.toString()).toBe("sample/FAIL");
  });

  it("should pass functions to createAction", () => {
    const actions = createAsyncActions("sample", {
      request: [id => ({ id }), (id, data) => ({ id, data })],
      success: id => ({ id })
    });

    const requestAction = actions.request("id", "data");
    const successAction = actions.success("id");

    expect(requestAction).toEqual({
      meta: { async: { id: "uuid" }, data: "data", id: "id" },
      payload: { id: "id" },
      type: "sample/REQUEST"
    });
    expect(successAction).toEqual({
      payload: { id: "id" },
      type: "sample/SUCCESS"
    });
  });
});
