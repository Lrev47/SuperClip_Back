# folder.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for folder-related operations in the SuperClip application. It provides the API interface for creating, retrieving, updating, and deleting folders, as well as managing folder hierarchies, permissions, and the organization of clips within folders. The controller validates incoming requests, delegates business logic to the folder service, and formats appropriate HTTP responses with proper status codes.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - express-validator (for request validation)
  - http-status-codes
- Internal modules:
  - ../services/folder.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../models/interfaces/folder.interface.ts
  - ../config/api.config.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT, DELETE, PATCH) with parameters, query strings, request bodies, and authorization headers
- **Output**: HTTP responses with appropriate status codes, folder data in JSON format, error messages, and pagination metadata

## Data Types
```typescript
// Request validation schemas
const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().uuid().optional().nullable()
});

const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable()
});

const folderQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  limit: z.number().int().positive().optional().default(20),
  page: z.number().int().positive().optional().default(1)
});

const shareFolderSchema = z.object({
  targetUserId: z.string().uuid(),
  permissionLevel: z.enum(['READ', 'WRITE', 'ADMIN'])
});

const addClipsSchema = z.object({
  clipIds: z.array(z.string().uuid()).min(1)
});

const deleteFolderOptionsSchema = z.object({
  forceDelete: z.boolean().optional().default(false),
  moveContentsToParent: z.boolean().optional().default(true)
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
import { FolderService } from '../services/folder.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';
import { 
  FolderCreateData, 
  FolderUpdateData, 
  FolderQueryOptions,
  FolderPermissionLevel
} from '../models/interfaces/folder.interface';
import { z } from 'zod';
import { ApiConfig } from '../config/api.config';

export class FolderController {
  private router: Router;
  private folderService: FolderService;
  private logger: Logger;
  private config: ApiConfig;

  constructor(folderService: FolderService, logger: Logger, config: ApiConfig) {
    this.router = Router();
    this.folderService = folderService;
    this.logger = logger;
    this.config = config;
    this.setupRoutes();
  }

  /**
   * Setup all folder routes
   */
  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(authenticate);
    
    // Folder CRUD operations
    this.router.post('/', validateRequest(createFolderSchema), this.createFolder);
    this.router.get('/', this.getUserFolders);
    this.router.get('/roots', this.getRootFolders);
    this.router.get('/hierarchy', this.getFolderHierarchy);
    this.router.get('/stats', this.getFolderStats);
    this.router.get('/:id', this.getFolderById);
    this.router.put('/:id', validateRequest(updateFolderSchema), this.updateFolder);
    this.router.delete('/:id', this.deleteFolder);
    
    // Folder hierarchy operations
    this.router.patch('/:id/move', this.moveFolder);
    
    // Clip management in folders
    this.router.post('/:id/clips', validateRequest(addClipsSchema), this.addClipsToFolder);
    this.router.delete('/:id/clips', validateRequest(addClipsSchema), this.removeClipsFromFolder);
    
    // Folder sharing and permissions
    this.router.post('/:id/share', validateRequest(shareFolderSchema), this.shareFolder);
    this.router.get('/:id/permissions', this.getFolderPermissions);
    this.router.put('/:id/permissions/:userId', this.updateFolderPermission);
    this.router.delete('/:id/permissions/:userId', this.removeFolderPermission);
  }

  /**
   * Create a new folder
   * @param req Express request
   * @param res Express response
   */
  private createFolder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const folderData: FolderCreateData = req.body;
    
    const result = await this.folderService.createFolder(userId, folderData);
    
    res.status(StatusCodes.CREATED).json(result);
  });

  /**
   * Get all user's folders with filtering and pagination
   * @param req Express request
   * @param res Express response
   */
  private getUserFolders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const queryParams = folderQuerySchema.parse(req.query) as FolderQueryOptions;
    
    const result = await this.folderService.getUserFolders(userId, queryParams);
    
    res.status(StatusCodes.OK).json({
      data: result.folders,
      meta: {
        currentPage: result.page,
        totalPages: Math.ceil(result.total / result.pageSize),
        totalItems: result.total,
        pageSize: result.pageSize
      }
    });
  });

  /**
   * Get user's root folders
   * @param req Express request
   * @param res Express response
   */
  private getRootFolders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const queryParams = folderQuerySchema.parse(req.query) as FolderQueryOptions;
    
    const result = await this.folderService.getUserRootFolders(userId, queryParams);
    
    res.status(StatusCodes.OK).json({
      data: result.folders,
      meta: {
        currentPage: result.page,
        totalPages: Math.ceil(result.total / result.pageSize),
        totalItems: result.total,
        pageSize: result.pageSize
      }
    });
  });

  /**
   * Get folder hierarchy
   * @param req Express request
   * @param res Express response
   */
  private getFolderHierarchy = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const rootFolderId = req.query.rootId as string | undefined;
    
    const hierarchy = await this.folderService.getFolderHierarchy(userId, rootFolderId);
    
    res.status(StatusCodes.OK).json(hierarchy);
  });

  /**
   * Get folder by ID
   * @param req Express request
   * @param res Express response
   */
  private getFolderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    const folder = await this.folderService.getFolderById(id, userId);
    
    if (!folder) {
      throw new AppError('Folder not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(folder);
  });

  /**
   * Update folder
   * @param req Express request
   * @param res Express response
   */
  private updateFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData: FolderUpdateData = req.body;
    
    const updatedFolder = await this.folderService.updateFolder(id, userId, updateData);
    
    res.status(StatusCodes.OK).json(updatedFolder);
  });

  /**
   * Delete folder
   * @param req Express request
   * @param res Express response
   */
  private deleteFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const options = deleteFolderOptionsSchema.parse(req.query);
    
    const result = await this.folderService.deleteFolder(id, userId, options);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Move folder to a new parent
   * @param req Express request
   * @param res Express response
   */
  private moveFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetParentId } = req.body;
    const userId = req.user.id;
    
    const result = await this.folderService.moveFolder(id, targetParentId, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Add clips to folder
   * @param req Express request
   * @param res Express response
   */
  private addClipsToFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { clipIds } = req.body;
    const userId = req.user.id;
    
    const result = await this.folderService.addClipsToFolder(id, clipIds, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Remove clips from folder
   * @param req Express request
   * @param res Express response
   */
  private removeClipsFromFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { clipIds } = req.body;
    const userId = req.user.id;
    
    const result = await this.folderService.removeClipsFromFolder(id, clipIds, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Share folder with another user
   * @param req Express request
   * @param res Express response
   */
  private shareFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetUserId, permissionLevel } = req.body;
    const ownerId = req.user.id;
    
    const result = await this.folderService.shareFolder(
      id, 
      ownerId, 
      targetUserId, 
      permissionLevel as FolderPermissionLevel
    );
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Get folder permissions
   * @param req Express request
   * @param res Express response
   */
  private getFolderPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    const permissions = await this.folderService.getFolderPermissions(id, userId);
    
    res.status(StatusCodes.OK).json(permissions);
  });

  /**
   * Update folder permission
   * @param req Express request
   * @param res Express response
   */
  private updateFolderPermission = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId: targetUserId } = req.params;
    const ownerId = req.user.id;
    const { permissionLevel } = req.body;
    
    const result = await this.folderService.updateFolderPermission(
      id,
      ownerId,
      targetUserId,
      permissionLevel as FolderPermissionLevel
    );
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Remove folder permission
   * @param req Express request
   * @param res Express response
   */
  private removeFolderPermission = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId: targetUserId } = req.params;
    const ownerId = req.user.id;
    
    await this.folderService.removeFolderPermission(id, ownerId, targetUserId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Get folder statistics
   * @param req Express request
   * @param res Express response
   */
  private getFolderStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const stats = await this.folderService.getFolderStats(userId);
    
    res.status(StatusCodes.OK).json(stats);
  });

  /**
   * Get router
   * @returns Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default FolderController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes

2. **Request Validation**
   - Should validate create folder request (test all required fields)
   - Should validate update folder request
   - Should validate query parameters
   - Should validate share folder request

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the correct response format
     - Handle errors properly

4. **Authorization**
   - Should check if user is authenticated
   - Should verify user has access to requested folder

5. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should handle not found errors
   - Should handle permission errors

### Integration Tests
1. **Folder Creation**
   - Should create a folder and return 201 status
   - Should reject invalid folder data with 400 status

2. **Folder Retrieval**
   - Should retrieve a folder by ID
   - Should return 404 for non-existent folder
   - Should return list of folders with proper pagination
   - Should return folder hierarchy

3. **Folder Updates**
   - Should update a folder and return 200 status
   - Should reject invalid update data with 400 status

4. **Folder Deletion**
   - Should delete a folder and return 200 status
   - Should move contents to parent when specified
   - Should delete contents when force delete is true
   - Should return 404 for non-existent folder

5. **Folder Hierarchy**
   - Should move a folder to a new parent
   - Should prevent circular references in folder hierarchy
   - Should handle root folder moves correctly

6. **Clip Management**
   - Should add clips to a folder
   - Should remove clips from a folder

7. **Folder Sharing**
   - Should share a folder with another user
   - Should update folder permissions
   - Should remove folder permissions
   - Should enforce proper permission levels

## Implementation Notes

### Error Handling and Logging
- Use consistent error handling across all endpoints
- Log important events (creation, deletion, permission changes)
- Return appropriate HTTP status codes and error messages
- Implement proper validation for all incoming requests
- Use try-catch blocks in addition to the async handler for critical operations

### Security Considerations
- Verify user owns the folder or has appropriate permissions before allowing operations
- Validate parent-child relationships to prevent circular references
- Implement proper permission checks for all operations
- Handle folder sharing securely
- Prevent unauthorized access to folder contents

### Performance Optimization
- Use pagination for list endpoints
- Optimize folder hierarchy retrieval for deep nesting
- Implement efficient queries for folder content listings
- Consider caching for frequently accessed folder structures
- Use database transactions for multi-step operations

### API Documentation
- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Document permission requirements for each endpoint
- Document error responses

### Edge Cases
- Handle nested folder deletion carefully
- Manage orphaned clips when folders are deleted
- Handle permission inheritance for nested folders
- Manage folder sharing conflicts
- Handle concurrent folder operations

## Related Files
- srcSudo/services/folder.service.ts
- srcSudo/models/interfaces/folder.interface.ts
- srcSudo/routes/folder.routes.ts
- srcSudo/repositories/folder.repository.ts
- srcSudo/middlewares/auth.middleware.ts
- srcSudo/utils/async-handler.ts
- srcSudo/utils/error.ts
- srcSudo/config/api.config.ts
