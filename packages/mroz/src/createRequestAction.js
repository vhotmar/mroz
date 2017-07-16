import R from "ramda";
import { createAction } from "redux-actions";
import uuid from "uuid/v4";

import wrapAction from "./wrapAction";

export default (...args) => {
  const action = createAction(...args);

  return wrapAction(action, action =>
    R.assocPath(["meta", "async", "id"], uuid(), action)
  );
};
