import { async as asyncActions } from "../actions";
import plugin, { reducer } from "./async";

describe("async plugin", () => {
  describe("plugin", () => {
    it("should have correct properties", () => {
      const p = plugin()({});

      expect(p).toHaveProperty("reducers.async");
    });

    it("should contain correct reducer", () => {
      const p = plugin()({});

      expect(
        p.reducers.async(undefined, asyncActions.request("id1"))
      ).toMatchSnapshot();
    });
  });

  describe("reducer", () => {
    it("should handle request action", () => {
      expect(reducer(undefined, asyncActions.request("id1"))).toMatchSnapshot();
    });

    it("should handle success after request", () => {
      const state = [
        asyncActions.request("id1"),
        asyncActions.success("id1", { data: "foo" })
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should handle fail after request", () => {
      const state = [
        asyncActions.request("id1"),
        asyncActions.fail("id1", { error: "foo" })
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should not reset error after new request", () => {
      const state = [
        asyncActions.request("id1"),
        asyncActions.fail("id1", { error: "foo" }),
        asyncActions.request("id1")
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should reset error after new request and success", () => {
      const state = [
        asyncActions.request("id1"),
        asyncActions.fail("id1", { error: "foo" }),
        asyncActions.request("id1"),
        asyncActions.success("id1", { data: "foo" })
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });
  });
});
