import R from "ramda";
import isFunction from "lodash/isFunction";

import * as arcs from "../arcs";
import async, { addNormalize } from "./async";

export default (actions, parameters, normalize) =>
  async(
    actions.request,
    config =>
      config.dependencies.ajax(
        isFunction(parameters) ? parameters(config) : parameters
      ),
    R.compose(
      arcs.actions(actions.success, actions.fail),
      normalize ? addNormalize(normalize) : x => x,
      arcs.request()
    )
  );
