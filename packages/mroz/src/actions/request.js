import { createAction } from "redux-actions";

export const request = createAction(
  "@@mroz/REQUEST_REQUEST",
  (id, key, { isPolling = false } = {}) => ({
    id,
    key,
    isPolling
  })
);

export const success = createAction(
  "@@mroz/REQUEST_SUCCESS",
  (id, key, data) => ({
    id,
    key,
    data,
    time: Date.now()
  })
);

export const fail = createAction("@@mroz/REQUEST_FAIL", (id, key, error) => ({
  id,
  key,
  error
}));

export const cancel = createAction("@@mrot/REQUEST_CANCEL", id => ({
  id
}));
