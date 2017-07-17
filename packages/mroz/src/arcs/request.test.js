import request from "./request";
import { Observable } from "rxjs";
import { asyncTest, REQUEST_TYPE } from "../epics/async.test.utils";

const state = (r = {}, a = {}) => ({
  request: {
    byKey: r
  },
  async: {
    byId: a
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
        state(
          {
            "sample.request": {
              id: "id1"
            }
          },
          {
            id1: {
              isPending: true
            }
          }
        ),
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
        state(
          {
            "sample.request": {
              id: "1234"
            }
          },
          {
            "1234": {
              isPending: true
            }
          }
        ),
      dispatch: dispatchFunction,
      callback: res => {
        expect(res).toMatchSnapshot();
        expect(dispatchFunction).toHaveBeenCalledTimes(1);
        expect(dispatchFunction).toHaveBeenCalledWith({
          payload: { id: "1234" },
          type: "@@mrot/REQUEST_CANCEL"
        });
      }
    }).exec();
  });

  it("should refetch request if passed refetchTimeout", () => {
    asyncTest({
      ...t,
      getState: () =>
        state(
          {
            "sample.request": {
              id: "id1",
              latestUpdate: Number(constantDate) - 3000
            }
          },
          {
            id1: {}
          }
        ),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();
  });

  it("should not refetch request if refetchTimeout have not passed", () => {
    asyncTest({
      ...t,
      getState: () =>
        state(
          {
            "sample.request": {
              id: "id1",
              latestUpdate: Number(constantDate) - 1000
            }
          },
          {
            id1: {}
          }
        ),
      callback: res => {
        expect(res).toMatchSnapshot();
      }
    }).exec();
  });
});
