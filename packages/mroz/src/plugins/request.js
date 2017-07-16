import R from "ramda";
import { combineReducers } from "redux";
import { handleActions } from "redux-actions";
import { ajax as rxAjax } from "rxjs/observable/dom/ajax";

import { addDependencies } from "./observable";
import { addReducers } from "./utils";

import * as actions from "../actions";

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

const reducer = selector =>
  handleActions(
    {
      [actions.request.request]: (state, action) => {
        const id = selector(action);
        const prev = state[id];

        return {
          ...state,
          [id]: {
            isFinished: prev.isFinished ? prev.isFinished : false,
            isPending: true,
            hasError: prev ? prev.hasError : false,
            error: prev ? prev.error : undefined,
            isPolling: action.payload.isPolling,
            queryCount: prev ? prev.queryCount + 1 : 1,
            lastUpdated: prev ? prev.lastUpdated : undefined
          }
        };
      },
      [actions.request.success]: (state, action) => {
        const id = selector(action);
        const prev = state[id];

        return {
          ...state,
          [id]: {
            ...prev,
            isFinished: true,
            isPending: false,
            hasError: false,
            error: undefined,
            lastUpdated: action.payload.time
          }
        };
      },
      [actions.request.fail]: (state, action) => {
        const id = selector(action);
        const prev = state[id];

        return {
          ...state,
          [id]: {
            ...prev,
            isFinished: true,
            isPending: false,
            hasError: true,
            error: action.payload.error
          }
        };
      },
      [actions.request.cancel]: (state, action) => {
        const id = selector(action);
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
    addDependencies({ ajax }),
    addReducers({
      request: combineReducers({
        requestsById: reducer(action => action.payload.id),
        requestsByKey: reducer(action => action.payload.key)
      })
    })
  );
