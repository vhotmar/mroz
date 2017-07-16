import R from "ramda";
import { handleActions } from "redux-actions";

import { ajax } from "./request";
import { addDependencies } from "./observable";
import { addHeaders } from "./request";
import { addReducers } from "./utils";

import * as selectors from "../selectors";
import * as actions from "../actions";

export function authAjax(state) {
  return (properties = {}) =>
    ajax(
      addHeaders({
        Authorization: `Bearer ${selectors.auth.token(state)}`
      })(properties)
    );
}

export default () =>
  R.compose(
    addReducers({
      auth: handleActions(
        {
          [actions.auth.login]: (state, { payload: { token, profile } }) => ({
            authenticated: true,
            token,
            profile
          }),
          [actions.auth.logout]: () => ({ authenticated: false })
        },
        { authenticated: false }
      )
    }),
    addDependencies({ authAjax })
  );
