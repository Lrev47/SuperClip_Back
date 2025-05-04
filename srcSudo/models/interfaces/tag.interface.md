# tag.interface.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines interfaces for the Tag entity in the application. It provides TypeScript types for tag data that allows users to categorize and organize clips, prompt templates, and clipboard sets with custom labels and colors.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript interfaces for tag-related data structures

## Data Types
```typescript
import { Tag, User, Clip, PromptTemplate, ClipboardSet } from '@prisma/client';

// Basic tag interface (extends the Prisma model)
export interface ITag extends Tag {
  // Basic tag attributes defined in Prisma schema
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tag with user data
export interface ITagWithUser extends ITag {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Tag with usage count information
export interface ITagWithCount extends ITag {
  _count: {
    clips: number;
    promptTemplates: number;
    clipboardSets: number;
  };
}

// Tag with clips that use it
export interface ITagWithClips extends ITag {
  clips: {
    id: string;
    title: string;
    contentType: string;
    updatedAt: Date;
  }[];
}

// Tag with prompt templates that use it
export interface ITagWithPromptTemplates extends ITag {
  promptTemplates: {
    id: string;
    name: string;
    updatedAt: Date;
  }[];
}

// Tag with clipboard sets that use it
export interface ITagWithClipboardSets extends ITag {
  clipboardSets: {
    id: string;
    name: string;
    updatedAt: Date;
  }[];
}

// Tag with full relationship data
export interface ITagWithRelations extends ITag {
  user: User;
  clips: Clip[];
  promptTemplates: PromptTemplate[];
  clipboardSets: ClipboardSet[];
}

// Tag suggestion (for autocomplete)
export interface ITagSuggestion {
  id: string;
  name: string;
  color: string | null;
  useCount: number;
}
```

## API/Methods
N/A - This is an interface definition file with no runtime code.

## Test Specifications
N/A - TypeScript interfaces cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Usage Patterns**:
   - ITag: Basic tag information without relationships
   - ITagWithUser: When user context is needed
   - ITagWithCount: For displaying tag usage statistics
   - ITagWithClips: For showing clips with a specific tag
   - ITagWithPromptTemplates: For showing prompt templates with a specific tag
   - ITagWithClipboardSets: For showing clipboard sets with a specific tag
   - ITagWithRelations: For operations requiring complete relationship data
   - ITagSuggestion: For tag autocomplete and suggestion features

2. **Performance Considerations**:
   - Tags are often used for filtering, so optimize queries for this use case
   - Consider caching popular tags for autocomplete features
   - Use ITagWithCount to show tag usage without loading all related entities

3. **Color Handling**:
   - Store colors in a consistent format (e.g., hex codes)
   - Provide default colors when null
   - Consider accessibility requirements when allowing custom colors

4. **Security Considerations**:
   - Always validate user ownership before tag operations
   - Sanitize tag names to prevent injection attacks
   - Enforce tag name uniqueness within a user's tags
   - Implement proper authorization for shared tags (if applicable)

## Related Files
- src/services/tag.service.ts
- src/controllers/tag.controller.ts
- src/dto/tag.dto.ts
- src/config/constants.ts (for MAX_TAGS_PER_CLIP)
