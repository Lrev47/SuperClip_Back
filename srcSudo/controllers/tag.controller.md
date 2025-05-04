# tag.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for tag-related operations in the SuperClip application. It provides the API interface for creating, retrieving, updating, and deleting tags that users can use to categorize and organize their clips. The controller handles tag management, tag relationships, bulk tag operations, and tag-based filtering for clips. It validates incoming requests, delegates business logic to the tag service, and formats appropriate HTTP responses.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - express-validator (for request validation)
  - http-status-codes
- Internal modules:
  - ../services/tag.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../models/interfaces/tag.interface.ts
  - ../config/api.config.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT, DELETE, PATCH) with parameters, query strings, request bodies, and authorization headers
- **Output**: HTTP responses with appropriate status codes, tag data in JSON format, error messages, and pagination metadata

## Data Types
```typescript
// Request validation schemas
const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional()
});

const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional()
});

const tagQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'usage']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  limit: z.number().int().positive().optional().default(20),
  page: z.number().int().positive().optional().default(1)
});

const mergeTagsSchema = z.object({
  sourceTagIds: z.array(z.string().uuid()).min(1),
  targetTagId: z.string().uuid()
});

const splitTagSchema = z.object({
  sourceTagId: z.string().uuid(),
  newTags: z.array(
    z.object({
      name: z.string().min(1).max(50),
      color: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional()
    })
  ).min(1)
});

const addTagsToClipSchema = z.object({
  tagNames: z.array(z.string()).min(1)
});

// Pagination response interface
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}
```

## API/Methods
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TagService } from '../services/tag.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';
import { 
  CreateTagInput, 
  UpdateTagInput, 
  TagQueryOptions 
} from '../models/interfaces/tag.interface';
import { z } from 'zod';
import { ApiConfig } from '../config/api.config';

export class TagController {
  private router: Router;
  private tagService: TagService;
  private logger: Logger;
  private config: ApiConfig;

  constructor(tagService: TagService, logger: Logger, config: ApiConfig) {
    this.router = Router();
    this.tagService = tagService;
    this.logger = logger;
    this.config = config;
    this.setupRoutes();
  }

  /**
   * Setup all tag routes
   */
  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(authenticate);
    
    // Tag CRUD operations
    this.router.post('/', validateRequest(createTagSchema), this.createTag);
    this.router.get('/', this.getUserTags);
    this.router.get('/stats', this.getTagStats);
    this.router.get('/suggestions', this.getTagSuggestions);
    this.router.get('/:id', this.getTagById);
    this.router.get('/name/:name', this.getTagByName);
    this.router.put('/:id', validateRequest(updateTagSchema), this.updateTag);
    this.router.delete('/:id', this.deleteTag);
    
    // Tag operations
    this.router.post('/merge', validateRequest(mergeTagsSchema), this.mergeTags);
    this.router.post('/split', validateRequest(splitTagSchema), this.splitTag);
    
    // Clip-related tag operations
    this.router.get('/clip/:clipId', this.getClipTags);
    this.router.post('/clip/:clipId', validateRequest(addTagsToClipSchema), this.addTagsToClip);
    this.router.delete('/clip/:clipId', this.removeTagsFromClip);
    
    // Related tags
    this.router.get('/:id/related', this.getRelatedTags);
    this.router.post('/:id/related/:relatedId', this.addRelatedTag);
    this.router.delete('/:id/related/:relatedId', this.removeRelatedTag);
    
