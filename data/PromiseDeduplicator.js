var pool = new Map();

/**
 * If the promise with given `key` is still running, it is returned instead of creating new one.
 * Useful for HTTP request deduplication.
 *
 * var promise1 = PromiseDeduplicator('http://example.com/', http.get.bind(http, 'http://example.com/'))
 * var promise2 = PromiseDeduplicator('http://example.com/', http.get.bind(http, 'http://example.com/'))
 * promise1 === promise2;
 */
export default function PromiseDeduplicator(key, fnCreatePromise) {
  if (!pool.has(key)) {
    var promise = fnCreatePromise().then(
      (result) => {
        pool.delete(key);
        return result;
      }, (error) => {
        pool.delete(key);
        return Promise.reject(error);
      }
    )
    pool.set(key, promise);
    return promise;
  } else {
    return pool.get(key);
  }
}
