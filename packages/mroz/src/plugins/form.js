import { reducer as formReducer } from "redux-form";
import { addReducers } from "./utils";

export default ({ reducers = {} } = {}) =>
  addReducers({ form: formReducer.plugin(reducers) });
