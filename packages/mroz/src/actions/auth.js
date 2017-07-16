import { createAction } from "redux-actions";

export const login = createAction("@@mroz/LOGIN", (token, profile) => ({
  token,
  profile
}));

export const logout = createAction("@@mroz/LOGOUT");
