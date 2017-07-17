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

export default (propRequests, actionRequests) => WrappedComponent => {
  class ConnectRequest extends Component {
    componentDidMount() {
      R.forEachObjIndexed(
        (value, key) => this.props[key].action(this.props),
        propRequests
      );
    }

    componentDidUpdate() {
      R.forEachObjIndexed(
        (value, key) => this.props[key].action(this.props),
        propRequests
      );
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  ConnectRequest.displayName = `ConnectRequest(${wrappedComponentName})`;
  ConnectRequest.contextTypes = {
    store: storeShape
  };

  return ConnectRequest;
};
