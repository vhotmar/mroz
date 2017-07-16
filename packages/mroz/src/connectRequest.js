import React, { Component } from "react";
import R from "ramda";
import PropTypes from "prop-types";
import * as selectors from "./selectors";
import * as actions from "./actions";

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
});

export default requests => WrappedComponent => {
  const getActions = props => R.map(value => value(props), requests);
  const getKey = action => action.meta.request.key;
  const getId = action => action.meta.async.id;

  class ConnectRequest extends Component {
    constructor(props) {
      super(props);

      this._actions = {};

      this.cancelPending = this.cancelPending.bind(this);
    }

    componentWillMount() {
      const { dispatch } = this.context.store;
      const actions = getActions(this.props);

      this._actions = actions;

      R.forEach(dispatch, actions);
    }

    componentDidUpdate() {
      const { dispatch } = this.context.store;
      const newActions = getActions(this.props);
      const actionPairs = R.mergeWith(R.pair, this._actions, newActions);

      const newKeys = R.map(getKey, actions);

      const diff = R.difference(R.toPairs(newKeys), R.toPairs(this._keys));
      const maybePendingIds = R.map(([req]) => this._ids[req], diff);

      this.cancelPending(maybePendingIds);

      const requests = R.map(
        ([req]) => actions[req],
        R.difference(R.toPairs(newKeys), diff)
      );

      R.forEach(dispatch, requests);
    }

    componentWillUnmount() {
      this.cancelPending(R.map(value => value), this._ids);
    }

    cancelPending(maybePendingIds = {}) {
      const { getState, dispatch } = this.context.store;
      const state = getState();
      const pendingIds = R.filter(
        id => selectors.request.isPendingById(state, id),
        maybePendingIds
      );

      R.forEach(dispatch, R.map(id => actions.request.cancel(id), pendingIds));
    }

    render() {}
  }

  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  ConnectRequest.displayName = `ConnectRequest(${wrappedComponentName})`;
  ConnectRequest.contextTypes = {
    store: storeShape
  };

  return ConnectRequest;
};
