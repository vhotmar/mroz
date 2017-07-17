import { request as requestActions } from "../actions";
import plugin, { reducer, ajax } from "./request";

describe("request plugin", () => {
  const constantDate = new Date("2017-06-13T04:41:20");
  let _now;

  beforeAll(() => {
    _now = Date.now;

    /*eslint no-global-assign:off*/
    Date.now = () => Number(constantDate);
  });

  afterAll(() => {
    Date.now = _now;
  });

  describe("plugin", () => {
    it("should have correct properties", () => {
      const p = plugin()({});

      expect(p).toHaveProperty("meta.dependencies.ajax");
      expect(p).toHaveProperty("reducers.request");
    });

    it("should contain correct reducer", () => {
      const p = plugin()({});

      expect(
        p.reducers.request(undefined, requestActions.request("id1", "key1"))
      ).toMatchSnapshot();
    });
  });

  describe("reducer", () => {
    it("should handle request action", () => {
      expect(
        reducer(undefined, requestActions.request("id1", "key1"))
      ).toMatchSnapshot();
    });

    it("should handle success after request", () => {
      const state = [
        requestActions.request("id1", "key1"),
        requestActions.success("id1", "key1", { data: "foo" })
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should handle cancel after request", () => {
      const state = [
        requestActions.request("id1", "key1"),
        requestActions.cancel("key1")
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should handle fail after request", () => {
      const state = [
        requestActions.request("id1", "key1"),
        requestActions.fail("id1", "key1", { error: "foo" })
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should not reset error after new request", () => {
      const state = [
        requestActions.request("id1", "key1"),
        requestActions.fail("id1", "key1", { error: "foo" }),
        requestActions.request("id1", "key1")
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });

    it("should reset error after new request and success", () => {
      const state = [
        requestActions.request("id1", "key1"),
        requestActions.fail("id1", "key1", { error: "foo" }),
        requestActions.request("id1", "key1"),
        requestActions.success("id1", "key1", { data: "foo" })
      ].reduce((p, i) => reducer(p, i), undefined);

      expect(state).toMatchSnapshot();
    });
  });
});
