  // Error handling middleware (must be last)
  app.use('/api', notFoundHandler);
  app.use(errorHandler);
