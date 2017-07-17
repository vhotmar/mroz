import R from "ramda";
import Backoff from "backo";
import actions from "./actions";
import { Observable } from "rxjs";
import { request as requestActions } from "../actions";
import { addWrapper, addFilter, addNormalize } from "../epics/async";
import {
  request as requestSelectors,
  async as asyncSelectors
} from "../selectors/";

const retryableStatusCodes = [0, 408, 429, 503, 504];
const defaultBackoffConfig = {
  minDuration: 300,
  maxDuration: 2000,
  maxAttempts: 5
};

export default function request(
  {
    polling,
    backoff: backoffConfig = defaultBackoffConfig,
    refetchTimeout
  } = {}
) {
  return R.pipe(
    // Dispatch request, success, fail actions which are going to be handled by
    // reducer
    actions(
      ({ action, id }) =>
        requestActions.request(id, action.meta.request.key, {
          isPolling: !!polling
        }),
      (data, { action, id }) =>
        requestActions.success(id, action.meta.request.key, data),
      (error, { action, id }) =>
        requestActions.fail(id, action.meta.request.key, error)
    ),
    // Filter requests
    addFilter((stream$, { store }) =>
      stream$.filter(action => {
        const state = store.getState();
        const meta = action.meta.request;

        const request = requestSelectors.requestByKey(state, meta.key);

        // Allow - first time request
        if (!request) return true;

        const requestState = asyncSelectors.state(state, request.id);

        // Allow - force request
        if (meta.force) {
          if (requestState.isPending) {
            // Cancel pending request
            store.dispatch(requestActions.cancel(request.id));
          }

          return true;
        }

        // Disable - pending request
        if (requestState.isPending) {
          return false;
        }

        // Allow - requests which should be refetched
        if (
          refetchTimeout &&
          Number(Date.now()) - Number(request.latestUpdate) > refetchTimeout
        ) {
          return true;
        }

        return false;
      })
    ),
    // Ensure requests are going to be executed, retried, polled and cancelled
    addWrapper((stream$, { id, action$, action, store }) => {
      const cancelStream = action$
        .ofType(String(requestActions.cancel))
        .filter(action => action.payload.id === id)
        .map(() => {
          throw new Error("cancel");
        });

      const pollingStream = polling
        ? Observable.interval(polling).filter(() => {
            const state = store.getState();
            const meta = action.meta.request;

            const request = requestSelectors.requestByKey(state, meta.key);

            // Ensure we are not requesting more than needed
            if (Date.now() - request.latestUpdate < polling) return false;

            return true;
          })
        : Observable.empty();

      return Observable.race(
        // Cancelation
        stream$
          // Handling errors
          .retryWhen(errors$ => {
            const backoff = new Backoff({
              min: backoffConfig.minDuration || 300,
              max: backoffConfig.maxDuration || 5000
            });

            return (
              errors$
                // Repeat request with backoff if this is not server error
                .scan((errorCount, error) => {
                  if (
                    !R.contains(error.status, retryableStatusCodes) ||
                    errorCount > (backoffConfig.maxAttempts || 5)
                  ) {
                    throw error;
                  }

                  return errorCount + 1;
                }, 0)
                .delayWhen(() => Observable.timer(backoff.duration()))
            );
          }),
        cancelStream
        // Ensure polling
      ).repeatWhen(pollingStream);
    }),
    // If everything went correctly, normalize the value
    addNormalize(data => data.response)
  );
}
