import R from "ramda";
import isFunction from "lodash/isFunction";
import createAsyncActions from "./createAsyncActions";
import wrapAction from "./wrapAction";

export default (prefix, options) => {
  const actions = createAsyncActions(prefix, options);

  return {
    ...actions,
    request: wrapAction(actions.request, (action, ...args) =>
      R.assocPath(
        ["meta", "request", "key"],
        isFunction(options.queryKey)
          ? options.queryKey(...args)
          : options.queryKey || `${prefix}.request`,
        action
      )
    )
  };
};
