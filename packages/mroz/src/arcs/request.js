import R from "ramda";
import Backoff from "backo";
import { Observable } from "rxjs";
import { actions } from "../plugins/request";
import {
  addRequest,
  addSuccess,
  addFail,
  addWrapper,
  addFilter
} from "../epics/async";
import selectors from "../selectors/";

const retryableStatusCodes = [0, 408, 429, 503, 504];

export default function request({ polling, backoff: backoffConfig }) {
  return R.compose(
    // Dispatch request, success, fail actions which are going to be handled by
    // reducer
    addRequest(({ action, id }) =>
      Observable.of(actions.request(id, action.meta.request.key))
    ),
    addSuccess((data, { action, id }) =>
      Observable.of(actions.success(id, action.meta.request.key, data))
    ),
    addFail((error, { action, id }) =>
      Observable.of(actions.fail(id, action.meta.request.key, error))
    ),
    // Filter requests
    addFilter((stream$, { store }) =>
      stream$.filter(action => {
        const state = store.getState();
        const meta = action.meta.request;

        const request = selectors.request.requestByKey(state, meta.key);

        // Allow - first time request
        if (!request) return true;

        // Allow - force request
        if (meta.force) {
          return true;
        }

        // Disable - pending request
        if (request.isPending) {
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
    addWrapper((stream$, { id, actions$, action, store }) => {
      const cancelStream = actions$
        .ofType(String(actions.cancel))
        .filter(action => action.meta.async.id === id);

      const pollingStream = polling
        ? Observable.interval(polling).filter(() => {
            const state = store.getState();
            const meta = action.meta.request;

            const request = selectors.request.requestByKey(state, meta.key);

            // Ensure we are not requesting more than needed
            if (Date.now() - request.latestUpdate < polling) return false;

            return true;
          })
        : Observable.empty();

      return (
        stream
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
          })
          // Ensure polling
          .repeatWhen(pollingStream)
          // Cancelation
          .takeUntil(cancelStream)
      );
    })
  );
}
