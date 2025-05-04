# template.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for PromptTemplate entity operations, providing an abstraction layer for template-related database interactions. It handles the creation, retrieval, updating, and deletion of AI prompt templates, as well as variable parsing, template rendering, and organization.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules:
  - ../models/interfaces/promptTemplate.interface.ts
  - ../utils/pagination.ts
  - ../utils/error.ts
  - ../utils/templateRenderer.ts

## Inputs/Outputs
- **Input**: Template data, query parameters, template IDs, variable values
- **Output**: Template objects, rendered prompts, paginated results, success/failure responses

## API/Methods
```typescript
import { PrismaClient, PromptTemplate, Prisma } from '@prisma/client';
import { 
  IPromptTemplate, 
  IPromptTemplateWithUser, 
  IPromptTemplateWithCategory, 
  IPromptTemplateWithTags,
  IPromptTemplateWithRelations,
  IPromptTemplateWithParsedVariables,
  IPromptVariable,
  IRenderedPrompt
} from '../models/interfaces/promptTemplate.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';

export class TemplateRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new prompt template
   * @param templateData Template data to create
   * @returns Created template
   */
  async create(templateData: {
    name: string;
    template: string;
    description?: string;
    variables?: Record<string, any>;
    userId: string;
    categoryId?: string;
    tagIds?: string[];
  }): Promise<IPromptTemplate> {
    // Implementation
  }

  /**
   * Find a template by ID
   * @param id Template ID
   * @param userId Optional user ID for permission check
   * @returns Template or null if not found
   */
  async findById(id: string, userId?: string): Promise<IPromptTemplate | null> {
    // Implementation
  }

  /**
   * Find a template with user data
   * @param id Template ID
   * @returns Template with user data or null if not found
   */
  async findWithUser(id: string): Promise<IPromptTemplateWithUser | null> {
    // Implementation
  }

  /**
   * Find a template with category data
   * @param id Template ID
   * @returns Template with category data or null if not found
   */
  async findWithCategory(id: string): Promise<IPromptTemplateWithCategory | null> {
    // Implementation
  }

  /**
   * Find a template with tags
   * @param id Template ID
   * @returns Template with tags or null if not found
   */
  async findWithTags(id: string): Promise<IPromptTemplateWithTags | null> {
    // Implementation
  }

  /**
   * Find a template with all relationships
   * @param id Template ID
   * @param userId Optional user ID for permission check
   * @returns Template with all relationships or null if not found
   */
  async findWithRelations(id: string, userId?: string): Promise<IPromptTemplateWithRelations | null> {
    // Implementation
  }

  /**
   * Find all templates
   * @param options Query options
   * @returns Paginated template results
   */
  async findAll(options: {
    userId?: string;
    categoryId?: string | null;
    pagination?: PaginationOptions;
    search?: string;
    tagIds?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<IPromptTemplate>> {
    // Implementation
  }

  /**
   * Update a template
   * @param id Template ID
   * @param templateData Data to update
   * @param userId User ID for permission check
   * @returns Updated template
   */
  async update(
    id: string,
    templateData: Partial<{
      name: string;
      template: string;
      description: string;
      variables: Record<string, any>;
      categoryId: string | null;
      tagIds: string[];
    }>,
    userId: string
  ): Promise<IPromptTemplate> {
    // Implementation
  }

  /**
   * Delete a template
   * @param id Template ID
   * @param userId User ID for permission check
   * @returns Deleted template
   */
  async delete(id: string, userId: string): Promise<IPromptTemplate> {
    // Implementation
  }

  /**
   * Parse variables from a template
   * @param template Template string
   * @returns Array of parsed variables
   */
  async parseVariables(template: string): Promise<IPromptVariable[]> {
    // Implementation
  }

  /**
   * Get template with parsed variables
   * @param id Template ID
   * @returns Template with parsed variables or null if not found
   */
  async getWithParsedVariables(id: string): Promise<IPromptTemplateWithParsedVariables | null> {
    // Implementation
  }

  /**
   * Render a template with provided variable values
   * @param id Template ID
   * @param variableValues Variable values to use in rendering
   * @param userId User ID for permission check
   * @returns Rendered prompt
   */
  async renderTemplate(
    id: string,
    variableValues: Record<string, any>,
    userId: string
  ): Promise<IRenderedPrompt> {
    // Implementation
  }

  /**
   * Add tags to a template
   * @param id Template ID
   * @param tagIds Tag IDs to add
   * @param userId User ID for permission check
   * @returns Updated template with tags
   */
  async addTags(id: string, tagIds: string[], userId: string): Promise<IPromptTemplateWithTags> {
    // Implementation
  }

  /**
   * Remove tags from a template
   * @param id Template ID
   * @param tagIds Tag IDs to remove
   * @param userId User ID for permission check
   * @returns Updated template with tags
   */
  async removeTags(id: string, tagIds: string[], userId: string): Promise<IPromptTemplateWithTags> {
    // Implementation
  }

  /**
   * Move template to a category
   * @param id Template ID
   * @param categoryId Category ID (null for uncategorized)
   * @param userId User ID for permission check
   * @returns Updated template
   */
  async moveToCategory(id: string, categoryId: string | null, userId: string): Promise<IPromptTemplate> {
    // Implementation
  }

  /**
   * Duplicate a template
   * @param id Template ID to duplicate
   * @param userId User ID for permission check
   * @param overrides Optional values to override in the duplicate
   * @returns New duplicated template
   */
  async duplicate(
    id: string,
    userId: string,
    overrides?: Partial<{
      name: string;
      description: string;
      categoryId: string | null;
    }>
  ): Promise<IPromptTemplate> {
    // Implementation
  }

  /**
   * Check if user has access to template
   * @param templateId Template ID
   * @param userId User ID
   * @returns Boolean indicating access
   */
  async hasAccess(templateId: string, userId: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Get total template count
   * @param userId Optional user ID to filter by user
   * @returns Number of templates
   */
  async count(userId?: string): Promise<number> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new prompt template
- Should find a template by ID
- Should find a template with user data
- Should find a template with category data
- Should find a template with tags
- Should find a template with all relationships
- Should find all templates with pagination and filters
- Should update a template
- Should delete a template
- Should parse variables from a template correctly
- Should get template with parsed variables
- Should render a template with variable values
- Should add tags to a template
- Should remove tags from a template
- Should move template to a category
- Should duplicate a template
- Should check if user has access to template
- Should count templates correctly

### Integration Tests
- Should handle CRUD operations on templates
- Should correctly parse and validate template variables
- Should properly render templates with various variable types
- Should handle category and tag relationships
- Should enforce user ownership of templates
- Should maintain variable consistency during updates
- Should handle template duplication properly
- Should maintain referential integrity with users, categories, and tags

## Implementation Notes
1. **Template Management**:
   - Implement variable extraction and parsing from template strings
   - Support different variable types and constraints
   - Validate variable values against their definitions
   - Handle template versioning if needed

2. **Variable Handling**:
   - Extract variables using regex pattern matching
   - Parse variable metadata from structure or separate definitions
   - Support string, number, boolean, and selection variables
   - Implement variable validation rules
   - Handle default values for optional variables

3. **Rendering Logic**:
   - Implement efficient template rendering with variable substitution
   - Handle missing or invalid variables appropriately
   - Consider caching rendered results for frequently used templates
   - Implement safeguards against template injection vulnerabilities

4. **Security Considerations**:
   - Always verify user ownership before operations
   - Sanitize templates to prevent injection attacks
   - Validate variable values to prevent misuse
   - Implement proper authorization for template sharing

5. **Performance Considerations**:
   - Optimize variable extraction and parsing
   - Consider caching frequently used templates
   - Use efficient template rendering algorithms
   - Implement pagination for template listings
   - Use appropriate indexes for template search

6. **Organization**:
   - Support categorization of templates using folders/categories
   - Implement tagging for flexible organization
   - Support template search by content, name, and variables
   - Consider template sharing or public/private visibility

## Related Files
- src/models/interfaces/promptTemplate.interface.ts
- src/services/template.service.ts
- src/controllers/template.controller.ts
- src/utils/templateRenderer.ts
- src/repositories/tag.repository.ts
- src/repositories/folder.repository.ts
