import React, { Component } from "react";
import R from "ramda";
import PropTypes from "prop-types";
import * as selectors from "./selectors";
import createSelector from "reselect";

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
});

export default actions => WrappedComponent => {
  class ConnectAsync extends Component {
    constructor(props, context) {
      super(props, context);

      const { dispatch } = context.store;

      this._actionsIds = {};

      this._mappedActions = R.mapObjIndexed((value, key) => {
        const actionCreator =
          typeof value.request === "function" ? value.request : value;

        return (...args) => {
          const action = actionCreator(...args);

          const id = action.meta.async.id;

          this._actionsIds[key] = id;

          return dispatch(action);
        };
      }, actions);

      this._selectors = R.mapObjIndexed(
        (value, key) =>
          createSelector(
            [state => selectors.async.state(state, this._actionsIds[key])],
            asyncState => ({
              isPending: asyncState.isPending,
              isFinished: asyncState.isFinished,
              action: this._mappedActions[key]
            })
          ),
        actions
      );
    }

    makeProps() {
      const state = this.context.store.getState();

      return R.mapObjIndexed(
        (value, key) => this._selectors[key](state),
        actions
      );
    }

    render() {
      return <WrappedComponent {...this.props} {...this.makeProps()} />;
    }
  }

  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  ConnectAsync.displayName = `ConnectAsync(${wrappedComponentName})`;
  ConnectAsync.contextTypes = {
    store: storeShape
  };

  return ConnectAsync;
};
