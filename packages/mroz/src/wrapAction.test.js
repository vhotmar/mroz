import { createAction } from "redux-actions";
import wrapAction from "./wrapAction";

describe("wrapAction", () => {
  const original = createAction("SAMPLE_ACTION");
  const wrapped = wrapAction(original, x => ({ ...x, meta: { foo: "bar" } }));

  it("should wrap action creator and preserve toString", () => {
    expect(original.toString).toBe(wrapped.toString);
  });

  it("should map action with defined function", () => {
    const action = wrapped();

    expect(action.type).toBe("SAMPLE_ACTION");
    expect(action.meta.foo).toBe("bar");
  });
});
