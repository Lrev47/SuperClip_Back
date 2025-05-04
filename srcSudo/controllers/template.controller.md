# Template Controller Specification

## Purpose

The Template Controller manages the CRUD operations and business logic for AI prompt templates. It handles creating, retrieving, updating, and deleting prompt templates, managing associated tags, searching and filtering templates, and validating template data. This controller serves as the interface between client requests and the template service layer.

## Dependencies

### External Packages
- `express`: For handling HTTP requests and responses
- `zod`: For request validation
- `http-status-codes`: For standardized HTTP status codes

### Internal Modules
- `@/services/template.service`: Service layer for prompt templates business logic
- `@/dto/template.dto`: Data Transfer Objects for template requests and responses
- `@/utils/async-handler`: Utility for handling async operations in Express
- `@/utils/api-error`: Custom error handling
- `@/middleware/auth`: Authentication middleware
- `@/middleware/validation`: Request validation middleware

## Inputs/Outputs

### Inputs
- HTTP requests with JSON payloads containing template data
- URL parameters (templateId)
- Query parameters (search terms, filters, pagination)
- Authorization headers for authentication and authorization

### Outputs
- JSON responses with template data
- HTTP status codes indicating success or failure
- Error messages for failed operations

## Data Types

```typescript
// Request DTOs
interface CreateTemplateRequest {
  name: string;
  description?: string;
  template: string;
  variables?: Record<string, any>;
  categoryId?: string;
  tagIds?: string[];
}

interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  template?: string;
  variables?: Record<string, any>;
  categoryId?: string;
}

// Response DTOs
interface TemplateResponse {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: Record<string, any> | null;
  userId: string;
  categoryId: string | null;
  tags: TagResponse[];
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateListResponse {
  templates: TemplateResponse[];
  total: number;
  page: number;
  limit: number;
}

// Filter and Search
interface TemplateFilters {
  categoryId?: string;
  tagIds?: string[];
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

## API/Methods

### TemplateController Class

#### `createTemplate`
- **HTTP Method**: POST
- **Route**: /api/templates
- **Description**: Creates a new prompt template
- **Access**: Authenticated users
- **Request Body**: CreateTemplateRequest
- **Response**: TemplateResponse
- **Status Codes**: 201 Created, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### `getAllTemplates`
- **HTTP Method**: GET
- **Route**: /api/templates
- **Description**: Retrieves all templates owned by the user with optional filtering and pagination
- **Access**: Authenticated users
- **Query Parameters**: TemplateFilters
- **Response**: TemplateListResponse
- **Status Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error

#### `getTemplateById`
- **HTTP Method**: GET
- **Route**: /api/templates/:templateId
- **Description**: Retrieves a specific template by ID
- **Access**: Template owner
- **URL Parameters**: templateId
- **Response**: TemplateResponse
- **Status Codes**: 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### `updateTemplate`
- **HTTP Method**: PUT
- **Route**: /api/templates/:templateId
- **Description**: Updates an existing template
- **Access**: Template owner
- **URL Parameters**: templateId
- **Request Body**: UpdateTemplateRequest
- **Response**: TemplateResponse
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### `deleteTemplate`
- **HTTP Method**: DELETE
- **Route**: /api/templates/:templateId
- **Description**: Deletes a template
- **Access**: Template owner
- **URL Parameters**: templateId
- **Response**: { success: true, message: 'Template deleted successfully' }
- **Status Codes**: 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### `addTagsToTemplate`
- **HTTP Method**: POST
- **Route**: /api/templates/:templateId/tags
- **Description**: Adds tags to a template
- **Access**: Template owner
- **URL Parameters**: templateId
- **Request Body**: { tagIds: string[] }
- **Response**: TemplateResponse with updated tags
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### `removeTagFromTemplate`
- **HTTP Method**: DELETE
- **Route**: /api/templates/:templateId/tags/:tagId
- **Description**: Removes a tag from a template
- **Access**: Template owner
- **URL Parameters**: templateId, tagId
- **Response**: TemplateResponse with updated tags
- **Status Codes**: 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### `searchTemplates`
- **HTTP Method**: GET
- **Route**: /api/templates/search
- **Description**: Searches templates by name, description or content
- **Access**: Authenticated users
- **Query Parameters**: { q: string, categoryId?: string, tagIds?: string[], page?: number, limit?: number }
- **Response**: TemplateListResponse
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### `generateFromTemplate`
- **HTTP Method**: POST
- **Route**: /api/templates/:templateId/generate
- **Description**: Generates content by filling the template with provided variables
- **Access**: Template owner
- **URL Parameters**: templateId
- **Request Body**: { variables: Record<string, any> }
- **Response**: { result: string }
- **Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

## Test Specifications

### Unit Tests

1. **createTemplate**
   - Should create a template with valid data
   - Should reject template creation with invalid data
   - Should handle category that doesn't exist
   - Should handle tags that don't exist

2. **getAllTemplates**
   - Should return all templates for a user
   - Should filter templates by categoryId
   - Should filter templates by tags
   - Should paginate results correctly
   - Should sort results by requested field and order

3. **getTemplateById**
   - Should return template when ID exists and belongs to user
   - Should return 404 when template doesn't exist
   - Should return 403 when template belongs to another user

4. **updateTemplate**
   - Should update template with valid data
   - Should return 404 when template doesn't exist
   - Should return 403 when template belongs to another user
   - Should handle partial updates correctly

5. **deleteTemplate**
   - Should delete template when ID exists and belongs to user
   - Should return 404 when template doesn't exist
   - Should return 403 when template belongs to another user

6. **addTagsToTemplate**
   - Should add valid tags to template
   - Should ignore duplicate tags
   - Should handle invalid tag IDs

7. **removeTagFromTemplate**
   - Should remove tag from template
   - Should return 404 when tag or template doesn't exist
   - Should handle case when tag is not associated with template

8. **searchTemplates**
   - Should return templates matching search query
   - Should filter search results by category
   - Should filter search results by tags
   - Should paginate search results

9. **generateFromTemplate**
   - Should fill template with provided variables
   - Should handle missing variables with defaults
   - Should return error for missing required variables
   - Should handle invalid template format

### Integration Tests

1. **Authentication**
   - Should reject requests without authentication
   - Should reject requests with invalid authentication

2. **Authorization**
   - Should enforce owner-only access for updateTemplate, deleteTemplate, etc.

3. **End-to-End Workflow**
   - Should support full CRUD lifecycle for templates
   - Should support adding and removing tags from templates
   - Should support searching and filtering templates

4. **Error Handling**
   - Should return appropriate error codes and messages for all error cases
   - Should validate request payloads and return 400 for invalid data

## Implementation Notes

### Controller Logic

1. **Request Validation**
   - Use Zod schemas to validate incoming requests
   - Implement strict validation for template format and variable structure

2. **Authorization**
   - Ensure templates can only be modified by their owners
   - Implement middleware to check template ownership

3. **Search and Filtering**
   - Implement efficient template searching with multiple criteria
   - Support searching by template name, description, and content
   - Allow filtering by tags and categories

4. **Template Variables**
   - Validate variable definitions against expected types
   - Support variable defaults and optional variables
   - Implement proper variable substitution in generateFromTemplate

5. **Performance Considerations**
   - Implement pagination for large result sets
   - Consider caching frequently accessed templates
   - Optimize queries when filtering by multiple criteria

6. **Security**
   - Sanitize template input to prevent XSS attacks
   - Validate that template variables are used safely
   - Implement rate limiting for template generation

7. **Edge Cases**
   - Handle concurrent updates to the same template
   - Properly manage orphaned templates when categories are deleted
   - Handle large templates and variable sets efficiently

## Related Files

- `src/routes/template.routes.ts`: Route definitions for template endpoints
- `src/services/template.service.ts`: Service layer implementation
- `src/repositories/template.repository.ts`: Data access layer
- `src/dto/template.dto.ts`: Data transfer object definitions
- `src/validation/template.validation.ts`: Request validation schemas
- `tests/controllers/template.controller.test.ts`: Unit and integration tests
