export function handleApiError(res, error, fallbackMessage = 'Something went wrong') {
  const statusCode = Number(error?.statusCode || error?.status || 500);
  const message = typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : fallbackMessage;

  const safeMessage = process.env.NODE_ENV === 'production'
    ? fallbackMessage
    : message;

  const payload = {
    success: false,
    message: safeMessage,
  };

  if (process.env.NODE_ENV !== 'production') {
    if (error?.code) payload.code = error.code;
    if (error?.details) payload.details = error.details;
    if (error?.stack) payload.stack = error.stack;
  }

  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(payload);
  }

  return Response.json(payload, { status: statusCode });
}
