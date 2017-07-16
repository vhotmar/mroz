import async from "./async";
import { Observable } from "rxjs";
import asyncTest from "../epics/async.test.utils";

describe("async arc", () => {
  it("should dispatch actions", () => {
    const config = async();

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
