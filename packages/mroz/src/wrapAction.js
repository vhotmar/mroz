export default (action, fn) => {
  const newAction = (...args) => fn(action(...args), ...args);

  newAction.toString = action.toString;

  return newAction;
};
