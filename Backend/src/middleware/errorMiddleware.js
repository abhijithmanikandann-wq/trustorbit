export function notFoundMiddleware(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

export function errorMiddleware(error, _request, response, _next) {
  console.error(error);
  response.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error'
  });
}
