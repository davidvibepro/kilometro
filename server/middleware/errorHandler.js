// Express treats a middleware with 4 parameters as the error handler.
// Every error leaves the server as JSON { message }, never as HTML or a stack trace.
export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Schema rules failed (required, min, max, enum, match...).
  // Each Mongoose message names its field, e.g. "Path `make` is required."
  // Every message gets a final period so several of them read as separate sentences.
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((error) =>
      error.message.endsWith('.') ? error.message : `${error.message}.`
    );
    return res.status(400).json({ message: messages.join(' ') });
  }

  // A value could not be converted, e.g. "abc" used as an ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  // A unique index was violated, e.g. a plateNumber that is already saved
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'Value';
    return res.status(400).json({ message: `${field} already exists` });
  }

  // express.json() could not read the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  // Errors created on purpose with a status of 400 or 404
  if (err.status === 400 || err.status === 404) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
}
