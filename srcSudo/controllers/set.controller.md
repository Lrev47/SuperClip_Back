# Clipboard Set Controller Specification

## Purpose
The Clipboard Set Controller manages clipboard sets, which are collections of related clips that users can organize and use together. It provides endpoints for creating, retrieving, updating, and deleting clipboard sets, as well as managing the clips within these sets.

## Dependencies
- **External Packages**:
  - `express`: For handling HTTP requests and responses
  - `@prisma/client`: For database operations
  - `zod`: For request validation

- **Internal Modules**:
  - `../services/set.service`: For business logic related to clipboard sets
  - `../repositories/set.repository`: For data access operations
  - `../utils/async-handler`: For handling asynchronous routes
  - `../utils/logger`: For logging
  - `../middleware/auth`: For authentication middleware
  - `../types/set`: For TypeScript type definitions
  - `../config/errorMessages`: For standardized error messages

## Inputs/Outputs

### Inputs
- **HTTP Request objects**: Containing clipboard set details and operations
- **Request parameters**: Set IDs and item IDs for specific operations
- **Request bodies**: JSON data with set details (name, description, etc.)
- **Query parameters**: For filtering, pagination, and sorting
- **Authentication tokens**: For validating user identity and permissions

### Outputs
- **HTTP Response objects**: JSON responses containing set data, operation status, and error messages if applicable
- **Status codes**: 200, 201 for successful operations; 400, 401, 403, 404, 500 for various error conditions

## Data Types

```typescript
// Request DTOs
interface CreateSetDto {
  name: string;
  description?: string;
  folderId?: string;
  clipIds?: string[]; // Optional initial clips to add to the set
}

interface UpdateSetDto {
  name?: string;
  description?: string;
  folderId?: string;
}

interface AddItemToSetDto {
  clipId: string;
  position?: number; // Optional position in the set
}

interface UpdateSetItemDto {
  position: number;
}

// Response DTOs
interface ClipboardSetItemDto {
  id: string;
  clipId: string;
  position: number;
  clip: {
    id: string;
    name: string;
    content: string;
    type: string;
    // Other clip properties as needed
  };
}

interface ClipboardSetResponseDto {
  id: string;
  name: string;
  description: string | null;
  folderId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: ClipboardSetItemDto[];
}

interface SetListResponseDto {
  sets: ClipboardSetResponseDto[];
  total: number;
  page: number;
  limit: number;
}
```

## API/Methods

### createSet
- **HTTP Method**: POST
- **Endpoint**: `/api/sets`
- **Description**: Creates a new clipboard set for the authenticated user
- **Request Body**: CreateSetDto
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 201 (Created), 400 (Bad Request)

### getUserSets
- **HTTP Method**: GET
- **Endpoint**: `/api/sets`
- **Description**: Retrieves all clipboard sets for the authenticated user
- **Query Parameters**: page, limit, sort, folderId (optional)
- **Response**: SetListResponseDto
- **Status Codes**: 200 (OK), 401 (Unauthorized)

### getSetById
- **HTTP Method**: GET
- **Endpoint**: `/api/sets/:id`
- **Description**: Retrieves a specific clipboard set by its ID
- **URL Parameters**: id (string)
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 200 (OK), 404 (Not Found)

### updateSet
- **HTTP Method**: PATCH
- **Endpoint**: `/api/sets/:id`
- **Description**: Updates clipboard set details
- **URL Parameters**: id (string)
- **Request Body**: UpdateSetDto
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 200 (OK), 400 (Bad Request), 404 (Not Found)

### deleteSet
- **HTTP Method**: DELETE
- **Endpoint**: `/api/sets/:id`
- **Description**: Deletes a clipboard set
- **URL Parameters**: id (string)
- **Response**: { success: true, message: string }
- **Status Codes**: 200 (OK), 404 (Not Found)

### addItemToSet
- **HTTP Method**: POST
- **Endpoint**: `/api/sets/:id/items`
- **Description**: Adds a clip to a clipboard set
- **URL Parameters**: id (string)
- **Request Body**: AddItemToSetDto
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 201 (Created), 400 (Bad Request), 404 (Not Found)

### updateSetItem
- **HTTP Method**: PATCH
- **Endpoint**: `/api/sets/:setId/items/:itemId`
- **Description**: Updates a set item (e.g., repositioning)
- **URL Parameters**: setId (string), itemId (string)
- **Request Body**: UpdateSetItemDto
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 200 (OK), 400 (Bad Request), 404 (Not Found)

### removeItemFromSet
- **HTTP Method**: DELETE
- **Endpoint**: `/api/sets/:setId/items/:itemId`
- **Description**: Removes a clip from a clipboard set
- **URL Parameters**: setId (string), itemId (string)
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 200 (OK), 404 (Not Found)

### reorderSetItems
- **HTTP Method**: PATCH
- **Endpoint**: `/api/sets/:id/reorder`
- **Description**: Reorders multiple items in a clipboard set
- **URL Parameters**: id (string)
- **Request Body**: { items: { id: string, position: number }[] }
- **Response**: ClipboardSetResponseDto
- **Status Codes**: 200 (OK), 400 (Bad Request), 404 (Not Found)

## Test Specifications

### Unit Tests
1. Test set creation validation
   - Should validate required fields
   - Should validate field formats and constraints
   - Should return appropriate validation errors

2. Test set retrieval
   - Should retrieve all user sets with correct pagination
   - Should return empty array when user has no sets
   - Should handle sorting and filtering correctly

3. Test set updates
   - Should validate update fields
   - Should return updated set details
   - Should reject invalid update parameters

4. Test item management
   - Should validate item addition parameters
   - Should handle item positioning correctly
   - Should validate item update operations

5. Test set deletion
   - Should successfully delete existing sets
   - Should return appropriate error for non-existent sets

### Integration Tests
1. Test set creation flow
   - Should create set in database
   - Should associate set with correct user
   - Should add initial clips if provided

2. Test set retrieval with authentication
   - Should return only sets owned by the authenticated user
   - Should include correct items with each set
   - Should respect pagination parameters

3. Test permission boundaries
   - Should prevent accessing sets of other users
   - Should enforce authentication on all endpoints

4. Test item management workflow
   - Should add items to sets correctly
   - Should update item positions in the database
   - Should handle reordering multiple items in a single operation

## Implementation Notes

### Data Consistency
- Ensure positions are always sequential and without gaps after deletions
- Implement transactions for operations that modify multiple records
- Validate that clips being added to sets belong to the same user

### Security Considerations
- All endpoints must be protected with authentication middleware
- Set operations should only be permitted for the set owner
- Validate that user owns both the set and any clips being added

### Performance Optimizations
- Implement caching for frequently accessed sets
- Use pagination for set lists to prevent large response payloads
- Consider batch operations for item reordering

### Error Handling
- Implement consistent error handling across all endpoints
- Return descriptive error messages while avoiding sensitive information disclosure
- Log failed operations with appropriate severity levels

### Edge Cases
- Handle concurrent modifications to the same set
- Consider limits on the number of items in a set
- Implement validation for circular dependencies (e.g., sets containing sets)

## Related Files
- `src/services/set.service.ts`: Business logic for clipboard set operations
- `src/repositories/set.repository.ts`: Data access layer for clipboard sets
- `src/routes/set.routes.ts`: Route definitions for clipboard set endpoints
- `src/validators/set.validator.ts`: Request validation schemas
- `src/controllers/clip.controller.ts`: Related controller for managing clips
