# folders.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for managing folders in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the folder controller and applies necessary middleware for authentication, validation, and security. The routes provide functionality for creating, retrieving, updating, and deleting folders, as well as managing folder hierarchies, permissions, and contents.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/folder.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/subscription.middleware.ts

## Route Definitions

### Create Folder

- **Method**: POST
- **Path**: `/api/v1/folders`
- **Description**: Create a new folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates folder creation data)
  - checkFolderLimit (verifies user has not exceeded folder limit based on subscription)
  - trackUsage('folders') (tracks folder usage for the user)
- **Controller**: FolderController.createFolder
- **Auth Required**: Yes

### Get User Folders

- **Method**: GET
- **Path**: `/api/v1/folders`
- **Description**: Get all folders owned by the authenticated user
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: FolderController.getUserFolders
- **Auth Required**: Yes

### Get Folder

- **Method**: GET
- **Path**: `/api/v1/folders/:folderId`
- **Description**: Get details for a specific folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: FolderController.getFolder
- **Auth Required**: Yes

### Update Folder

- **Method**: PUT
- **Path**: `/api/v1/folders/:folderId`
- **Description**: Update a folder's name, description, or metadata
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - validateBody (validates update data)
  - checkFolderOwnership (verifies user owns the folder)
- **Controller**: FolderController.updateFolder
- **Auth Required**: Yes

### Delete Folder

- **Method**: DELETE
- **Path**: `/api/v1/folders/:folderId`
- **Description**: Delete a folder and optionally its contents
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - validateQuery (validates delete options)
  - checkFolderOwnership (verifies user owns the folder)
- **Controller**: FolderController.deleteFolder
- **Auth Required**: Yes

### Get Folder Contents

- **Method**: GET
- **Path**: `/api/v1/folders/:folderId/contents`
- **Description**: Get all clips and subfolders within a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - validateQuery (validates pagination and filter parameters)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: FolderController.getFolderContents
- **Auth Required**: Yes

### Move Folder

- **Method**: PATCH
- **Path**: `/api/v1/folders/:folderId/move`
- **Description**: Move a folder to another parent folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - validateBody (validates destination folder ID)
  - checkFolderOwnership (verifies user owns the folder)
  - checkFolderAccess (verifies user has access to the destination folder)
  - checkCircularReference (prevents circular folder references)
- **Controller**: FolderController.moveFolder
- **Auth Required**: Yes

### Share Folder

- **Method**: POST
- **Path**: `/api/v1/folders/:folderId/share`
- **Description**: Share a folder with other users
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - validateBody (validates share data)
  - checkFolderOwnership (verifies user owns the folder)
  - requireFeatureAccess('folder_sharing') (verifies user has folder sharing feature access)
- **Controller**: FolderController.shareFolder
- **Auth Required**: Yes

### Update Folder Share

- **Method**: PUT
- **Path**: `/api/v1/folders/:folderId/share/:shareId`
- **Description**: Update sharing permissions for a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID and share ID)
  - validateBody (validates share update data)
  - checkFolderOwnership (verifies user owns the folder)
- **Controller**: FolderController.updateFolderShare
- **Auth Required**: Yes

### Revoke Folder Share

- **Method**: DELETE
- **Path**: `/api/v1/folders/:folderId/share/:shareId`
- **Description**: Revoke sharing for a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID and share ID)
  - checkFolderOwnership (verifies user owns the folder)
- **Controller**: FolderController.revokeFolderShare
- **Auth Required**: Yes

### Get Folder Shares

- **Method**: GET
- **Path**: `/api/v1/folders/:folderId/shares`
- **Description**: Get all shares for a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - checkFolderOwnership (verifies user owns the folder)
- **Controller**: FolderController.getFolderShares
- **Auth Required**: Yes

### Add Clip to Folder

- **Method**: POST
- **Path**: `/api/v1/folders/:folderId/clips/:clipId`
- **Description**: Add a clip to a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID and clip ID)
  - checkFolderAccess (verifies user has access to the folder)
  - checkClipAccess (verifies user has access to the clip)
- **Controller**: FolderController.addClipToFolder
- **Auth Required**: Yes

### Remove Clip from Folder

- **Method**: DELETE
- **Path**: `/api/v1/folders/:folderId/clips/:clipId`
- **Description**: Remove a clip from a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID and clip ID)
  - checkFolderAccess (verifies user has access to the folder)
  - checkClipAccess (verifies user has access to the clip)
- **Controller**: FolderController.removeClipFromFolder
- **Auth Required**: Yes

### Get Folder Path

- **Method**: GET
- **Path**: `/api/v1/folders/:folderId/path`
- **Description**: Get the full path to a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: FolderController.getFolderPath
- **Auth Required**: Yes

### Star Folder

- **Method**: POST
- **Path**: `/api/v1/folders/:folderId/star`
- **Description**: Star/favorite a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: FolderController.starFolder
- **Auth Required**: Yes

### Unstar Folder

- **Method**: DELETE
- **Path**: `/api/v1/folders/:folderId/star`
- **Description**: Remove star/favorite from a folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates folder ID)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: FolderController.unstarFolder
- **Auth Required**: Yes

### Get Starred Folders

- **Method**: GET
- **Path**: `/api/v1/folders/starred`
- **Description**: Get all starred/favorite folders
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: FolderController.getStarredFolders
- **Auth Required**: Yes

### Get Shared Folders

- **Method**: GET
- **Path**: `/api/v1/folders/shared`
- **Description**: Get all folders shared with the user
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: FolderController.getSharedFolders
- **Auth Required**: Yes

### Get Recent Folders

- **Method**: GET
- **Path**: `/api/v1/folders/recent`
- **Description**: Get recently accessed folders
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: FolderController.getRecentFolders
- **Auth Required**: Yes

### Get Folder Statistics

- **Method**: GET
- **Path**: `/api/v1/folders/stats`
- **Description**: Get statistics about folders (counts, usage, etc.)
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: FolderController.getFolderStats
- **Auth Required**: Yes

## Implementation Notes

### Folder Management

- Folders provide a hierarchical organization for clips
- Nested folder structures should be supported with configurable depth limits
- Folder names should be unique within the same parent folder
- Support sorting and filtering of folder contents
- Implement folder color coding for visual organization
- Consider implementing folder templates for quick setup

### Security Considerations

- Verify folder ownership before modification operations
- Implement granular permissions for shared folders (view-only, edit, admin)
- Apply rate limiting to prevent abuse
- Validate folder operations to prevent manipulation attacks
- Implement secure sharing with optional password protection
- Log folder access and modifications for security monitoring

### Performance Considerations

- Optimize folder hierarchy traversal for deep structures
- Implement efficient folder content retrieval with pagination
- Cache folder structure for frequently accessed folders
- Consider lazy-loading folder contents for large folders
- Optimize bulk operations on folders
- Implement efficient search within folders

### Data Management

- Implement soft deletion with recovery options
- Support folder archiving for rarely accessed content
- Track folder usage statistics for optimization
- Support folder metadata for additional organization
- Implement automatic organization based on content analysis
- Consider version control for shared folders

## Related Files

- srcSudo/controllers/folder.controller.ts
- srcSudo/services/folder.service.ts
- srcSudo/repositories/folder.repository.ts
- srcSudo/models/interfaces/folder.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
