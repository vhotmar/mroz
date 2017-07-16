import { compose } from "ramda";
import { routerMiddleware, routerReducer } from "react-router-redux";
import { addMiddleware, addReducers } from "./utils";

export default ({ history }) =>
  compose(
    addMiddleware([routerMiddleware(history)]),
    addReducers({
      router: routerReducer
    })
  );
