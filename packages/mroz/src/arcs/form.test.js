import form from "./form";
import { Observable } from "rxjs";
import asyncTest, { config } from "../epics/async.test.utils";

describe("form arc", () => {
  it("should dispatch actions", () => {
    const config = form("sample_form");

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

  it("should map errors", () => {
    const error = { data: "error" };
    const errorFunction = jest.fn(() => error);

    asyncTest({
      work: () => Observable.throw("error"),
      config: form("sample_form", errorFunction),
      callback: res => {
        expect(res).toMatchSnapshot();
        expect(errorFunction).toHaveBeenCalledTimes(1);
        expect(errorFunction).toHaveBeenCalledWith("error", config);
      }
    });
  });

  it("should accept function as form name", () => {
    const formFunction = jest.fn(() => "sample_form");

    asyncTest({
      config: form(formFunction),
      callback: res => {
        expect(res).toMatchSnapshot();
        expect(formFunction).toHaveBeenCalledTimes(2); // request, success == 2 times
        expect(formFunction).toHaveBeenCalledWith(config);
      }
    });
  });
});
