import R from "ramda";
import { combineReducers } from "redux";
import { handleActions } from "redux-actions";

import { addReducers } from "./utils";

import { async as actions } from "../actions";

export const reducer = handleActions(
  {
    [actions.request]: (state, action) => {
      const id = action.payload.id;
      const prev = state[id] || {};

      return {
        ...state,
        [id]: {
          isFinished: prev.isFinished ? prev.isFinished : false,
          isPending: true,
          error: prev ? prev.error : undefined,
          data: prev.data
        }
      };
    },
    [actions.success]: (state, action) => {
      const id = action.payload.id;

      return {
        ...state,
        [id]: {
          isFinished: true,
          isPending: false,
          error: undefined,
          data: action.payload.data
        }
      };
    },
    [actions.fail]: (state, action) => {
      const id = action.payload.id;
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
    }
  },
  {}
);

export default () =>
  R.compose(
    addReducers({
      async: combineReducers({
        byId: reducer
      })
    })
  );
