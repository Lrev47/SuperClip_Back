# clips.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for managing clips in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the clip controller and applies necessary middleware for validation, security, and access control. The routes provide functionality for creating, retrieving, updating, deleting, and sharing clips, as well as managing clip metadata and organization.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/clip.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/subscription.middleware.ts

## Route Definitions

### Create Clip

- **Method**: POST
- **Path**: `/api/v1/clips`
- **Description**: Create a new clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates clip data)
  - checkStorageLimit (verifies user has not exceeded storage quota)
  - trackUsage('clip_create') (tracks usage for subscription limits)
- **Controller**: ClipController.createClip
- **Auth Required**: Yes

### Get Clip

- **Method**: GET
- **Path**: `/api/v1/clips/:clipId`
- **Description**: Get a specific clip by ID
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - checkClipAccess (verifies user has access to the clip)
- **Controller**: ClipController.getClip
- **Auth Required**: Yes

### Update Clip

- **Method**: PUT
- **Path**: `/api/v1/clips/:clipId`
- **Description**: Update an existing clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - validateBody (validates clip data)
  - checkClipOwnership (verifies user owns the clip)
- **Controller**: ClipController.updateClip
- **Auth Required**: Yes

### Delete Clip

- **Method**: DELETE
- **Path**: `/api/v1/clips/:clipId`
- **Description**: Delete a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - checkClipOwnership (verifies user owns the clip)
- **Controller**: ClipController.deleteClip
- **Auth Required**: Yes

### List Clips

- **Method**: GET
- **Path**: `/api/v1/clips`
- **Description**: Get all clips for the authenticated user (with pagination)
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: ClipController.listClips
- **Auth Required**: Yes

### Search Clips

- **Method**: GET
- **Path**: `/api/v1/clips/search`
- **Description**: Search for clips using keywords, tags, or content
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates search parameters)
  - requireFeatureAccess('advanced_search') (for premium search features)
- **Controller**: ClipController.searchClips
- **Auth Required**: Yes

### Bulk Delete Clips

- **Method**: DELETE
- **Path**: `/api/v1/clips/bulk`
- **Description**: Delete multiple clips at once
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates array of clip IDs)
  - checkClipOwnership (verifies user owns all clips)
- **Controller**: ClipController.bulkDeleteClips
- **Auth Required**: Yes

### Share Clip

- **Method**: POST
- **Path**: `/api/v1/clips/:clipId/share`
- **Description**: Share a clip with other users or get a public link
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - validateBody (validates sharing options)
  - checkClipOwnership (verifies user owns the clip)
  - requireFeatureAccess('share') (verifies user has sharing feature access)
- **Controller**: ClipController.shareClip
- **Auth Required**: Yes

### Revoke Clip Share

- **Method**: DELETE
- **Path**: `/api/v1/clips/:clipId/share/:shareId`
- **Description**: Revoke a specific share for a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and share ID)
  - checkClipOwnership (verifies user owns the clip)
- **Controller**: ClipController.revokeShare
- **Auth Required**: Yes

### Get Clip Shares

- **Method**: GET
- **Path**: `/api/v1/clips/:clipId/shares`
- **Description**: Get all active shares for a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - checkClipOwnership (verifies user owns the clip)
- **Controller**: ClipController.getClipShares
- **Auth Required**: Yes

### Access Shared Clip

- **Method**: GET
- **Path**: `/api/v1/shares/:shareToken`
- **Description**: Access a clip using a share token
- **Middleware**:
  - validateParams (validates share token)
  - checkShareValidity (verifies share token is valid and not expired)
- **Controller**: ClipController.accessSharedClip
- **Auth Required**: No (uses share token)

### Copy Shared Clip

- **Method**: POST
- **Path**: `/api/v1/shares/:shareToken/copy`
- **Description**: Copy a shared clip to the user's own collection
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates share token)
  - checkShareValidity (verifies share token is valid and not expired)
  - checkStorageLimit (verifies user has not exceeded storage quota)
- **Controller**: ClipController.copySharedClip
- **Auth Required**: Yes

### Add Clip to Folder

- **Method**: POST
- **Path**: `/api/v1/clips/:clipId/folder/:folderId`
- **Description**: Add a clip to a specific folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and folder ID)
  - checkClipOwnership (verifies user owns the clip)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: ClipController.addClipToFolder
- **Auth Required**: Yes

### Remove Clip from Folder

- **Method**: DELETE
- **Path**: `/api/v1/clips/:clipId/folder/:folderId`
- **Description**: Remove a clip from a specific folder
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and folder ID)
  - checkClipOwnership (verifies user owns the clip)
  - checkFolderAccess (verifies user has access to the folder)
