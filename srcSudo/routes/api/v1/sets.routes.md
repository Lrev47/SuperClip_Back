# sets.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for managing clip sets in the SuperClip application. Sets are collections of clips grouped together for organizational purposes or related functionality. The routes provide functionality for creating, retrieving, updating, and deleting sets, as well as managing set contents and permissions.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/set.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/subscription.middleware.ts

## Route Definitions

### Create Set

- **Method**: POST
- **Path**: `/api/v1/sets`
- **Description**: Create a new clip set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates set creation data)
  - checkSetLimit (verifies user has not exceeded set limit based on subscription)
  - trackUsage('sets') (tracks set usage for the user)
- **Controller**: SetController.createSet
- **Auth Required**: Yes

### Get User Sets

- **Method**: GET
- **Path**: `/api/v1/sets`
- **Description**: Get all sets owned by the authenticated user
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: SetController.getUserSets
- **Auth Required**: Yes

### Get Set

- **Method**: GET
- **Path**: `/api/v1/sets/:setId`
- **Description**: Get details for a specific set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: SetController.getSet
- **Auth Required**: Yes

### Update Set

- **Method**: PUT
- **Path**: `/api/v1/sets/:setId`
- **Description**: Update a set's name, description, or metadata
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - validateBody (validates update data)
  - checkSetOwnership (verifies user owns the set)
- **Controller**: SetController.updateSet
- **Auth Required**: Yes

### Delete Set

- **Method**: DELETE
- **Path**: `/api/v1/sets/:setId`
- **Description**: Delete a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - checkSetOwnership (verifies user owns the set)
- **Controller**: SetController.deleteSet
- **Auth Required**: Yes

### Get Set Contents

- **Method**: GET
- **Path**: `/api/v1/sets/:setId/contents`
- **Description**: Get all clips within a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - validateQuery (validates pagination and filter parameters)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: SetController.getSetContents
- **Auth Required**: Yes

### Add Clip to Set

- **Method**: POST
- **Path**: `/api/v1/sets/:setId/clips/:clipId`
- **Description**: Add a clip to a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID and clip ID)
  - checkSetAccess (verifies user has access to the set)
  - checkClipAccess (verifies user has access to the clip)
  - checkSetClipLimit (verifies set has not exceeded clip limit)
- **Controller**: SetController.addClipToSet
- **Auth Required**: Yes

### Remove Clip from Set

- **Method**: DELETE
- **Path**: `/api/v1/sets/:setId/clips/:clipId`
- **Description**: Remove a clip from a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID and clip ID)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: SetController.removeClipFromSet
- **Auth Required**: Yes

### Reorder Set Clips

- **Method**: PATCH
- **Path**: `/api/v1/sets/:setId/order`
- **Description**: Reorder clips within a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - validateBody (validates order data)
  - checkSetAccess (verifies user has write access to the set)
- **Controller**: SetController.reorderSetClips
- **Auth Required**: Yes

### Share Set

- **Method**: POST
- **Path**: `/api/v1/sets/:setId/share`
- **Description**: Share a set with other users
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - validateBody (validates share data)
  - checkSetOwnership (verifies user owns the set)
  - requireFeatureAccess('set_sharing') (verifies user has set sharing feature access)
- **Controller**: SetController.shareSet
- **Auth Required**: Yes

### Update Set Share

- **Method**: PUT
- **Path**: `/api/v1/sets/:setId/share/:shareId`
- **Description**: Update sharing permissions for a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID and share ID)
  - validateBody (validates share update data)
  - checkSetOwnership (verifies user owns the set)
- **Controller**: SetController.updateSetShare
- **Auth Required**: Yes

### Revoke Set Share

- **Method**: DELETE
- **Path**: `/api/v1/sets/:setId/share/:shareId`
- **Description**: Revoke sharing for a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID and share ID)
  - checkSetOwnership (verifies user owns the set)
- **Controller**: SetController.revokeSetShare
- **Auth Required**: Yes

### Get Set Shares

- **Method**: GET
- **Path**: `/api/v1/sets/:setId/shares`
- **Description**: Get all shares for a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - checkSetOwnership (verifies user owns the set)
- **Controller**: SetController.getSetShares
- **Auth Required**: Yes

### Export Set

