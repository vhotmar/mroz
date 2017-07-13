import { reducer as formReducer } from "redux-form";
import { addReducers } from "./utils";

export default ({ reducers = {} }) => plugin =>
  addReducers(plugin, { form: formReducer.plugin(reducers) });
