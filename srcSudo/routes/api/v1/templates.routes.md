# templates.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for AI prompt template management in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the template controller and applies necessary middleware for authentication, validation, and security. The routes provide functionality for creating, retrieving, updating, and deleting prompt templates, as well as managing template tags and categories.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/template.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/subscription.middleware.ts
  - ../middlewares/security.middleware.ts

## Route Definitions

### Create Template

- **Method**: POST
- **Path**: `/api/v1/templates`
- **Description**: Create a new prompt template
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates template data)
  - requireFeatureAccess('templates') (verifies subscription allows template creation)
- **Controller**: TemplateController.createTemplate
- **Auth Required**: Yes

### Get All Templates

- **Method**: GET
- **Path**: `/api/v1/templates`
- **Description**: Get all templates for the authenticated user with filtering and pagination
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates query parameters for filtering, sorting, and pagination)
- **Controller**: TemplateController.getAllTemplates
- **Auth Required**: Yes

### Get Template by ID

- **Method**: GET
- **Path**: `/api/v1/templates/:templateId`
- **Description**: Get a specific template by ID
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID)
- **Controller**: TemplateController.getTemplateById
- **Auth Required**: Yes

### Update Template

- **Method**: PUT
- **Path**: `/api/v1/templates/:templateId`
- **Description**: Update an existing template
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID)
  - validateBody (validates update data)
- **Controller**: TemplateController.updateTemplate
- **Auth Required**: Yes

### Delete Template

- **Method**: DELETE
- **Path**: `/api/v1/templates/:templateId`
- **Description**: Delete a template
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID)
- **Controller**: TemplateController.deleteTemplate
- **Auth Required**: Yes

### Add Tags to Template

- **Method**: POST
- **Path**: `/api/v1/templates/:templateId/tags`
- **Description**: Add tags to a template
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID)
  - validateBody (validates tag IDs)
- **Controller**: TemplateController.addTagsToTemplate
- **Auth Required**: Yes

### Remove Tag from Template

- **Method**: DELETE
- **Path**: `/api/v1/templates/:templateId/tags/:tagId`
- **Description**: Remove a tag from a template
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID and tag ID)
- **Controller**: TemplateController.removeTagFromTemplate
- **Auth Required**: Yes

### Search Templates

- **Method**: GET
- **Path**: `/api/v1/templates/search`
- **Description**: Search templates by name, description, or content
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates search query, category ID, tag IDs, and pagination parameters)
- **Controller**: TemplateController.searchTemplates
- **Auth Required**: Yes

### Generate from Template

- **Method**: POST
- **Path**: `/api/v1/templates/:templateId/generate`
- **Description**: Generate content by filling the template with provided variables
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID)
  - validateBody (validates variables)
  - requireFeatureAccess('template_generation') (verifies subscription allows template generation)
- **Controller**: TemplateController.generateFromTemplate
- **Auth Required**: Yes

### Get Templates by Category

- **Method**: GET
- **Path**: `/api/v1/templates/category/:categoryId`
- **Description**: Get all templates in a specific category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates category ID)
  - validateQuery (validates pagination parameters)
- **Controller**: TemplateController.getTemplatesByCategory
- **Auth Required**: Yes

### Get Featured Templates

- **Method**: GET
- **Path**: `/api/v1/templates/featured`
- **Description**: Get featured or suggested templates
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates limit parameter)
- **Controller**: TemplateController.getFeaturedTemplates
- **Auth Required**: Yes

### Get Template Categories

- **Method**: GET
- **Path**: `/api/v1/templates/categories`
- **Description**: Get all template categories
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: TemplateController.getTemplateCategories
- **Auth Required**: Yes

### Create Template Category

- **Method**: POST
- **Path**: `/api/v1/templates/categories`
- **Description**: Create a new template category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates category data)
- **Controller**: TemplateController.createTemplateCategory
- **Auth Required**: Yes

### Update Template Category

- **Method**: PUT
- **Path**: `/api/v1/templates/categories/:categoryId`
- **Description**: Update a template category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates category ID)
  - validateBody (validates update data)
- **Controller**: TemplateController.updateTemplateCategory
- **Auth Required**: Yes

### Delete Template Category

- **Method**: DELETE
- **Path**: `/api/v1/templates/categories/:categoryId`
- **Description**: Delete a template category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates category ID)
- **Controller**: TemplateController.deleteTemplateCategory
- **Auth Required**: Yes

### Clone Template

- **Method**: POST
- **Path**: `/api/v1/templates/:templateId/clone`
- **Description**: Create a copy of an existing template
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates template ID)
  - validateBody (validates new template name)
  - requireFeatureAccess('templates') (verifies subscription allows template creation)
- **Controller**: TemplateController.cloneTemplate
- **Auth Required**: Yes

## Implementation Notes

### Template Management

- Templates contain variable placeholders in the format `{{variable_name}}`
- Variables can have default values and type constraints
- Templates are categorized for better organization
- Templates can be tagged for easier discovery

### Template Generation

- Variable substitution should handle different data types appropriately
- Validate required variables are provided
- Implement proper error handling for missing or invalid variables
- Consider rate limiting for template generation

### Error Handling

- Return appropriate HTTP status codes for different error scenarios
- Provide clear error messages without exposing sensitive information
- Log errors for debugging and monitoring
- Handle edge cases like invalid template syntax

### Performance Considerations

- Implement efficient template search with multiple criteria
- Use pagination for template listings
- Consider caching frequently used templates
- Optimize variable substitution for performance

### Security Considerations

- Verify user ownership of templates before allowing operations
- Sanitize template content to prevent injection attacks
- Validate all user inputs, especially for template generation
- Implement proper access control for shared templates (if applicable)

## Related Files

- srcSudo/controllers/template.controller.ts
- srcSudo/services/template.service.ts
- srcSudo/repositories/template.repository.ts
- srcSudo/models/interfaces/template.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
