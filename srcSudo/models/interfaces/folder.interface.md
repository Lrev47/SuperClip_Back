# folder.interface.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines interfaces for the Folder entity in the application. It provides TypeScript types for folder structures that allow users to organize clips, prompt templates, and other content in a hierarchical manner, including nested folders.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript interfaces for folder-related data structures

## Data Types
```typescript
import { Folder, User, Clip, PromptTemplate, ClipboardSet } from '@prisma/client';

// Basic folder interface (extends the Prisma model)
export interface IFolder extends Folder {
  // Basic folder attributes defined in Prisma schema
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Folder with parent data
export interface IFolderWithParent extends IFolder {
  parent: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

// Folder with children data (direct children only)
export interface IFolderWithChildren extends IFolder {
  children: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  }[];
}

// Folder with content counts
export interface IFolderWithCounts extends IFolder {
  _count: {
    clips: number;
    children: number;
    promptTemplates: number;
    ownedSets: number;
  };
}

// Folder with clips
export interface IFolderWithClips extends IFolder {
  clips: {
    id: string;
    title: string;
    contentType: string;
    updatedAt: Date;
  }[];
}

// Folder with user data
export interface IFolderWithUser extends IFolder {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Folder with full relationship data
export interface IFolderWithRelations extends IFolder {
  parent: IFolder | null;
  children: IFolder[];
  clips: Clip[];
  user: User;
  promptTemplates: PromptTemplate[];
  ownedSets: ClipboardSet[];
  clipboardSets: ClipboardSet[];
}

// Folder tree node for hierarchical display
export interface IFolderTreeNode {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  level: number;
  path: string[];
  clipCount: number;
  children: IFolderTreeNode[];
  isExpanded?: boolean;
}

// Folder breadcrumb for navigation
export interface IFolderBreadcrumb {
  id: string;
  name: string;
  isRoot: boolean;
}
```

## API/Methods
N/A - This is an interface definition file with no runtime code.

## Test Specifications
N/A - TypeScript interfaces cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Usage Patterns**:
   - IFolder: Basic folder information without relationships
   - IFolderWithParent: For upward navigation in folder hierarchies
   - IFolderWithChildren: For downward navigation and folder listing
   - IFolderWithCounts: For folder listings that show content counts
   - IFolderWithClips: For displaying folder contents
   - IFolderWithUser: When user context is needed
   - IFolderWithRelations: For operations requiring complete relationship data
   - IFolderTreeNode: For building and displaying folder trees in UI
   - IFolderBreadcrumb: For navigation breadcrumb components

2. **Performance Considerations**:
   - Load nested folder structures lazily to avoid deep recursive queries
   - Consider caching folder trees for users with complex hierarchies
   - Use IFolderWithCounts to display folder sizes without loading all contents

3. **Recursion Handling**:
   - Be careful with recursive folder structures to avoid infinite loops
   - Implement maximum nesting depth checks (as defined in constants)
   - Use iterative approaches instead of recursive ones when processing folder trees

4. **Security Considerations**:
   - Always validate user ownership before folder operations
   - Implement proper authorization for shared folders
   - Validate parent-child relationships to prevent circular references

## Related Files
- src/services/folder.service.ts
- src/controllers/folder.controller.ts
- src/dto/folder.dto.ts
- src/config/constants.ts (for MAX_FOLDER_DEPTH)
