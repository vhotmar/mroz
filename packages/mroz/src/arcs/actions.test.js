import actions from "./actions";
import { Observable } from "rxjs";
import asyncTest from "../epics/async.test.utils";

describe("actions arc", () => {
  it("should dispatch present actions", () => {
    asyncTest({
      config: actions(() => ({ type: "actions_request" })),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    });

    asyncTest({
      config: actions(undefined, () => ({ type: "actions_success" })),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    });

    asyncTest({
      work: () => Observable.throw("error"),
      config: actions(undefined, undefined, () => ({ type: "actions_fail" })),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    });
  });

  it("should dispatch all actions", () => {
    const config = actions(
      () => ({ type: "actions_request" }),
      () => ({ type: "actions_success" }),
      () => ({ type: "actions_fail" })
    );

    asyncTest({
      config,
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    });

    asyncTest({
      work: () => Observable.throw("error"),
      config,
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    });
  });
});
