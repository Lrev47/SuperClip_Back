import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Express } from 'express';
import path from 'path';

// Define types for OpenAPI objects
interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    [key: string]: unknown;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
    responses?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
    [key: string]: unknown;
  };
  tags?: Array<{
    name: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

// Load the OpenAPI specification from YAML file
const openApiSpecification = YAML.load(path.join(__dirname, 'openapi.yaml')) as OpenAPISpec;

// JSDoc Swagger options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SuperClip API',
      version: '1.0.0',
      description: 'API documentation for the SuperClip application',
    },
  },
  // Look for JSDoc comments in these directories
  apis: [
    path.join(__dirname, '../routes/**/*.ts'),
    path.join(__dirname, '../controllers/**/*.ts'),
    path.join(__dirname, '../models/**/*.ts'),
  ],
};

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(options) as OpenAPISpec;

// Merge OpenAPI YAML spec with JSDoc comments
const combinedSpecs: OpenAPISpec = {
  ...openApiSpecification,
  ...specs,
  // Ensure paths from both sources are combined
  paths: { ...openApiSpecification.paths, ...specs.paths },
  // Ensure components from both sources are combined
  components: {
    ...openApiSpecification.components,
    ...specs.components,
    schemas: {
      ...openApiSpecification.components?.schemas,
      ...specs.components?.schemas,
    },
    responses: {
      ...openApiSpecification.components?.responses,
      ...specs.components?.responses,
    },
  },
};

/**
 * Configure Swagger documentation middleware
 * @param app Express application instance
 */
export function setupSwagger(app: Express): void {
  // Serve SwaggerUI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(combinedSpecs));

  // Serve raw OpenAPI spec at /swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(combinedSpecs);
  });

  // Serve YAML version at /swagger.yaml
  app.get('/swagger.yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(YAML.stringify(combinedSpecs, 10, 2));
  });
}

export default setupSwagger;
