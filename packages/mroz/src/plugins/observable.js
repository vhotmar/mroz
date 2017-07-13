import { createEpicMiddleware, combineEpics } from "redux-observable";
import { createAction } from "redux-actions";
import R from "ramda";

const dependenciesLens = R.lensPath(["meta", "dependencies"]);
const epicsLens = R.lensPath(["meta", "epics"]);

export const addDependencies = (plugin = {}, dependencies = {}) =>
  R.over(dependenciesLens, R.merge(dependencies), plugin);

export default ({ epic, dependencies = {}, hotReloadPath }) => (
  plugin = {}
) => {
  const pluginEpics = R.view(epicsLens, plugin);
  const pluginDependencies = R.view(dependenciesLens, plugin);

  const addEpic = R.append(R.__, pluginEpics);
  const addDependencies = R.merge(R.__, pluginDependencies);

  const getEpics = R.compose(combineEpics, addEpic);

  const middleware = createEpicMiddleware(getEpics(epic), {
    dependencies: addDependencies(dependencies)
  });

  if (hotReloadPath && module.hot && module.hot.accept) {
    module.hot.accept(hotReloadPath, () => {
      const rootEpic = require(hotReloadPath).default;
      middleware.replaceEpic(getEpics(rootEpic));
    });
  }

  return addMiddleware([middleware])(plugin);
};