- **Controller**: ClipController.removeClipFromFolder
- **Auth Required**: Yes

### Add Tag to Clip

- **Method**: POST
- **Path**: `/api/v1/clips/:clipId/tags`
- **Description**: Add one or more tags to a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - validateBody (validates tag data)
  - checkClipOwnership (verifies user owns the clip)
- **Controller**: ClipController.addTagsToClip
- **Auth Required**: Yes

### Remove Tag from Clip

- **Method**: DELETE
- **Path**: `/api/v1/clips/:clipId/tags/:tagId`
- **Description**: Remove a tag from a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and tag ID)
  - checkClipOwnership (verifies user owns the clip)
- **Controller**: ClipController.removeTagFromClip
- **Auth Required**: Yes

### Get Clip History

- **Method**: GET
- **Path**: `/api/v1/clips/:clipId/history`
- **Description**: Get the version history of a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - checkClipAccess (verifies user has access to the clip)
  - requireFeatureAccess('history') (verifies user has history feature access)
- **Controller**: ClipController.getClipHistory
- **Auth Required**: Yes

### Restore Clip Version

- **Method**: POST
- **Path**: `/api/v1/clips/:clipId/restore/:versionId`
- **Description**: Restore a clip to a previous version
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and version ID)
  - checkClipOwnership (verifies user owns the clip)
  - requireFeatureAccess('history') (verifies user has history feature access)
- **Controller**: ClipController.restoreClipVersion
- **Auth Required**: Yes

### Add Clip to Set

- **Method**: POST
- **Path**: `/api/v1/clips/:clipId/set/:setId`
- **Description**: Add a clip to a specific set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and set ID)
  - checkClipOwnership (verifies user owns the clip)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: ClipController.addClipToSet
- **Auth Required**: Yes

### Remove Clip from Set

- **Method**: DELETE
- **Path**: `/api/v1/clips/:clipId/set/:setId`
- **Description**: Remove a clip from a specific set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID and set ID)
  - checkClipOwnership (verifies user owns the clip)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: ClipController.removeClipFromSet
- **Auth Required**: Yes

### Favorite Clip

- **Method**: POST
- **Path**: `/api/v1/clips/:clipId/favorite`
- **Description**: Mark a clip as favorite
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - checkClipAccess (verifies user has access to the clip)
- **Controller**: ClipController.favoriteClip
- **Auth Required**: Yes

### Unfavorite Clip

- **Method**: DELETE
- **Path**: `/api/v1/clips/:clipId/favorite`
- **Description**: Remove a clip from favorites
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - checkClipAccess (verifies user has access to the clip)
- **Controller**: ClipController.unfavoriteClip
- **Auth Required**: Yes

### Get Clip Statistics

- **Method**: GET
- **Path**: `/api/v1/clips/stats`
- **Description**: Get statistics about clips (count, storage used, etc.)
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: ClipController.getClipStats
- **Auth Required**: Yes

## Implementation Notes

### Clip Management

- Clips are the core data entity in the SuperClip application
- Each clip contains: content, type (text, image, file, etc.), metadata, and access controls
- Content should be stored securely and efficiently
- Support multiple clip types: plain text, formatted text, images, files, links, code snippets
- Implement versioning for premium users

### Security Considerations

- Validate all clip data before storage
- Sanitize content to prevent XSS attacks
- Implement strict ownership and access controls
- Apply rate limiting on clip creation and updates
- Scan content for malicious data
- Enforce storage limits based on subscription tier
- Protect sensitive clip data during transmission

### Sharing Functionality

- Support sharing via direct links, email, or user-to-user
- Implement expiring share links
- Allow configurable permissions on shared clips (view, copy, edit)
- Track and monitor sharing activity
- Provide mechanisms to revoke shares

### Performance Considerations

- Optimize database queries for clip listing and searching
- Implement caching for frequently accessed clips
- Use pagination for clip listings
- Consider background processing for clip analysis or processing
- Implement efficient storage mechanisms for different clip types
- Optimize full-text search for clip content

### Data Management

- Support bulk operations for clip management
- Implement soft delete with recovery options
- Provide organization features (folders, tags, sets)
- Support comprehensive filtering and sorting
- Implement versioning and history tracking
- Ensure data retention policies are implemented

## Related Files

- srcSudo/controllers/clip.controller.ts
- srcSudo/services/clip.service.ts
- srcSudo/repositories/clip.repository.ts
- srcSudo/models/interfaces/clip.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