    // Tag categories
    this.router.get('/categories', this.getTagCategories);
    this.router.post('/categories', this.createTagCategory);
    this.router.put('/categories/:id', this.updateTagCategory);
    this.router.delete('/categories/:id', this.deleteTagCategory);
  }

  /**
   * Create a new tag
   * @param req Express request
   * @param res Express response
   */
  private createTag = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const tagData: CreateTagInput = req.body;
    
    const result = await this.tagService.createTag(userId, tagData);
    
    res.status(StatusCodes.CREATED).json(result);
  });

  /**
   * Get all user's tags with filtering and pagination
   * @param req Express request
   * @param res Express response
   */
  private getUserTags = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const queryParams = tagQuerySchema.parse(req.query) as TagQueryOptions;
    
    const result = await this.tagService.getUserTags(userId, queryParams);
    
    res.status(StatusCodes.OK).json({
      data: result.tags,
      meta: {
        currentPage: result.page,
        totalPages: Math.ceil(result.total / result.pageSize),
        totalItems: result.total,
        pageSize: result.pageSize
      }
    });
  });

  /**
   * Get tag by ID
   * @param req Express request
   * @param res Express response
   */
  private getTagById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    const tag = await this.tagService.getTagById(id, userId);
    
    if (!tag) {
      throw new AppError('Tag not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(tag);
  });

  /**
   * Get tag by name
   * @param req Express request
   * @param res Express response
   */
  private getTagByName = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const userId = req.user.id;
    
    const tag = await this.tagService.getTagByName(name, userId);
    
    if (!tag) {
      throw new AppError('Tag not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(tag);
  });

  /**
   * Update tag
   * @param req Express request
   * @param res Express response
   */
  private updateTag = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData: UpdateTagInput = req.body;
    
    const updatedTag = await this.tagService.updateTag(id, userId, updateData);
    
    res.status(StatusCodes.OK).json(updatedTag);
  });

  /**
   * Delete tag
   * @param req Express request
   * @param res Express response
   */
  private deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    await this.tagService.deleteTag(id, userId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Merge tags
   * @param req Express request
   * @param res Express response
   */
  private mergeTags = asyncHandler(async (req: Request, res: Response) => {
    const { sourceTagIds, targetTagId } = req.body;
    const userId = req.user.id;
    
    const result = await this.tagService.mergeTags(sourceTagIds, targetTagId, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Split tag
   * @param req Express request
   * @param res Express response
   */
  private splitTag = asyncHandler(async (req: Request, res: Response) => {
    const { sourceTagId, newTags } = req.body;
    const userId = req.user.id;
    
    const result = await this.tagService.splitTag(sourceTagId, newTags, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Get tags for a clip
   * @param req Express request
   * @param res Express response
   */
  private getClipTags = asyncHandler(async (req: Request, res: Response) => {
    const { clipId } = req.params;
    const userId = req.user.id;
    
    const tags = await this.tagService.getClipTags(clipId, userId);
    
    res.status(StatusCodes.OK).json(tags);
  });

  /**
   * Add tags to clip
   * @param req Express request
   * @param res Express response
   */
  private addTagsToClip = asyncHandler(async (req: Request, res: Response) => {
    const { clipId } = req.params;
    const { tagNames } = req.body;
    const userId = req.user.id;
    
    const result = await this.tagService.addTagsToClip(clipId, tagNames, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Remove tags from clip
   * @param req Express request
   * @param res Express response
   */
  private removeTagsFromClip = asyncHandler(async (req: Request, res: Response) => {
    const { clipId } = req.params;
    const { tagIds } = req.body;
    const userId = req.user.id;
    
    await this.tagService.removeTagsFromClip(clipId, tagIds, userId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Get tag statistics
   * @param req Express request
   * @param res Express response
   */
  private getTagStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const stats = await this.tagService.getTagStats(userId);
    
    res.status(StatusCodes.OK).json(stats);
  });

  /**
   * Get tag suggestions
   * @param req Express request
   * @param res Express response
   */
  private getTagSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { content, limit } = req.query;
    
    const suggestions = await this.tagService.getTagSuggestions(
      userId, 
      content as string, 
      limit ? parseInt(limit as string) : undefined
    );
    
    res.status(StatusCodes.OK).json(suggestions);
  });

  /**
   * Get related tags
   * @param req Express request
   * @param res Express response
   */
  private getRelatedTags = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    const relatedTags = await this.tagService.getRelatedTags(id, userId);
    
    res.status(StatusCodes.OK).json(relatedTags);
  });

  /**
   * Add related tag
   * @param req Express request
   * @param res Express response
   */
  private addRelatedTag = asyncHandler(async (req: Request, res: Response) => {
    const { id, relatedId } = req.params;
    const userId = req.user.id;
    const { relationType } = req.body;
    
    const result = await this.tagService.addRelatedTag(id, relatedId, userId, relationType);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Remove related tag
   * @param req Express request
   * @param res Express response
   */
  private removeRelatedTag = asyncHandler(async (req: Request, res: Response) => {
    const { id, relatedId } = req.params;
    const userId = req.user.id;
    
    await this.tagService.removeRelatedTag(id, relatedId, userId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Get tag categories
   * @param req Express request
   * @param res Express response
   */
  private getTagCategories = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const categories = await this.tagService.getTagCategories(userId);
    
    res.status(StatusCodes.OK).json(categories);
  });

  /**
   * Create tag category
   * @param req Express request
   * @param res Express response
   */
  private createTagCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const categoryData = req.body;
    
    const result = await this.tagService.createTagCategory(userId, categoryData);
    
    res.status(StatusCodes.CREATED).json(result);
  });

  /**
   * Update tag category
   * @param req Express request
   * @param res Express response
   */
  private updateTagCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    const result = await this.tagService.updateTagCategory(id, userId, updateData);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Delete tag category
   * @param req Express request
   * @param res Express response
   */
  private deleteTagCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    await this.tagService.deleteTagCategory(id, userId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Get router
   * @returns Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default TagController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes

2. **Request Validation**
   - Should validate create tag request
   - Should validate update tag request
   - Should validate query parameters
   - Should validate merge tags request
   - Should validate split tag request

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the correct response format
     - Handle errors properly

4. **Authorization**
   - Should check if user is authenticated
   - Should verify user has access to requested tags

5. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should handle not found errors

### Integration Tests
1. **Tag Creation**
   - Should create a tag and return 201 status
   - Should reject invalid tag data with 400 status
   - Should handle duplicate tag names appropriately

2. **Tag Retrieval**
   - Should retrieve a tag by ID
   - Should retrieve a tag by name
   - Should return 404 for non-existent tag
   - Should return list of tags with proper pagination

3. **Tag Updates**
   - Should update a tag and return 200 status
   - Should reject invalid update data with 400 status

4. **Tag Deletion**
   - Should delete a tag and return 204 status
   - Should return 404 for non-existent tag

5. **Tag Operations**
   - Should merge tags successfully
   - Should split tag into multiple new tags
   - Should get related tags
   - Should add/remove tag relationships

6. **Clip-Tag Operations**
   - Should add tags to clip
   - Should remove tags from clip
   - Should get tags for a clip

7. **Tag Categories**
   - Should retrieve tag categories
   - Should create, update and delete tag categories

8. **Tag Suggestions**
   - Should return appropriate tag suggestions based on content
   - Should limit suggestions based on request parameters

## Implementation Notes

### Error Handling and Logging
- Use consistent error handling across all endpoints
- Log important events (creation, deletion, merging)
- Return appropriate HTTP status codes and error messages
- Implement proper validation for all incoming requests
- Use try-catch blocks in addition to the async handler for critical operations

### Security Considerations
- Verify user owns the tags before allowing operations
- Validate input to prevent injection attacks
- Set proper limits on bulk operations
- Implement rate limiting for tag creation
- Sanitize tag names to prevent XSS

### Performance Optimization
- Use pagination for list endpoints
- Cache frequently used tag data
- Optimize tag suggestion algorithms
- Implement efficient tag merging operations
- Index tag names and related fields in the database

### API Documentation
- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Document error responses
- Document rate limits and pagination

### Edge Cases
- Handle duplicate tag names gracefully
- Manage tag character limits and validation
- Handle special characters in tag names
- Optimize for high-volume tag operations
- Handle migration of content when tags are merged or split

## Related Files
- srcSudo/services/tag.service.ts
- srcSudo/models/interfaces/tag.interface.ts
- srcSudo/routes/tag.routes.ts
- srcSudo/repositories/tag.repository.ts
- srcSudo/middlewares/auth.middleware.ts
- srcSudo/utils/async-handler.ts
- srcSudo/utils/error.ts
- srcSudo/config/api.config.ts
