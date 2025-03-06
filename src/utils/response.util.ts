import { Response } from 'express';

/**
 * Standard success response formatter
 */
export const successResponse = (
  res: Response, 
  statusCode: number, 
  data: any, 
  message?: string
) => {
  const response: any = {
    status: 'success'
  };
  
  if (message) {
    response.message = message;
  }
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Format error response
 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) => {
  const response: any = {
    status: 'error',
    message
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
}; 