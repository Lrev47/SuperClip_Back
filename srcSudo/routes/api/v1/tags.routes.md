# tags.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for tag management in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the tag controller and applies necessary middleware for authentication, validation, and security. The routes provide functionality for creating, retrieving, updating, and deleting tags, managing tag relationships, and handling tag operations on clips.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/tag.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts

## Route Definitions

### Create Tag

- **Method**: POST
- **Path**: `/api/v1/tags`
- **Description**: Create a new tag
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates tag data)
- **Controller**: TagController.createTag
- **Auth Required**: Yes

### Get User Tags

- **Method**: GET
- **Path**: `/api/v1/tags`
- **Description**: Get all tags for the authenticated user with filtering and pagination
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates query parameters)
- **Controller**: TagController.getUserTags
- **Auth Required**: Yes

### Get Tag Statistics

- **Method**: GET
- **Path**: `/api/v1/tags/stats`
- **Description**: Get statistics about the user's tags
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: TagController.getTagStats
- **Auth Required**: Yes

### Get Tag Suggestions

- **Method**: GET
- **Path**: `/api/v1/tags/suggestions`
- **Description**: Get tag suggestions based on content
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates content and limit parameters)
- **Controller**: TagController.getTagSuggestions
- **Auth Required**: Yes

### Get Tag by ID

- **Method**: GET
- **Path**: `/api/v1/tags/:id`
- **Description**: Get a specific tag by ID
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag ID)
- **Controller**: TagController.getTagById
- **Auth Required**: Yes

### Get Tag by Name

- **Method**: GET
- **Path**: `/api/v1/tags/name/:name`
- **Description**: Get a specific tag by name
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag name)
- **Controller**: TagController.getTagByName
- **Auth Required**: Yes

### Update Tag

- **Method**: PUT
- **Path**: `/api/v1/tags/:id`
- **Description**: Update an existing tag
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag ID)
  - validateBody (validates update data)
- **Controller**: TagController.updateTag
- **Auth Required**: Yes

### Delete Tag

- **Method**: DELETE
- **Path**: `/api/v1/tags/:id`
- **Description**: Delete a tag
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag ID)
- **Controller**: TagController.deleteTag
- **Auth Required**: Yes

### Merge Tags

- **Method**: POST
- **Path**: `/api/v1/tags/merge`
- **Description**: Merge multiple source tags into a target tag
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates source and target tag IDs)
- **Controller**: TagController.mergeTags
- **Auth Required**: Yes

### Split Tag

- **Method**: POST
- **Path**: `/api/v1/tags/split`
- **Description**: Split a source tag into multiple new tags
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates source tag ID and new tag data)
- **Controller**: TagController.splitTag
- **Auth Required**: Yes

### Get Clip Tags

- **Method**: GET
- **Path**: `/api/v1/tags/clip/:clipId`
- **Description**: Get all tags for a specific clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
- **Controller**: TagController.getClipTags
- **Auth Required**: Yes

### Add Tags to Clip

- **Method**: POST
- **Path**: `/api/v1/tags/clip/:clipId`
- **Description**: Add tags to a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - validateBody (validates tag names)
- **Controller**: TagController.addTagsToClip
- **Auth Required**: Yes

### Remove Tags from Clip

- **Method**: DELETE
- **Path**: `/api/v1/tags/clip/:clipId`
- **Description**: Remove tags from a clip
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates clip ID)
  - validateBody (validates tag IDs)
- **Controller**: TagController.removeTagsFromClip
- **Auth Required**: Yes

### Get Related Tags

- **Method**: GET
- **Path**: `/api/v1/tags/:id/related`
- **Description**: Get tags related to a specific tag
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag ID)
- **Controller**: TagController.getRelatedTags
- **Auth Required**: Yes

### Add Related Tag

- **Method**: POST
- **Path**: `/api/v1/tags/:id/related/:relatedId`
- **Description**: Add a related tag relationship
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag IDs)
  - validateBody (validates relation type)
- **Controller**: TagController.addRelatedTag
- **Auth Required**: Yes

### Remove Related Tag

- **Method**: DELETE
- **Path**: `/api/v1/tags/:id/related/:relatedId`
- **Description**: Remove a related tag relationship
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates tag IDs)
- **Controller**: TagController.removeRelatedTag
- **Auth Required**: Yes

### Get Tag Categories

- **Method**: GET
- **Path**: `/api/v1/tags/categories`
- **Description**: Get all tag categories for the authenticated user
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: TagController.getTagCategories
- **Auth Required**: Yes

### Create Tag Category

- **Method**: POST
- **Path**: `/api/v1/tags/categories`
- **Description**: Create a new tag category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates category data)
- **Controller**: TagController.createTagCategory
- **Auth Required**: Yes

### Update Tag Category

- **Method**: PUT
- **Path**: `/api/v1/tags/categories/:id`
- **Description**: Update a tag category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates category ID)
  - validateBody (validates update data)
- **Controller**: TagController.updateTagCategory
- **Auth Required**: Yes

### Delete Tag Category

- **Method**: DELETE
- **Path**: `/api/v1/tags/categories/:id`
- **Description**: Delete a tag category
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates category ID)
- **Controller**: TagController.deleteTagCategory
- **Auth Required**: Yes

## Implementation Notes

### Tag Management

- Tags are user-specific and can be applied to multiple clips
- Tag names should be unique per user (case-insensitive)
- Tags can have optional metadata like color and description
- Tags can be organized into categories

### Tag Operations

- Support bulk operations for efficiency
- Implement proper handling for tag merging and splitting
- Maintain tag usage statistics
- Provide tag suggestions based on content and user history

### Error Handling

- Return appropriate HTTP status codes for different error scenarios
- Provide clear error messages without exposing sensitive information
- Log errors for debugging and monitoring
- Handle edge cases like tag name conflicts

### Performance Considerations

- Optimize tag retrieval for frequently accessed operations
- Implement efficient tag suggestion algorithms
- Use pagination for tag listings
- Consider caching for tag categories and popular tags

### Security Considerations

- Verify user ownership of tags before allowing operations
- Sanitize tag names and descriptions to prevent XSS
- Implement proper access control for all tag operations
- Validate all user inputs

## Related Files

- srcSudo/controllers/tag.controller.ts
- srcSudo/services/tag.service.ts
- srcSudo/repositories/tag.repository.ts
- srcSudo/models/interfaces/tag.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
