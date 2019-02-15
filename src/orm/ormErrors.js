export class RecordInvalidError extends Error {
  constructor(...args) {
    super(...args);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RecordInvalidError);
    }
  }
}
