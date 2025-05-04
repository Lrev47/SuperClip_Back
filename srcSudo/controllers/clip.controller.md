# clip.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for clip-related operations in the SuperClip application. It serves as the API interface for all clipboard content operations, handling client requests for creating, retrieving, updating, and deleting clips, as well as managing clip metadata, tags, and folders. The controller validates incoming requests, delegates business logic to the clip service, and formats appropriate HTTP responses.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - express-validator (for request validation)
  - multer (for handling multipart/form-data)
  - http-status-codes
- Internal modules:
  - ../services/clip.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../models/interfaces/clip.interface.ts
  - ../config/api.config.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT, DELETE, PATCH) with parameters, query strings, request bodies, and authorization headers
- **Output**: HTTP responses with appropriate status codes, clip data in JSON format, error messages, and pagination metadata

## Data Types
```typescript
// Request validation schemas
const createClipSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  contentType: z.enum(['TEXT', 'CODE', 'AI_PROMPT', 'IMAGE_URL', 'RICH_TEXT', 'SNIPPET']).default('TEXT'),
  format: z.string().optional(),
  description: z.string().optional(),
  folderId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional()
});

const updateClipSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).optional(),
  contentType: z.enum(['TEXT', 'CODE', 'AI_PROMPT', 'IMAGE_URL', 'RICH_TEXT', 'SNIPPET']).optional(),
  format: z.string().optional(),
  description: z.string().optional(),
  folderId: z.string().uuid().optional().nullable(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional()
});

const clipQuerySchema = z.object({
  search: z.string().optional(),
  contentType: z.enum(['TEXT', 'CODE', 'AI_PROMPT', 'IMAGE_URL', 'RICH_TEXT', 'SNIPPET']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'lastUsed', 'useCount']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().int().positive().optional().default(20),
  page: z.number().int().positive().optional().default(1),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  from: z.string().optional(), // Date string
  to: z.string().optional(),   // Date string
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
import { ClipService } from '../services/clip.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';
import { CreateClipInput, UpdateClipInput, ClipQuery } from '../models/interfaces/clip.interface';
import { z } from 'zod';
import multer from 'multer';
import { ApiConfig } from '../config/api.config';

export class ClipController {
  private router: Router;
  private clipService: ClipService;
  private logger: Logger;
  private config: ApiConfig;
  private upload: multer.Multer;

  constructor(clipService: ClipService, logger: Logger, config: ApiConfig) {
    this.router = Router();
    this.clipService = clipService;
    this.logger = logger;
    this.config = config;
    this.upload = multer({ 
      limits: { 
        fileSize: this.config.maxFileSize 
      } 
    });
    this.setupRoutes();
  }

  /**
   * Setup all clip routes
   */
  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(authenticate);
    
    // Clip CRUD operations
    this.router.post('/', validateRequest(createClipSchema), this.createClip);
    this.router.get('/', this.getClips);
    this.router.get('/stats', this.getClipStats);
    this.router.get('/:id', this.getClipById);
    this.router.put('/:id', validateRequest(updateClipSchema), this.updateClip);
    this.router.patch('/:id/move', this.moveClipToFolder);
    this.router.delete('/:id', this.deleteClip);
    
    // Tag operations
    this.router.post('/:id/tags', this.addTagsToClip);
    this.router.delete('/:id/tags', this.removeTagsFromClip);
    
    // Bulk operations
    this.router.post('/bulk/delete', this.bulkDeleteClips);
    this.router.post('/bulk/favorite', this.bulkFavoriteClips);
    this.router.post('/bulk/move', this.bulkMoveClips);
    
    // Folder-specific clip operations
    this.router.get('/folder/:folderId', this.getClipsByFolder);
    
    // Tag-specific clip operations
    this.router.get('/tag/:tagName', this.getClipsByTag);
    
    // Upload attachment/file for clip
    this.router.post('/:id/attachment', this.upload.single('file'), this.uploadClipAttachment);
    
    // Sync-related endpoints
    this.router.post('/sync', this.syncClips);
    this.router.get('/device/:deviceId', this.getClipsForDevice);
    
    // Increment clip usage count
    this.router.post('/:id/use', this.incrementClipUsage);
  }

  /**
   * Create a new clip
   * @param req Express request
   * @param res Express response
   */
  private createClip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const deviceId = req.headers['x-device-id'] as string;
    const clipData: CreateClipInput = req.body;
    
    const result = await this.clipService.createClip(userId, deviceId, clipData);
    
    res.status(StatusCodes.CREATED).json(result);
  });

  /**
   * Get clips with filtering and pagination
   * @param req Express request
   * @param res Express response
   */
  private getClips = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const queryParams = clipQuerySchema.parse(req.query);
    
    const clips = await this.clipService.getUserClips(userId, queryParams);
    
    // Calculate pagination metadata
    const totalItems = await this.clipService.countUserClips(userId, queryParams);
    const totalPages = Math.ceil(totalItems / queryParams.limit);
    
    res.status(StatusCodes.OK).json({
      data: clips,
      meta: {
        currentPage: queryParams.page,
        totalPages,
        totalItems,
        pageSize: queryParams.limit
      }
    });
  });

  /**
   * Get clip by ID
   * @param req Express request
   * @param res Express response
   */
  private getClipById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    const clip = await this.clipService.getClipById(id, userId);
    
    if (!clip) {
      throw new AppError('Clip not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(clip);
  });

  /**
   * Update clip
   * @param req Express request
   * @param res Express response
   */
  private updateClip = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData: UpdateClipInput = req.body;
    
    const updatedClip = await this.clipService.updateClip(id, userId, updateData);
    
    res.status(StatusCodes.OK).json(updatedClip);
  });

  /**
   * Delete clip
   * @param req Express request
   * @param res Express response
   */
  private deleteClip = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const permanently = req.query.permanently === 'true';
    
    await this.clipService.deleteClip(id, userId, permanently);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Move clip to folder
   * @param req Express request
   * @param res Express response
   */
  private moveClipToFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { folderId } = req.body;
    const userId = req.user.id;
    
    const updatedClip = await this.clipService.moveClipToFolder(id, folderId, userId);
    
    res.status(StatusCodes.OK).json(updatedClip);
  });

  /**
   * Add tags to clip
   * @param req Express request
   * @param res Express response
   */
  private addTagsToClip = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tags } = req.body;
    const userId = req.user.id;
    
    const updatedClip = await this.clipService.addTagsToClip(id, tags, userId);
    
    res.status(StatusCodes.OK).json(updatedClip);
  });

  /**
   * Remove tags from clip
   * @param req Express request
   * @param res Express response
   */
  private removeTagsFromClip = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tags } = req.body;
    const userId = req.user.id;
    
    const updatedClip = await this.clipService.removeTagsFromClip(id, tags, userId);
    
    res.status(StatusCodes.OK).json(updatedClip);
  });

  /**
   * Get clips by folder
   * @param req Express request
   * @param res Express response
   */
  private getClipsByFolder = asyncHandler(async (req: Request, res: Response) => {
    const { folderId } = req.params;
    const userId = req.user.id;
    const queryParams = clipQuerySchema.parse(req.query);
    
    const clips = await this.clipService.getClipsByFolder(folderId, userId, queryParams);
    
    // Calculate pagination metadata
    const totalItems = await this.clipService.countClipsByFolder(folderId, userId, queryParams);
    const totalPages = Math.ceil(totalItems / queryParams.limit);
    
    res.status(StatusCodes.OK).json({
      data: clips,
      meta: {
        currentPage: queryParams.page,
        totalPages,
        totalItems,
        pageSize: queryParams.limit
      }
    });
  });

  /**
   * Get clips by tag
   * @param req Express request
   * @param res Express response
   */
  private getClipsByTag = asyncHandler(async (req: Request, res: Response) => {
    const { tagName } = req.params;
    const userId = req.user.id;
    const queryParams = clipQuerySchema.parse(req.query);
    
    const clips = await this.clipService.getClipsByTag(tagName, userId, queryParams);
    
    // Calculate pagination metadata
    const totalItems = await this.clipService.countClipsByTag(tagName, userId, queryParams);
    const totalPages = Math.ceil(totalItems / queryParams.limit);
    
    res.status(StatusCodes.OK).json({
      data: clips,
      meta: {
        currentPage: queryParams.page,
        totalPages,
        totalItems,
        pageSize: queryParams.limit
      }
    });
  });

  /**
   * Get clip statistics
   * @param req Express request
   * @param res Express response
   */
  private getClipStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const stats = await this.clipService.getClipStats(userId);
    
    res.status(StatusCodes.OK).json(stats);
  });

  /**
   * Bulk delete clips
   * @param req Express request
   * @param res Express response
   */
  private bulkDeleteClips = asyncHandler(async (req: Request, res: Response) => {
    const { clipIds, permanently } = req.body;
    const userId = req.user.id;
    
    const result = await this.clipService.bulkDeleteClips(clipIds, userId, permanently);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Bulk favorite/unfavorite clips
   * @param req Express request
   * @param res Express response
   */
  private bulkFavoriteClips = asyncHandler(async (req: Request, res: Response) => {
    const { clipIds, isFavorite } = req.body;
    const userId = req.user.id;
    
    const result = await this.clipService.bulkUpdateFavoriteStatus(clipIds, userId, isFavorite);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Bulk move clips to folder
   * @param req Express request
   * @param res Express response
   */
  private bulkMoveClips = asyncHandler(async (req: Request, res: Response) => {
    const { clipIds, folderId } = req.body;
    const userId = req.user.id;
    
    const result = await this.clipService.bulkMoveClipsToFolder(clipIds, folderId, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Upload attachment for clip
   * @param req Express request
   * @param res Express response
   */
  private uploadClipAttachment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;
    
    if (!file) {
      throw new AppError('No file uploaded', ErrorCode.BAD_REQUEST);
    }
    
    const updatedClip = await this.clipService.addAttachmentToClip(id, userId, file);
    
    res.status(StatusCodes.OK).json(updatedClip);
  });

  /**
   * Sync clips with device
   * @param req Express request
   * @param res Express response
   */
  private syncClips = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const deviceId = req.headers['x-device-id'] as string;
    const { clips, lastSyncTimestamp } = req.body;
    
    const syncResult = await this.clipService.syncClips(userId, deviceId, clips, lastSyncTimestamp);
    
    res.status(StatusCodes.OK).json(syncResult);
  });

  /**
   * Get clips for specific device
   * @param req Express request
   * @param res Express response
   */
  private getClipsForDevice = asyncHandler(async (req: Request, res: Response) => {
    const { deviceId } = req.params;
    const userId = req.user.id;
    const timestamp = req.query.since ? new Date(req.query.since as string) : undefined;
    
    const clips = await this.clipService.getClipsForDevice(userId, deviceId, timestamp);
    
    res.status(StatusCodes.OK).json(clips);
  });

  /**
   * Increment clip usage count
   * @param req Express request
   * @param res Express response
   */
  private incrementClipUsage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const deviceId = req.headers['x-device-id'] as string;
    
    await this.clipService.incrementClipUsage(id, userId, deviceId);
    
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

export default ClipController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes

2. **Request Validation**
   - Should validate create clip request (test all required fields)
   - Should validate update clip request
   - Should validate query parameters

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the correct response format
     - Handle errors properly

4. **Authorization**
   - Should check if user is authenticated
   - Should verify user has access to requested clip

5. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should handle not found errors

### Integration Tests
1. **Clip Creation**
   - Should create a clip and return 201 status
   - Should reject invalid clip data with 400 status

2. **Clip Retrieval**
   - Should retrieve a clip by ID
   - Should return 404 for non-existent clip
   - Should return list of clips with proper pagination

3. **Clip Updates**
   - Should update a clip and return 200 status
   - Should reject invalid update data with 400 status

4. **Clip Deletion**
   - Should delete a clip and return 204 status
   - Should return 404 for non-existent clip

5. **Tag Operations**
   - Should add tags to a clip
   - Should remove tags from a clip

6. **Folder Operations**
   - Should move a clip to a folder
   - Should get clips by folder ID

7. **Bulk Operations**
   - Should bulk delete clips
   - Should bulk favorite/unfavorite clips
   - Should bulk move clips to folder

8. **File Upload**
   - Should upload an attachment to a clip
   - Should reject files exceeding size limit

9. **Synchronization**
   - Should sync clips between devices
   - Should get clips for a specific device

## Implementation Notes

### Error Handling and Logging
- Use consistent error handling across all endpoints
- Log important events (creation, deletion, sync issues)
- Return appropriate HTTP status codes and error messages
- Implement proper validation for all incoming requests
- Use try-catch blocks in addition to the async handler for critical operations

### Security Considerations
- Verify user owns the clip before allowing operations
- Sanitize user input to prevent injection attacks
- Validate file uploads (size, type, content)
- Set proper limits on bulk operations
- Implement rate limiting for API endpoints
- Validate device IDs against user's registered devices

### Performance Optimization
- Use pagination for list endpoints
- Limit bulk operation size
- Cache frequently accessed clip data
- Optimize database queries by selecting only necessary fields
- Implement conditional requests (ETag, If-Modified-Since)

### API Documentation
- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Document error responses
- Document rate limits and pagination

### Edge Cases
- Handle large clip content
- Manage concurrent updates to the same clip
- Handle sync conflicts between devices
- Manage deleted items across device sync
- Handle offline/online transitions
- Process file uploads with various content types

## Related Files
- srcSudo/services/clip.service.ts
- srcSudo/models/interfaces/clip.interface.ts
- srcSudo/routes/clip.routes.ts
- srcSudo/repositories/clip.repository.ts
- srcSudo/middlewares/auth.middleware.ts
- srcSudo/utils/async-handler.ts
- srcSudo/utils/error.ts
- srcSudo/config/api.config.ts
