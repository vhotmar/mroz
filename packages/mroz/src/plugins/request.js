import R from "ramda";
import { combineReducers } from "redux";
import { handleActions } from "redux-actions";
import { ajax as rxAjax } from "rxjs/observable/dom/ajax";

import { addDependencies } from "./observable";
import { addReducers } from "./utils";

import { request as actions } from "../actions";

export const addHeaders = headers => properties =>
  R.over(R.lensProp("headers"), R.merge(properties.headers), headers);

export function ajax(properties) {
  return rxAjax(
    addHeaders({
      "Content-Type": "application/json",
      Accept: "application/json"
    })(properties)
  );
}

export const reducer = handleActions(
  {
    [actions.request]: (state, action) => {
      const id = action.payload.key;
      const prev = state[id] || {};

      return {
        ...state,
        [id]: {
          id: action.payload.id,
          isPolling: action.payload.isPolling,
          queryCount: prev.queryCount ? prev.queryCount + 1 : 1,
          lastUpdated: prev.lastUpdated
        }
      };
    },
    [actions.success]: (state, action) => {
      const id = action.payload.key;
      const prev = state[id];

      return {
        ...state,
        [id]: {
          ...prev,
          lastUpdated: action.payload.time
        }
      };
    }
  },
  {}
);

export default () =>
  R.compose(
    addDependencies({ ajax: rxAjax }),
    addReducers({
      request: combineReducers({
        byKey: reducer
      })
    })
  );
