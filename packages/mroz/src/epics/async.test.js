import R from "ramda";
import { Observable } from "rxjs";
import { ActionsObservable } from "redux-observable";
import plugin, {
  addRequest,
  addSuccess,
  addFail,
  addFilter,
  addWrapper,
  addNormalize
} from "./async";

describe("async epic", () => {
  describe("addRequest", () => {
    it("adds request to empty async configuration and passes arguments", () => {
      const data = { foo: "baar" };
      const config = { bar: "baz" };
      const mockedFn = jest.fn(() => Observable.of(data));

      addRequest(mockedFn)({}).request(config).toArray().subscribe(output => {
        expect(mockedFn).toHaveBeenCalledTimes(1);
        expect(mockedFn).toHaveBeenCalledWith(config);
        expect(output).toEqual([data]);
      });
    });

    it("adds request to existing async configuration", () => {
      const data1 = { bar: "baz" };
      const data2 = { foo: "baar" };
      const mockedFn = jest.fn(() => Observable.of(data2));

      addRequest(mockedFn)({
        request: () => Observable.of(data1)
      })
        .request()
        .toArray()
        .subscribe(output => {
          expect(mockedFn).toHaveBeenCalledTimes(1);
          expect(output).toEqual([data1, data2]);
        });
    });

    it("works with undefined types", () => {
      addRequest()().request().toArray().subscribe(output => {
        expect(output).toEqual([]);
      });
    });
  });

  describe("addSuccess", () => {
    it("adds success to empty async configuration and passes arguments", () => {
      const data = { foo: "baar" };
      const config = { bar: "baz" };
      const mockedFn = jest.fn();

      mockedFn.mockReturnValue(Observable.of(data));

      addSuccess(mockedFn)({}).success(config).toArray().subscribe(output => {
        expect(mockedFn).toHaveBeenCalledTimes(1);
        expect(mockedFn).toHaveBeenCalledWith(config);
        expect(output).toEqual([data]);
      });
    });
  });

  describe("addFail", () => {
    it("adds fail to empty async configuration and passes arguments", () => {
      const data = { foo: "baar" };
      const config = { bar: "baz" };
      const mockedFn = jest.fn();

      mockedFn.mockReturnValue(Observable.of(data));

      addFail(mockedFn)({}).fail(config).toArray().subscribe(output => {
        expect(mockedFn).toHaveBeenCalledTimes(1);
        expect(mockedFn).toHaveBeenCalledWith(config);
        expect(output).toEqual([data]);
      });
    });
  });

  describe("addFilter", () => {
    it("adds filter to empty async configuration and passes arguments", () => {
      addFilter((stream, modulo) => stream.filter(x => x % modulo === 0))({})
        .filter(Observable.of(1, 2, 3, 4), 2)
        .toArray()
        .subscribe(output => {
          expect(output).toEqual([2, 4]);
        });
    });

    it("adds filter to existing async configuration", () => {
      addFilter(stream => stream.filter(x => x % 2 === 0))({
        filter: stream => stream.filter(x => x % 3 === 0)
      })
        .filter(Observable.range(0, 13))
        .toArray()
        .subscribe(output => {
          expect(output).toEqual([0, 6, 12]);
        });
    });

    it("adds filter with undefined parameters", () => {
      addFilter()().filter(Observable.of(1, 2)).toArray().subscribe(output => {
        expect(output).toEqual([1, 2]);
      });
    });
  });

  describe("addWrapper", () => {
    it("adds wrapper to empty async configuration and passes arguments", () => {
      addWrapper(stream => stream.filter(x => x % 2 === 0))({})
        .wrapper(Observable.of(1, 2, 3))
        .toArray()
        .subscribe(output => {
          expect(output).toEqual([2]);
        });
    });
  });

  describe("addNormalize", () => {
    it("adds normalize to empty async configuration and passes arguments", () => {
      const result = addNormalize(data => data + 1)({}).normalize(5);

      expect(result).toBe(6);
    });
  });

  it("returns function", () => {
    expect(typeof plugin("sample", () => Observable.of(1), {})).toBe(
      "function"
    );
  });

  describe("epic", () => {
    const REQUEST_TYPE = "request_type";
    const action = { type: REQUEST_TYPE };
    const action$ = ActionsObservable.of(action);
    const id = "uuid";
    const deps = { async: { uuid: () => id } };

    const data = { data: "foo" };

    it("calls work function when request_action is dispatched", () => {
      const workFunction = jest.fn();
      workFunction.mockReturnValue(Observable.of(data));
      const epic = plugin(REQUEST_TYPE, workFunction, {});

      epic(action$, null, deps).toArray().subscribe(res => {
        expect(workFunction).toHaveBeenCalledTimes(1);
        expect(workFunction).toHaveBeenCalledWith({
          action,
          action$,
          deps,
          id,
          store: null
        });
        expect(res).toMatchSnapshot();
      });
    });

    it("does not call work function on random actions", () => {
      const action$ = ActionsObservable.of({ type: "foo_bar" });
      const workFunction = jest.fn();
      const epic = plugin(REQUEST_TYPE, workFunction, {});

      epic(action$, null, deps).toArray().subscribe(res => {
        expect(workFunction).toHaveBeenCalledTimes(0);
        expect(res).toEqual([]);
      });
    });

    it("runs with configuration (complex case)", () => {
      const action$ = new ActionsObservable(
        Observable.range(1, 4).map(i => ({ type: REQUEST_TYPE, data: i }))
      );

      const workFunction = jest.fn(({ action: { data } }) =>
        Observable.of(data)
      );

      const successFunction = jest.fn(data =>
        Observable.of({ type: "success_type", data })
      );

      const success2Function = jest.fn(data =>
        Observable.of({ type: "success_type_2", data })
      );

      const requestFunction = jest.fn();
      requestFunction.mockReturnValue(Observable.of({ type: "request_type" }));

      const filterFunction = jest.fn(stream =>
        stream.filter(({ data }) => data % 2 === 0)
      );

      const normalizeFunction = jest.fn(data => data + 1);

      const epic = plugin(
        REQUEST_TYPE,
        workFunction,
        R.compose(
          addSuccess(successFunction),
          addRequest(requestFunction),
          addFilter(filterFunction),
          addNormalize(normalizeFunction),
          addSuccess(success2Function)
        )
      );

      epic(action$, null, deps).toArray().subscribe(res => {
        expect(workFunction).toHaveBeenCalledTimes(2);
        expect(successFunction).toHaveBeenCalledTimes(2);
        expect(successFunction).toHaveBeenCalledWith(3, {
          action: { type: "request_type", data: 2 },
          action$,
          deps,
          id,
          store: null
        });
        expect(successFunction).toHaveBeenCalledWith(5, {
          action: { type: "request_type", data: 4 },
          action$,
          deps,
          id,
          store: null
        });
        expect(success2Function).toHaveBeenCalledTimes(2);
        expect(filterFunction).toHaveBeenCalledTimes(1);
        expect(normalizeFunction).toHaveBeenCalledTimes(2);
        expect(normalizeFunction).toHaveBeenCalledWith(2, {
          action: { type: "request_type", data: 2 },
          action$,
          deps,
          id,
          store: null
        });

        expect(res).toMatchSnapshot();
      });
    });

    it("fails when work fails", () => {
      const workFunction = jest.fn(() => Observable.throw("error"));
      const failFunction = jest.fn(() => Observable.of({ type: "error_type" }));
      const epic = plugin(REQUEST_TYPE, workFunction, { fail: failFunction });

      epic(action$, null, deps).toArray().subscribe(res => {
        expect(workFunction).toHaveBeenCalledTimes(1);
        expect(failFunction).toHaveBeenCalledTimes(1);
        expect(failFunction).toHaveBeenCalledWith("error", {
          action,
          action$,
          deps,
          id,
          store: null
        });

        expect(res).toMatchSnapshot();
      });
    });

    it("propagates id", () => {
      const id = "sampleid";
      const action$ = ActionsObservable.of({
        type: REQUEST_TYPE,
        meta: { async: { id } }
      });
      const workFunction = jest.fn(() => Observable.of(1));
      const successFunction = jest.fn(() =>
        Observable.of({ type: "success_type" })
      );
      const epic = plugin(REQUEST_TYPE, workFunction, {
        success: successFunction
      });

      epic(action$, null, deps).toArray().subscribe(res => {
        expect(workFunction).toHaveBeenCalledTimes(1);
        expect(successFunction).toHaveBeenCalledTimes(1);

        expect(res).toMatchSnapshot();
      });
    });
  });
});
