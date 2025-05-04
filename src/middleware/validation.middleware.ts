import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Define validation sources
export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
  COOKIES = 'cookies',
}

// Validation options interface
export interface ValidationOptions {
  abortEarly: boolean;
  allowUnknown: boolean;
  stripUnknown: boolean;
}

// Default validation options
const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

// Type for validation schema
export type ValidationSchema = Record<string, Joi.Schema>;

/**
 * Formats Joi validation errors into a user-friendly format
 */
const formatValidationError = (error: Joi.ValidationError): Record<string, string[]> => {
  const details: Record<string, string[]> = {};

  if (error.details && Array.isArray(error.details)) {
    error.details.forEach(detail => {
      const path = detail.path.join('.');

      if (!details[path]) {
        details[path] = [];
      }

      details[path].push(detail.message);
    });
  }

  return details;
};

/**
 * General purpose validator that can validate multiple parts of a request
 */
export const validateRequest = (
  schema: Record<ValidationSource, Joi.Schema>,
  options: ValidationOptions = DEFAULT_VALIDATION_OPTIONS,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: Record<string, Record<string, string[]>> = {};
    let hasError = false;

    // Validate each part of the request according to the schema
    Object.keys(schema).forEach(key => {
      const source = key as ValidationSource;
      const value = req[source as keyof Request];
      const schemaForSource = schema[source];

      const { error } = schemaForSource.validate(value, options);

      if (error) {
        hasError = true;
        validationErrors[source] = formatValidationError(error);
      }
    });

    if (hasError) {
      res.status(400).json({
        error: 'Validation Error',
        details: Object.values(validationErrors).reduce((acc, val) => ({ ...acc, ...val }), {}),
      });
      return;
    }

    next();
  };
};

/**
 * Validates request body against provided schema
 */
export const validateBody = (
  schema: Joi.Schema,
  options: ValidationOptions = DEFAULT_VALIDATION_OPTIONS,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, options);

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(error),
      });
      return;
    }

    next();
  };
};

/**
 * Validates query parameters against provided schema
 */
export const validateQuery = (
  schema: Joi.Schema,
  options: ValidationOptions = DEFAULT_VALIDATION_OPTIONS,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, options);

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(error),
      });
      return;
    }

    next();
  };
};

/**
 * Validates route parameters against provided schema
 */
export const validateParams = (
  schema: Joi.Schema,
  options: ValidationOptions = DEFAULT_VALIDATION_OPTIONS,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, options);

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(error),
      });
      return;
    }

    next();
  };
};
