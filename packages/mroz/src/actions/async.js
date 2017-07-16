import { createAction } from "redux-actions";

export const request = createAction("@@mroz/ASYNC_REQUEST", id => ({
  id
}));

export const success = createAction("@@mroz/ASYNC_SUCCESS", (id, data) => ({
  id,
  data
}));

export const fail = createAction("@@mroz/ASYNC_FAIL", (id, error) => ({
  id,
  error
}));
