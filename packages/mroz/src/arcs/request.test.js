import request from "./request";
import { Observable } from "rxjs";
import { asyncTest, REQUEST_TYPE } from "../epics/async.test.utils";

const state = (r = {}) => ({
  request: {
    requestsByKey: r
  }
});

describe("actions arc", () => {
  const constantDate = new Date("2017-06-13T04:41:20");
  let _now;
  const t = {
    config: request({ refetchTimeout: 2000 }),
    getState: () => state(),
    work: () =>
      Observable.of({
        response: { data: "foo" }
      }),
    action: {
      type: REQUEST_TYPE,
      meta: {
        request: {
          key: "sample.request"
        }
      }
    }
  };

  beforeAll(() => {
    _now = Date.now;

    /*eslint no-global-assign:off*/
    Date.now = () => Number(constantDate);
  });

  afterAll(() => {
    Date.now = _now;
  });

  it("should dispatch actions", () => {
    asyncTest({
      ...t,
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();

    asyncTest({
      ...t,
      work: () => Observable.throw("error"),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();
  });

  it("should filter out pending request", () => {
    asyncTest({
      ...t,
      getState: () =>
        state({
          "sample.request": {
            isPending: true
          }
        }),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();
  });

  it("should force request", () => {
    const dispatchFunction = jest.fn();

    asyncTest({
      ...t,
      action: {
        type: REQUEST_TYPE,
        meta: {
          request: {
            key: "sample.request",
            force: true
          }
        }
      },
      getState: () =>
        state({
          "sample.request": {
            id: "1234",
            key: "sample.request",
            isPending: true
          }
        }),
      dispatch: dispatchFunction,
      callback: res => {
        expect(res).toMatchSnapshot();
        expect(dispatchFunction).toHaveBeenCalledTimes(1);
        expect(dispatchFunction).toHaveBeenCalledWith({
          payload: { key: "sample.request" },
          type: "@@mrot/REQUEST_CANCEL"
        });
      }
    }).exec();
  });

  it("should refetch request if passed refetchTimeout", () => {
    asyncTest({
      ...t,
      getState: () =>
        state({
          "sample.request": {
            latestUpdate: Number(constantDate) - 3000
          }
        }),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();
  });

  it("should not refetch request if refetchTimeout have not passed", () => {
    asyncTest({
      ...t,
      getState: () =>
        state({
          "sample.request": {
            latestUpdate: Number(constantDate) - 1000
          }
        }),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();
  });
});
