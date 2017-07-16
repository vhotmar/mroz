import * as epics from "./epics";
import * as arcs from "./arcs";
import * as plugins from "./plugins";
import * as actions from "./actions";
import * as selectors from "./selectors";

export { default as createStore } from "./createStore";
export { default as createAsyncActions } from "./createAsyncActions";
export { default as createRequestAction } from "./createRequestAction";
export { default as wrapAction } from "./wrapAction";

export { epics, arcs, plugins, actions, selectors };

export const defaultPlugin = {
  reducers: {},
  middleware: [],
  enhancers: [],
  hooks: []
};
