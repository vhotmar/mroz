import createAsyncAction from "./createAsyncAction";

jest.mock("uuid/v4", () => () => "uuid");

describe("createAsyncAction", () => {
  it("should create action creator", () => {
    const actionCreator = createAsyncAction("SAMPLE_ACTION");
    const action = actionCreator();

    expect(action.type).toEqual("SAMPLE_ACTION");
  });

  it("should create action creator which returns meta async id", () => {
    const actionCreator = createAsyncAction("SAMPLE_ACTION");
    const action = actionCreator();

    expect(action.type).toEqual("SAMPLE_ACTION");
    expect(action.meta.async.id).toEqual("uuid");
  });
});
