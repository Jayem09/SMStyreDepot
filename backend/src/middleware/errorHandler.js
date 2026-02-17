export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  // Fetch/Network errors (Supabase connection issues)
  if (err.message && err.message.includes('fetch failed')) {
    return res.status(500).json({
      error: 'Database connection failed',
      details: 'Cannot connect to Supabase. Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file, and ensure your Supabase project is active.'
    });
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Database constraint error',
      details: 'The operation violates a database constraint'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
};
