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
          key: id,
          isFinished: prev.isFinished ? prev.isFinished : false,
          isPending: true,
          error: prev ? prev.error : undefined,
          isPolling: action.payload.isPolling,
          queryCount: prev.queryCount ? prev.queryCáount + 1 : 1,
          lastUpdated: prev.lastUpdated,
          data: prev.data
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
          isFinished: true,
          isPending: false,
          error: undefined,
          lastUpdated: action.payload.time,
          data: action.payload.data
        }
      };
    },
    [actions.fail]: (state, action) => {
      const id = action.payload.key;
      const prev = state[id];

      return {
        ...state,
        [id]: {
          ...prev,
          isFinished: true,
          isPending: false,
          error: action.payload.error
        }
      };
    },
    [actions.cancel]: (state, action) => {
      const id = action.payload.key;
      const prev = state[id];

      return {
        ...state,
        [id]: {
          ...prev,
          isFinished: true,
          isPending: false
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
        requestsByKey: reducer
      })
    })
  );
