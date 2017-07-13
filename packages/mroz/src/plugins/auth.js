import { ajax } from "./request";
import { addDependencies } from "./observable";
import { addHeaders } from "./request";

export function authAjax(state) {
  return (properties = {}) =>
    ajax(
      addHeaders({
        Authorization: `Bearer ${state.auth.token}`
      })(properties)
    );
}

export default () => (plugin = {}) =>
  addDependencies(plugin, { auth: authAjax });
