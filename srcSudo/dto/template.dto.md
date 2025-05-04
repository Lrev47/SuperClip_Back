# template.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for prompt template-related operations in the application. It provides validation schemas for creating, updating, and querying AI prompt templates that contain variable placeholders, enabling users to generate consistent AI prompts with customized values.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)

## Inputs/Outputs
- **Input**: Prompt template data from requests or client
- **Output**: Validated prompt template data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// Prompt variable schema
const promptVariableSchema = z.object({
  name: z.string().min(1, 'Variable name is required').max(50, 'Variable name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Variable name can only contain letters, numbers, and underscores'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  type: z.enum(['string', 'number', 'boolean', 'select']),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
}).refine(data => {
  // If type is 'select', options must be provided
  if (data.type === 'select' && (!data.options || data.options.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Options are required for 'select' type variables",
  path: ["options"],
});

// Base prompt template schema with common properties
const basePromptTemplateSchema = {
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').nullable().optional(),
  template: z.string().min(1, 'Template content is required').max(10000, 'Template content cannot exceed 10000 characters'),
  variables: z.record(promptVariableSchema).optional(),
  categoryId: z.string().uuid('Invalid category ID format').nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).optional(),
};

// Create prompt template request DTO
export const createPromptTemplateSchema = z.object({
  ...basePromptTemplateSchema,
});
export type CreatePromptTemplateDto = z.infer<typeof createPromptTemplateSchema>;

// Update prompt template request DTO
export const updatePromptTemplateSchema = z.object({
  name: basePromptTemplateSchema.name.optional(),
  description: basePromptTemplateSchema.description,
  template: basePromptTemplateSchema.template.optional(),
  variables: basePromptTemplateSchema.variables,
  categoryId: basePromptTemplateSchema.categoryId,
  tagIds: basePromptTemplateSchema.tagIds,
});
export type UpdatePromptTemplateDto = z.infer<typeof updatePromptTemplateSchema>;

// Prompt template query parameters DTO
export const promptTemplateQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID format').nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).or(z.string().transform(val => val.split(','))).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type PromptTemplateQueryDto = z.infer<typeof promptTemplateQuerySchema>;

// Prompt template response DTO (to client)
export const promptTemplateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  template: z.string(),
  variables: z.record(promptVariableSchema).nullable(),
  parsedVariables: z.array(promptVariableSchema).optional(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  tags: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.string().nullable(),
  })).optional(),
});
export type PromptTemplateResponseDto = z.infer<typeof promptTemplateResponseSchema>;

// Render prompt request DTO
export const renderPromptSchema = z.object({
  templateId: z.string().uuid('Invalid template ID format'),
  variableValues: z.record(z.any()),
});
export type RenderPromptDto = z.infer<typeof renderPromptSchema>;

// Rendered prompt response DTO
export const renderedPromptResponseSchema = z.object({
  templateId: z.string().uuid(),
  templateName: z.string(),
  renderedContent: z.string(),
  variableValues: z.record(z.any()),
  renderedAt: z.date().or(z.string()),
});
export type RenderedPromptResponseDto = z.infer<typeof renderedPromptResponseSchema>;

// Parse variables from template DTO
export const parseVariablesSchema = z.object({
  template: z.string().min(1, 'Template content is required'),
});
export type ParseVariablesDto = z.infer<typeof parseVariablesSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid prompt template creation data
- Should reject templates with missing required fields
- Should validate variable definitions correctly
- Should require options for 'select' type variables
- Should handle optional fields correctly
- Should parse variables from template correctly
- Should validate rendered prompt requests

## Implementation Notes
1. **Variable Handling**:
   - Extract variable placeholders from template text (format: `{{variableName}}`)
   - Validate variable types and constraints when rendering
   - Support type-specific validation (min/max for numbers, options for selects)
   - Consider handling nested variables and conditional sections

2. **Template Validation**:
   - Ensure template contains valid variable syntax
   - Check for undefined variables in template
   - Validate variables against their constraints
   - Consider template formatting and structure validation

3. **Performance Considerations**:
   - Cache parsed variables from templates
   - Optimize variable extraction regular expressions
   - Consider template rendering performance for large templates
   - Implement efficient validation for complex variables

4. **Security Considerations**:
   - Sanitize variable inputs when rendering
   - Prevent template injection vulnerabilities
   - Validate user ownership of templates
   - Consider rate limiting for template rendering

## Related Files
- src/controllers/promptTemplate.controller.ts
- src/services/promptTemplate.service.ts
- src/models/interfaces/promptTemplate.interface.ts
- src/utils/templateRenderer.ts
