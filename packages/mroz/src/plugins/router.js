import { routerMiddleware } from "react-router-redux";
import { addMiddleware } from "./utils";

export default ({ history }) => plugin =>
  addMiddleware(routerMiddleware(history))(plugin);
