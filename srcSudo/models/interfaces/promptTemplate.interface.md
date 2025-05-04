# promptTemplate.interface.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines interfaces for the PromptTemplate entity in the application. It provides TypeScript types for AI prompt templates that allow users to create, manage, and use reusable templates with variable placeholders for generating consistent AI prompts.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript interfaces for prompt template-related data structures

## Data Types
```typescript
import { PromptTemplate, User, Folder, Tag } from '@prisma/client';

// Basic prompt template interface (extends the Prisma model)
export interface IPromptTemplate extends PromptTemplate {
  // Basic attributes defined in Prisma schema
  id: string;
  name: string;
  description: string | null;
  template: string;
  variables: Record<string, any> | null;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Prompt template with user data
export interface IPromptTemplateWithUser extends IPromptTemplate {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Prompt template with category (folder) data
export interface IPromptTemplateWithCategory extends IPromptTemplate {
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

// Prompt template with tags
export interface IPromptTemplateWithTags extends IPromptTemplate {
  tags: {
    id: string;
    name: string;
    color: string | null;
  }[];
}

// Prompt template with full relationship data
export interface IPromptTemplateWithRelations extends IPromptTemplate {
  user: User;
  category: Folder | null;
  tags: Tag[];
}

// Prompt template variable definition
export interface IPromptVariable {
  name: string;
  description?: string;
  defaultValue?: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[]; // For 'select' type
  minLength?: number; // For 'string' type
  maxLength?: number; // For 'string' type
  min?: number; // For 'number' type
  max?: number; // For 'number' type
}

// Prompt template with parsed variables
export interface IPromptTemplateWithParsedVariables extends IPromptTemplate {
  parsedVariables: IPromptVariable[];
}

// Rendered prompt from template
export interface IRenderedPrompt {
  originalTemplateId: string;
  templateName: string;
  renderedContent: string;
  variableValues: Record<string, any>;
  renderedAt: Date;
}
```

## API/Methods
N/A - This is an interface definition file with no runtime code.

## Test Specifications
N/A - TypeScript interfaces cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Variable Handling**:
   - Support variable placeholders in the format `{{variableName}}`
   - Parse variables from template text and store their definitions
   - Validate variable values against their defined types and constraints
   - Provide default values for optional variables

2. **Template Structure**:
   - Store templates with consistent formatting
   - Consider supporting markdown formatting in templates
   - Handle escaping of special characters and brackets
   - Support nested variables or conditional sections if needed

3. **Rendering Logic**:
   - Provide efficient template rendering with variable substitution
   - Handle missing variables appropriately (error or default value)
   - Consider caching rendered results for frequently used templates
   - Implement safeguards against template injection vulnerabilities

4. **Organization**:
   - Support categorization of templates using folders
   - Allow tagging for flexible organization
   - Implement template searching and filtering
   - Consider template sharing or public/private visibility

## Related Files
- src/services/promptTemplate.service.ts
- src/controllers/promptTemplate.controller.ts
- src/dto/template.dto.ts
- src/utils/templateRenderer.ts 