- **Method**: GET
- **Path**: `/api/v1/sets/:setId/export`
- **Description**: Export set data in various formats (JSON, CSV, etc.)
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - validateQuery (validates export options)
  - checkSetAccess (verifies user has access to the set)
  - requireFeatureAccess('set_export') (verifies user has export feature access)
- **Controller**: SetController.exportSet
- **Auth Required**: Yes

### Clone Set

- **Method**: POST
- **Path**: `/api/v1/sets/:setId/clone`
- **Description**: Create a copy of an existing set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - validateBody (validates clone options)
  - checkSetAccess (verifies user has access to the source set)
  - checkSetLimit (verifies user has not exceeded set limit)
  - trackUsage('sets') (tracks set usage)
- **Controller**: SetController.cloneSet
- **Auth Required**: Yes

### Star Set

- **Method**: POST
- **Path**: `/api/v1/sets/:setId/star`
- **Description**: Star/favorite a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: SetController.starSet
- **Auth Required**: Yes

### Unstar Set

- **Method**: DELETE
- **Path**: `/api/v1/sets/:setId/star`
- **Description**: Remove star/favorite from a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: SetController.unstarSet
- **Auth Required**: Yes

### Get Starred Sets

- **Method**: GET
- **Path**: `/api/v1/sets/starred`
- **Description**: Get all starred/favorite sets
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: SetController.getStarredSets
- **Auth Required**: Yes

### Get Shared Sets

- **Method**: GET
- **Path**: `/api/v1/sets/shared`
- **Description**: Get all sets shared with the user
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: SetController.getSharedSets
- **Auth Required**: Yes

### Get Recent Sets

- **Method**: GET
- **Path**: `/api/v1/sets/recent`
- **Description**: Get recently accessed sets
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: SetController.getRecentSets
- **Auth Required**: Yes

### Add Tag to Set

- **Method**: POST
- **Path**: `/api/v1/sets/:setId/tags/:tagId`
- **Description**: Add a tag to a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID and tag ID)
  - checkSetAccess (verifies user has write access to the set)
- **Controller**: SetController.addTagToSet
- **Auth Required**: Yes

### Remove Tag from Set

- **Method**: DELETE
- **Path**: `/api/v1/sets/:setId/tags/:tagId`
- **Description**: Remove a tag from a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID and tag ID)
  - checkSetAccess (verifies user has write access to the set)
- **Controller**: SetController.removeTagFromSet
- **Auth Required**: Yes

### Get Set Tags

- **Method**: GET
- **Path**: `/api/v1/sets/:setId/tags`
- **Description**: Get all tags associated with a set
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates set ID)
  - checkSetAccess (verifies user has access to the set)
- **Controller**: SetController.getSetTags
- **Auth Required**: Yes

### Get Sets by Tag

- **Method**: GET
- **Path**: `/api/v1/tags/:tagId/sets`
- **Description**: Get all sets associated with a specific tag
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag ID)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: SetController.getSetsByTag
- **Auth Required**: Yes

## Implementation Notes

### Set Management

- Sets provide a flexible way to organize clips outside of the folder hierarchy
- Sets can contain clips from different folders and with different tags
- Support for ordering clips within a set (manual ordering)
- Support for set descriptions and metadata for better organization
- Implement set templates for quickly creating common set structures
- Sets should support private, shared, and public visibility options

### Security Considerations

- Verify set ownership before modification operations
- Implement granular permissions for shared sets (view-only, edit, admin)
- Apply rate limiting to prevent abuse
- Validate set operations to prevent manipulation attacks
- Implement secure sharing with optional password protection
- Log set access and modifications for security monitoring

### Performance Considerations

- Optimize set content retrieval with pagination and filtering
- Implement efficient clip ordering algorithms
- Cache popular sets for faster access
- Optimize bulk operations on sets
- Implement efficient search within sets
- Consider indexing strategies for sets with large numbers of clips

### Data Management

- Implement soft deletion with recovery options
- Support set archiving for rarely accessed content
- Track set usage statistics for optimization
- Support set versioning for tracking changes
- Implement automatic backup of important sets
- Provide export options in multiple formats

## Related Files

- srcSudo/controllers/set.controller.ts
- srcSudo/services/set.service.ts
- srcSudo/repositories/set.repository.ts
- srcSudo/models/interfaces/set.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
