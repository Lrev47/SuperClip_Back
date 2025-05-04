# template.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the template management service for the SuperClip application. It handles the creation, retrieval, updating, and deletion of clip templates that users can save and reuse. Templates allow users to define reusable content structures, formatting options, and placeholders that can be quickly applied to create new clips. The service supports template categories, sharing, and versioning.

## Dependencies
- External packages:
  - @prisma/client
  - uuid
  - date-fns
  - handlebars (for template rendering)
  - zod (for validation)
- Internal modules:
  - ../repositories/template.repository.ts
  - ../repositories/user.repository.ts
  - ../repositories/clip.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../utils/validators.ts
  - ../models/interfaces/template.interface.ts
  - ../config/template.config.ts

## Inputs/Outputs
- **Input**: Template creation/update data, template rendering parameters, template queries, user context
- **Output**: Template objects, rendered content, operation results, template collections

## API/Methods
```typescript
import { TemplateRepository } from '../repositories/template.repository';
import { UserRepository } from '../repositories/user.repository';
import { ClipRepository } from '../repositories/clip.repository';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { TemplateConfig } from '../config/template.config';
import {
  Template,
  TemplateCategory,
  TemplateVersion,
  TemplatePermission,
  User,
  Prisma
} from '@prisma/client';
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateWithDetails,
  TemplateRenderOptions,
  TemplateQueryOptions,
  TemplatePermissionInput,
  TemplateCategoryInput,
  TemplateExportFormat,
  TemplateImportResult,
  TemplateRenderResult,
  TemplateStats
} from '../models/interfaces/template.interface';
import { v4 as uuidv4 } from 'uuid';
import * as dateFns from 'date-fns';
import * as Handlebars from 'handlebars';
import { z } from 'zod';

export class TemplateService {
  private templateRepository: TemplateRepository;
  private userRepository: UserRepository;
  private clipRepository: ClipRepository;
  private logger: Logger;
  private config: TemplateConfig;

  constructor(
    templateRepository: TemplateRepository,
    userRepository: UserRepository,
    clipRepository: ClipRepository,
    logger: Logger,
    config: TemplateConfig
  ) {
    this.templateRepository = templateRepository;
    this.userRepository = userRepository;
    this.clipRepository = clipRepository;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Create a new template
   * @param userId User ID
   * @param templateData Template creation data
   * @returns Created template
   */
  async createTemplate(
    userId: string,
    templateData: CreateTemplateInput
  ): Promise<TemplateWithDetails> {
    // Implementation
  }

  /**
   * Get template by ID
   * @param templateId Template ID
   * @param userId User ID requesting the template
   * @returns Template with details
   */
  async getTemplateById(
    templateId: string,
    userId: string
  ): Promise<TemplateWithDetails | null> {
    // Implementation
  }

  /**
   * Get all templates for a user
   * @param userId User ID
   * @param options Query options
   * @returns List of templates
   */
  async getUserTemplates(
    userId: string,
    options?: TemplateQueryOptions
  ): Promise<{
    templates: TemplateWithDetails[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Update template
   * @param templateId Template ID
   * @param userId User ID
   * @param updateData Template update data
   * @returns Updated template
   */
  async updateTemplate(
    templateId: string,
    userId: string,
    updateData: UpdateTemplateInput
  ): Promise<TemplateWithDetails> {
    // Implementation
  }

  /**
   * Delete template
   * @param templateId Template ID
   * @param userId User ID
   * @returns Success status
   */
  async deleteTemplate(
    templateId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Render template with provided data
   * @param templateId Template ID
   * @param userId User ID
   * @param data Data to render template with
   * @param options Rendering options
   * @returns Rendered content
   */
  async renderTemplate(
    templateId: string,
    userId: string,
    data: Record<string, any>,
    options?: TemplateRenderOptions
  ): Promise<TemplateRenderResult> {
    // Implementation
  }

  /**
   * Create clip from template
   * @param templateId Template ID
   * @param userId User ID
   * @param data Data to render template with
   * @param options Additional clip options
   * @returns Created clip ID
   */
  async createClipFromTemplate(
    templateId: string,
    userId: string,
    data: Record<string, any>,
    options?: {
      folderId?: string;
      tags?: string[];
      deviceId?: string;
    }
  ): Promise<string> {
    // Implementation
  }

  /**
   * Create template from clip
   * @param clipId Clip ID
   * @param userId User ID
   * @param templateData Additional template data
   * @returns Created template
   */
  async createTemplateFromClip(
    clipId: string,
    userId: string,
    templateData: Omit<CreateTemplateInput, 'content'>
  ): Promise<TemplateWithDetails> {
    // Implementation
  }

  /**
   * Share template with another user
   * @param templateId Template ID
   * @param ownerId Owner user ID
   * @param targetUserId User ID to share with
   * @param permission Permission level
   * @returns Template permission
   */
  async shareTemplate(
    templateId: string,
    ownerId: string,
    targetUserId: string,
    permission: TemplatePermissionInput
  ): Promise<TemplatePermission> {
    // Implementation
  }

  /**
   * Remove template sharing
   * @param templateId Template ID
   * @param ownerId Owner user ID
   * @param targetUserId User ID to remove sharing for
   * @returns Success status
   */
  async removeTemplateSharing(
    templateId: string,
    ownerId: string,
    targetUserId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Get shared templates for a user
   * @param userId User ID
   * @param options Query options
   * @returns List of shared templates
   */
  async getSharedTemplates(
    userId: string,
    options?: TemplateQueryOptions
  ): Promise<{
    templates: TemplateWithDetails[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Create template category
   * @param userId User ID
   * @param categoryData Category data
   * @returns Created category
   */
  async createTemplateCategory(
    userId: string,
    categoryData: TemplateCategoryInput
  ): Promise<TemplateCategory> {
    // Implementation
  }

  /**
   * Update template category
   * @param categoryId Category ID
   * @param userId User ID
   * @param categoryData Category update data
   * @returns Updated category
   */
  async updateTemplateCategory(
    categoryId: string,
    userId: string,
    categoryData: TemplateCategoryInput
  ): Promise<TemplateCategory> {
    // Implementation
  }

  /**
   * Delete template category
   * @param categoryId Category ID
   * @param userId User ID
   * @param options Options for handling templates in category
   * @returns Success status
   */
  async deleteTemplateCategory(
    categoryId: string,
    userId: string,
    options?: { reassignToCategory?: string }
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Get template categories
   * @param userId User ID
   * @returns List of categories
   */
  async getTemplateCategories(
    userId: string
  ): Promise<TemplateCategory[]> {
    // Implementation
  }

  /**
   * Export templates
   * @param templateIds Template IDs to export
   * @param userId User ID
   * @param format Export format
   * @returns Export data
   */
  async exportTemplates(
    templateIds: string[],
    userId: string,
    format: TemplateExportFormat = 'json'
  ): Promise<{
    data: any;
    format: TemplateExportFormat;
  }> {
    // Implementation
  }

  /**
   * Import templates
   * @param userId User ID
   * @param data Import data
   * @param format Import format
   * @param options Import options
   * @returns Import results
   */
  async importTemplates(
    userId: string,
    data: any,
    format: TemplateExportFormat = 'json',
    options?: {
      overwriteExisting?: boolean;
      categoryId?: string;
    }
  ): Promise<TemplateImportResult> {
    // Implementation
  }

  /**
   * Get template versions
   * @param templateId Template ID
   * @param userId User ID
   * @returns List of template versions
   */
  async getTemplateVersions(
    templateId: string,
    userId: string
  ): Promise<TemplateVersion[]> {
    // Implementation
  }

  /**
   * Restore template version
   * @param templateId Template ID
   * @param versionId Version ID
   * @param userId User ID
   * @returns Updated template
   */
  async restoreTemplateVersion(
    templateId: string,
    versionId: string,
    userId: string
  ): Promise<TemplateWithDetails> {
    // Implementation
  }

  /**
   * Get template statistics
   * @param userId User ID
   * @returns Template usage statistics
   */
  async getTemplateStats(
    userId: string
  ): Promise<TemplateStats> {
    // Implementation
  }

  /**
   * Search templates
   * @param userId User ID
   * @param searchTerm Search term
   * @param options Query options
   * @returns Search results
   */
  async searchTemplates(
    userId: string,
    searchTerm: string,
    options?: TemplateQueryOptions
  ): Promise<{
    templates: TemplateWithDetails[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Check if user has access to template
   * @param templateId Template ID
   * @param userId User ID
   * @param requiredPermission Required permission level
   * @returns Whether user has access
   */
  private async hasTemplateAccess(
    templateId: string,
    userId: string,
    requiredPermission: 'VIEW' | 'EDIT' | 'OWNER' = 'VIEW'
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Compile template content
   * @param templateContent Template content
   * @returns Compiled template function
   */
  private compileTemplate(
    templateContent: string
  ): Handlebars.TemplateDelegate {
    // Implementation
  }

  /**
   * Process template variables and placeholders
   * @param content Template content
   * @returns Processed content with variable definitions
   */
  private processTemplateVariables(
    content: string
  ): { 
    processedContent: string;
    variables: string[];
  } {
    // Implementation
  }

  /**
   * Create a new template version
   * @param templateId Template ID
   * @param content Template content
   * @returns Created version
   */
  private async createTemplateVersion(
    templateId: string,
    content: string
  ): Promise<TemplateVersion> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new template successfully
- Should retrieve template by ID
- Should get all templates for a user
- Should update template successfully
- Should delete template
- Should render template with provided data
- Should create clip from template
- Should create template from clip
- Should share template with another user
- Should remove template sharing
- Should get shared templates for a user
- Should create template category
- Should update template category
- Should delete template category
- Should get template categories
- Should export templates
- Should import templates
- Should get template versions
- Should restore template version
- Should get template statistics
- Should search templates
- Should check if user has access to template
- Should compile template content
- Should process template variables
- Should create template version
- Should handle template rendering errors
- Should validate template data
- Should sanitize template content

### Integration Tests
- Should integrate with template repository for CRUD operations
- Should integrate with user repository for permission checks
- Should integrate with clip repository for clip creation
- Should maintain version history when updating templates
- Should enforce user permissions across operations
- Should handle concurrent template modifications
- Should perform proper error handling
- Should enforce data validation rules
- Should handle template categories correctly
- Should maintain proper template sharing permissions
- Should handle template imports and exports correctly
- Should render templates correctly with different data
- Should manage template versions correctly
- Should support different template formats

## Implementation Notes
1. **Template Management**:
   - Support multiple template formats (text, HTML, markdown, etc.)
   - Implement template categories for organization
   - Support template tagging for improved searchability
   - Implement template versioning for change tracking
   - Support template duplication and forking
   - Implement template favorites for quick access
   - Support bulk operations on templates
   - Track template usage statistics

2. **Template Rendering**:
   - Implement secure template rendering with Handlebars
   - Support dynamic variable substitution
   - Implement proper escaping for different output formats
   - Support conditional sections in templates
   - Implement template helpers for common operations
   - Support nested templates and partials
   - Validate template variables before rendering
   - Handle rendering errors gracefully

3. **Template Sharing and Permissions**:
   - Implement sharing templates with specific users
   - Support different permission levels (view, edit)
   - Implement template galleries for public templates
   - Support template recommendations
   - Implement notification system for shared templates
   - Track template sharing and usage
   - Support template cloning for shared templates
   - Implement version control for collaborative editing

4. **Performance and Scalability**:
   - Cache compiled templates for performance
   - Optimize template storage
   - Use efficient queries for template retrieval
   - Implement pagination for large template collections
   - Optimize rendering performance
   - Support batched operations for efficiency
   - Implement proper indexing for search operations
   - Support scaling for high-usage templates

5. **Security Considerations**:
   - Sanitize user input in templates
   - Prevent template injection attacks
   - Validate template data against schemas
   - Implement proper access controls
   - Secure template sharing mechanisms
   - Prevent excessive resource usage
   - Validate template imports for security
   - Implement rate limiting for template operations

6. **Error Handling and Edge Cases**:
   - Handle template compilation errors
   - Manage missing variables gracefully
   - Implement fallbacks for failed renders
   - Handle concurrent editing conflicts
   - Deal with circular template references
   - Manage large template collections efficiently
   - Support custom error messages
   - Implement validation for template structure

## Related Files
- src/models/interfaces/template.interface.ts
- src/repositories/template.repository.ts
- src/repositories/user.repository.ts
- src/repositories/clip.repository.ts
- src/controllers/template.controller.ts
- src/routes/template.routes.ts
- src/middleware/template-access.middleware.ts
- src/utils/template-helpers.ts
- src/config/template.config.ts
- src/services/clip.service.ts
