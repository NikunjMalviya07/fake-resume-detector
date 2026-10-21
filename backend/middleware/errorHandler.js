function errorHandler(err, req, res, next) {
  console.error(err.message);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Something went wrong'
  });
}

export default errorHandler;