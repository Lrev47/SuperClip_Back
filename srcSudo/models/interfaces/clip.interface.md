# clip.interface.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines interfaces for the Clip entity in the application, representing clipboard content that users can save, organize, and access. It provides TypeScript types for clip data with various associated metadata and relationships.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript interfaces for clip-related data structures

## Data Types
```typescript
import { Clip, User, Folder, Tag, ClipboardSetItem, Device, ClipType, SyncStatus } from '@prisma/client';

// Basic clip interface (extends the Prisma model)
export interface IClip extends Clip {
  // Basic clip attributes defined in Prisma schema
  id: string;
  title: string;
  content: string;
  description: string | null;
  contentType: ClipType;
  format: string | null;
  folderId: string | null;
  userId: string;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsed: Date | null;
  useCount: number;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Clip with user data
export interface IClipWithUser extends IClip {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Clip with folder data
export interface IClipWithFolder extends IClip {
  folder: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

// Clip with tags
export interface IClipWithTags extends IClip {
  tags: {
    id: string;
    name: string;
    color: string | null;
  }[];
}

// Clip with related devices
export interface IClipWithDevices extends IClip {
  devices: {
    id: string;
    name: string;
    deviceType: string | null;
  }[];
}

// Clip with full relationship data
export interface IClipWithRelations extends IClip {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  folder: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
    color: string | null;
  }[];
  clipboardSetItems: {
    id: string;
    clipboardSetId: string;
    position: number;
  }[];
  devices: {
    id: string;
    name: string;
  }[];
}

// Clip with content preview
export interface IClipPreview {
  id: string;
  title: string;
  contentPreview: string; // Truncated content
  contentType: ClipType;
  folderId: string | null;
  folderName: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsed: Date | null;
  useCount: number;
  tagCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## API/Methods
N/A - This is an interface definition file with no runtime code.

## Test Specifications
N/A - TypeScript interfaces cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Usage Patterns**:
   - IClip: Basic clip information without relationships
   - IClipWithUser: When user context is needed
   - IClipWithFolder: When folder organization is important
   - IClipWithTags: For clips with tag categorization
   - IClipWithDevices: For tracking clip presence across devices
   - IClipWithRelations: For operations requiring complete relationship data
   - IClipPreview: For list views where full content isn't needed

2. **Performance Considerations**:
   - Use IClipPreview for list displays to reduce data transfer
   - Consider pagination when retrieving clips with many relationships
   - Generate content preview at storage time rather than retrieval time

3. **Security Considerations**:
   - Always validate user ownership before clip operations
   - Consider content sanitization for certain clip types (e.g., HTML)

4. **Maintenance Considerations**:
   - Keep interfaces in sync with the Prisma schema
   - Update when new clip properties or relationships are added

## Related Files
- src/services/clip.service.ts
- src/controllers/clip.controller.ts
- src/dto/clip.dto.ts
- src/services/sync.service.ts (for sync operations)
