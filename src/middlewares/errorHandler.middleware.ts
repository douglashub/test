import { Request, Response, NextFunction } from 'express';

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  const response = {
    success: false,
    error: {
      message: err.message || 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json(response);
  }

  if (err.message.includes('not found') || err.message.includes('No path found')) {
    return res.status(404).json(response);
  }

  // Default to 500 server error
  res.status(500).json(response);
}