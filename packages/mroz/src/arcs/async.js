import actions from "./actions";
import { async } from "../actions";

export default function asyncArc() {
  return actions(
    ({ id }) => async.request(id),
    (data, { id }) => async.success(id, data),
    (error, { id }) => async.fail(id, error)
  );
}
