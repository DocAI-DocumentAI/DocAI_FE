# 📁 Folder Management API Reference

## Overview
The Folder Management API provides comprehensive folder operations with hierarchical structure, department-based access control, and Google Drive integration.

## Base URL
```
/api/document/folders
```

## Authentication
All endpoints require JWT Bearer token authentication.

---

## 📂 Folder Tree Operations

### 1. Get Department Folder Tree
**GET** `/tree`

Retrieves hierarchical folder structure for a specific department.

**Parameters:**
- `includeSystemFolders` (query, optional): Include system folders (_draft, _approved)
- `maxDepth` (query, optional): Maximum tree depth

**Response:**
```json
{
  "success": true,
  "data": {
    "departmentId": "dept-001",
    "departmentName": "Human Resources",
    "rootFolders": [
      {
        "id": "folder-001",
        "name": "HR Policies",
        "description": "Company HR policies and procedures",
        "isPublic": false,
        "isSystemFolder": false,
        "level": 0,
        "fullPath": "HR Policies",
        "documentCount": 5,
        "subFolderCount": 2,
        "subFolders": [
          {
            "id": "folder-002",
            "name": "Employee Handbook",
            "level": 1,
            "fullPath": "HR Policies/Employee Handbook",
            "documentCount": 3,
            "subFolderCount": 0
          }
        ],
        "permissions": {
          "canView": true,
          "canEdit": true,
          "canDelete": false,
          "canManage": false
        }
      }
    ],
    "totalFolders": 15,
    "totalDocuments": 42
  },
  "message": "Folder tree retrieved successfully"
}
```

### 2. Get Public Folder Tree
**GET** `/tree/public`

Retrieves public folders accessible to all employees.

**Parameters:**
- `includeSystemFolders` (query, optional): Include system folders
- `maxDepth` (query, optional): Maximum tree depth

**Response:**
```json
{
  "success": true,
  "data": {
    "rootFolders": [
      {
        "id": "public-001",
        "name": "Company Policies",
        "description": "Company-wide policies and procedures",
        "isPublic": true,
        "isSystemFolder": false,
        "level": 0,
        "fullPath": "Company Policies",
        "documentCount": 12,
        "subFolderCount": 3,
        "permissions": {
          "canView": true,
          "canEdit": false,
          "canDelete": false,
          "canManage": false
        }
      }
    ],
    "totalFolders": 8,
    "totalDocuments": 25
  },
  "message": "Public folder tree retrieved successfully"
}
```

---

## 🆕 Folder CRUD Operations

### 3. Create Folder
**POST** `/`

Creates a new folder with specified permissions and hierarchy.

**Request Body:**
```json
{
  "name": "New Project Folder",
  "description": "Folder for project documentation",
  "parentFolderId": "folder-001",
  "departmentId": "dept-001",
  "isPublic": false,
  "initialPermissions": [
    {
      "userId": "user-001",
      "permissionType": "Edit",
      "expiresAt": null
    },
    {
      "departmentId": "dept-002",
      "permissionType": "View",
      "expiresAt": "2024-12-31T23:59:59Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "folder-new-001",
    "name": "New Project Folder",
    "description": "Folder for project documentation",
    "departmentId": "dept-001",
    "parentFolderId": "folder-001",
    "isPublic": false,
    "isSystemFolder": false,
    "level": 1,
    "fullPath": "HR Policies/New Project Folder",
    "googleDriveFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "documentCount": 0,
    "subFolderCount": 0,
    "createdBy": "user-001",
    "createdTime": "2024-01-15T10:30:00Z",
    "permissions": {
      "canView": true,
      "canEdit": true,
      "canDelete": true,
      "canManage": true
    }
  },
  "message": "Folder created successfully"
}
```

### 4. Get Folder Details
**GET** `/{folderId}`

Retrieves detailed information about a specific folder.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "folder-001",
    "name": "HR Policies",
    "description": "Company HR policies and procedures",
    "departmentId": "dept-001",
    "parentFolderId": null,
    "isPublic": false,
    "isSystemFolder": false,
    "level": 0,
    "fullPath": "HR Policies",
    "googleDriveFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "documentCount": 5,
    "subFolderCount": 2,
    "createdBy": "user-001",
    "createdTime": "2024-01-10T09:00:00Z",
    "updatedBy": "user-002",
    "updatedTime": "2024-01-14T15:30:00Z",
    "permissions": {
      "canView": true,
      "canEdit": true,
      "canDelete": false,
      "canManage": false
    }
  },
  "message": "Folder details retrieved successfully"
}
```

### 5. Update Folder
**PUT** `/{folderId}`

Updates folder name and description.

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "description": "Updated folder description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "folder-001",
    "name": "Updated Folder Name",
    "description": "Updated folder description",
    "updatedBy": "user-001",
    "updatedTime": "2024-01-15T11:00:00Z"
  },
  "message": "Folder updated successfully"
}
```

---

## 🔄 Folder Operations

### 6. Move Folder
**PUT** `/{folderId}/move`

Moves a folder to a different parent location.

**Request Body:**
```json
{
  "newParentFolderId": "folder-002",
  "preservePermissions": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "folder-001",
    "name": "HR Policies",
    "oldParentId": null,
    "newParentId": "folder-002",
    "oldFullPath": "HR Policies",
    "newFullPath": "Company Docs/HR Policies",
    "level": 1,
    "updatedTime": "2024-01-15T12:00:00Z"
  },
  "message": "Folder moved successfully"
}
```

### 7. Delete Folder
**DELETE** `/{folderId}`

Soft deletes a folder and optionally its contents.

**Parameters:**
- `deleteContents` (query, optional): Delete all contents (default: false)
- `force` (query, optional): Force delete system folders (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedFolderId": "folder-001",
    "deletedSubFolders": 3,
    "deletedDocuments": 8,
    "deletedTime": "2024-01-15T13:00:00Z"
  },
  "message": "Folder deleted successfully"
}
```

---

## 📋 Folder Listing

### 8. Get User Accessible Folders
**GET** `/accessible`

Lists folders accessible to the current user.

**Parameters:**
- `departmentId` (query, optional): Filter by department
- `permissionType` (query, optional): Required permission level (View, Edit, Delete, Manage)
- `includePublic` (query, optional): Include public folders

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder-001",
      "name": "HR Policies",
      "fullPath": "HR Policies",
      "departmentId": "dept-001",
      "isPublic": false,
      "isSystemFolder": false,
      "effectivePermission": "Edit",
      "permissionSource": "Department",
      "documentCount": 5,
      "subFolderCount": 2,
      "actions": {
        "canView": true,
        "canEdit": true,
        "canDelete": false,
        "canManage": false
      }
    }
  ],
  "message": "Accessible folders retrieved successfully"
}
```

---

## ❌ Error Responses

### Common Error Codes:
- `FOLDER_NOT_FOUND`: Folder does not exist
- `ACCESS_DENIED`: Insufficient permissions
- `INVALID_REQUEST`: Invalid request parameters
- `DUPLICATE_NAME`: Folder name already exists in parent
- `OPERATION_FAILED`: Operation could not be completed

### Error Response Format:
```json
{
  "success": false,
  "errorCode": "ACCESS_DENIED",
  "message": "You do not have permission to access this folder",
  "statusCode": 403
}
```

---

## 🔐 Permission Types

| Permission | Description |
|------------|-------------|
| `View` | Can view folder and documents |
| `Edit` | Can view, upload documents, create subfolders |
| `Delete` | Can view, edit, and delete documents/folders |
| `Manage` | Full control including permission management |

## 📝 Field Descriptions

### IsPublic Field
- `true`: Folder accessible to all employees (read-only for non-managers)
- `false`: Folder restricted to department members and explicit permissions

### System Folders
Special folders like `_draft`, `_approved` that are managed by the system and have restricted operations.

---

## 🔧 Advanced Operations

### 9. Initialize Department Folders
**POST** `/initialize/department/{departmentId}`

Creates standard folder structure for a department.

**Response:**
```json
{
  "success": true,
  "data": {
    "departmentId": "dept-001",
    "createdFolders": [
      "folder-draft-001",
      "folder-approved-001",
      "folder-archived-001"
    ],
    "folderCount": 3
  },
  "message": "Department folders initialized successfully"
}
```

### 10. Sync Folder with Google Drive
**POST** `/{folderId}/sync`

Synchronizes folder structure and permissions with Google Drive.

**Response:**
```json
{
  "success": true,
  "data": {
    "folderId": "folder-001",
    "googleDriveFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "syncedDocuments": 12,
    "syncedSubFolders": 3,
    "syncTime": "2024-01-15T14:00:00Z",
    "status": "Completed"
  },
  "message": "Folder synchronized successfully"
}
```

### 11. Verify Folder Permissions
**GET** `/{folderId}/verify-permissions`

Verifies folder permissions against Google Drive settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "folderId": "folder-001",
    "databasePermissions": 5,
    "googleDrivePermissions": 5,
    "isInSync": true,
    "discrepancies": [],
    "lastVerified": "2024-01-15T14:30:00Z"
  },
  "message": "Permissions verified successfully"
}
```

---

## � Folder Permission Management

**Base URL:** `/api/document/folder-permissions`

**Frontend Usage:** Use these APIs for permission management UI, user access control, and security administration.

### 12. Get Folder Permissions
**GET** `/{folderId}`

**Frontend Use Case:** Display permission list in folder settings, show who has access to folders.

Retrieves all permissions for a specific folder with enriched user/department information including names and emails.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "perm-001",
      "folderId": "folder-001",
      "userId": "user-001",
      "userEmail": "john.doe@company.com",
      "userFullName": "John Doe",
      "departmentId": "dept-001",
      "departmentName": "IT Department",
      "permissionType": 2,
      "permissionDescription": "Edit",
      "isInherited": false,
      "isDenied": false,
      "expiresAt": null,
      "isActive": true,
      "isValid": true,
      "permissionSource": "Direct",
      "createdTime": "2024-01-15T10:00:00Z",
      "createdBy": "admin-001"
    }
  ],
  "message": "Folder permissions retrieved successfully"
}
```

### 13. Set Folder Permission
**POST** `/{folderId}`

**Frontend Use Case:** Add new permissions when sharing folders, grant access to users/departments.

Sets permission for a user or department on a folder with optional subfolder inheritance.

**Request Body:**
```json
{
  "userId": "user-001",
  "departmentId": null,
  "permissionType": "Edit",
  "expiresAt": "2024-12-31T23:59:59Z",
  "applyToSubfolders": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "perm-new-001",
    "folderId": "folder-001",
    "userId": "user-001",
    "userEmail": "john.doe@company.com",
    "userFullName": "John Doe",
    "permissionType": 2,
    "permissionDescription": "Edit",
    "createdTime": "2024-01-15T11:00:00Z"
  },
  "message": "Permission set successfully"
}
```

### 14. Remove Folder Permission
**DELETE** `/{folderId}/{permissionId}`

**Frontend Use Case:** Remove access when users leave projects, revoke permissions in folder settings.

Removes a specific permission from a folder.

**Response:**
```json
{
  "success": true,
  "data": {
    "removedPermissionId": "perm-001",
    "folderId": "folder-001",
    "removedTime": "2024-01-15T12:00:00Z"
  },
  "message": "Permission removed successfully"
}
```

### 15. Check User Permission
**GET** `/{folderId}/check`

**Frontend Use Case:** Show/hide UI elements based on permissions, validate actions before execution.

Checks if current user has specific permission on a folder.

**Parameters:**
- `requiredPermission` (query): Permission type to check (View, Edit, Delete, Manage)

**Response:**
```json
{
  "success": true,
  "data": {
    "folderId": "folder-001",
    "userId": "user-001",
    "requiredPermission": "Edit",
    "hasPermission": true
  },
  "message": "User has required permission"
}
```

---

## � Folder Document Operations

**Base URL:** `/api/document/folder-documents`

**Frontend Usage:** Use these APIs for document browsing, search within folders, and document management with folder context.

### 16. Browse Folder Contents
**GET** `/browse`

**Frontend Use Case:** Main folder browser interface, file explorer view with folders and documents.

Browse folders and documents with pagination, sorting, and filtering capabilities.

**Parameters:**
- `parentFolderId` (query, optional): Parent folder ID (null for root level)
- `page` (query, optional): Page number (default: 1)
- `pageSize` (query, optional): Items per page (default: 20)
- `sortBy` (query, optional): Sort field (Name, CreatedTime, LastUpdatedTime)
- `sortDirection` (query, optional): Sort direction (asc, desc)
- `folderSortBy` (query, optional): Folder sort field
- `folderSortDirection` (query, optional): Folder sort direction

**Response:**
```json
{
  "success": true,
  "data": {
    "currentFolder": {
      "id": "folder-001",
      "name": "HR Policies",
      "fullPath": "HR Policies"
    },
    "subFolders": [
      {
        "id": "folder-002",
        "name": "Employee Handbook",
        "documentCount": 5,
        "subFolderCount": 2,
        "permissions": {
          "canView": true,
          "canEdit": true
        }
      }
    ],
    "documents": [
      {
        "id": "doc-001",
        "title": "Employee Policy 2024",
        "fileName": "policy.pdf",
        "fileSize": 1024000,
        "lastUpdatedTime": "2024-01-15T10:00:00Z",
        "status": "Approved"
      }
    ],
    "totalFolders": 3,
    "totalDocuments": 12,
    "currentPage": 1,
    "totalPages": 2
  },
  "message": "Folder contents retrieved successfully"
}
```

### 17. Search Documents in Folder
**GET** `/search`

**Frontend Use Case:** Advanced search interface, filter documents by criteria within folder hierarchy.

Advanced search for documents within folders with full-text search and filtering.

**Query Parameters:**
- `folderId` (query, optional): Folder ID to search within
- `keyword` (query, optional): Search keyword
- `includeSubfolders` (query, optional): Include subfolders in search
- `searchType` (query, optional): Search type (FullText, Title, etc.)
- `tags` (query, optional): Filter by tags (comma-separated)
- `fromDate` (query, optional): Start date filter
- `toDate` (query, optional): End date filter
- `status` (query, optional): Document status filter
- `documentTypeId` (query, optional): Document type filter
- `signedBy` (query, optional): Signed by filter
- `sortBy` (query, optional): Sort field
- `sortDirection` (query, optional): Sort direction
- `page` (query, optional): Page number
- `pageSize` (query, optional): Page size

**Response:**
```json
{
  "success": true,
  "data": {
    "searchFolder": {
      "id": "folder-001",
      "name": "HR Policies",
      "fullPath": "HR Policies"
    },
    "documents": [
      {
        "id": "doc-001",
        "title": "Employee Policy 2024",
        "description": "Updated employee policies",
        "fileName": "policy.pdf",
        "fileSize": 1024000,
        "lastUpdatedTime": "2024-01-15T10:00:00Z",
        "status": "Approved",
        "tags": ["hr", "policy"],
        "searchSnippet": "...employee <mark>policy</mark> guidelines..."
      }
    ],
    "totalResults": 25,
    "totalPages": 3,
    "currentPage": 1,
    "executionTimeMs": 150,
    "appliedFilters": {
      "status": "Approved",
      "tags": ["hr", "policy"]
    }
  },
  "message": "Search completed successfully"
}
```

### 18. Get Folder Documents List
**GET** `/{folderId}/list`

**Frontend Use Case:** Simple document list for specific folder, document picker components.

**⚠️ Returns ALL documents (no pagination)** - Returns complete list of documents in folder.

**Parameters:**
- `page` (query, ignored): Page number (ignored - returns all documents)
- `pageSize` (query, ignored): Items per page (ignored - returns all documents)
- `status` (query, optional): Filter by document status
- `documentTypeId` (query, optional): Filter by document type
- `sortBy` (query, optional): Sort field
- `sortDirection` (query, optional): Sort direction

**✅ Enhanced Response (Updated 2024):**
```json
{
  "success": true,
  "data": {
    "searchFolder": {
      "id": "folder-001",
      "name": "HR Policies"
    },
    "documents": [
      {
        "id": "version-123",
        "documentFileId": "file-456",
        "versionId": "version-123",
        "title": "Employee Policy 2024",
        "versionName": "v1.0",
        "summary": "Updated employee policy document",
        "status": "Approved",
        "documentType": "Policy",
        "fileSize": 1024000,
        "fileType": "PDF",
        "isPublic": false,
        "departmentId": "hr-dept",
        "signedBy": "CEO",
        "effectiveFrom": "2024-01-01T00:00:00Z",
        "effectiveUntil": "2024-12-31T23:59:59Z",
        "createdTime": "2024-01-15T10:00:00Z",
        "lastUpdatedTime": "2024-01-15T10:30:00Z",
        "createdBy": "user-123",
        "tags": ["policy", "hr"]
      }
    ],
    "totalResults": 12,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 2147483647
  },
  "message": "Retrieved all 12 documents from folder"
}
```

### 19. Get Recent Documents
**GET** `/recent`

**Frontend Use Case:** Dashboard recent activity, quick access to recently modified documents.

Get recently accessed/modified documents across all accessible folders.

**Parameters:**
- `limit` (query, optional): Number of documents to return (default: 10)
- `departmentId` (query, optional): Filter by department

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-001",
      "title": "Employee Policy 2024",
      "fileName": "policy.pdf",
      "folderPath": "HR Policies/Employee Handbook",
      "lastUpdatedTime": "2024-01-15T10:00:00Z",
      "status": "Approved"
    }
  ],
  "message": "Recent documents retrieved successfully"
}
```

### 20. Get Folder Document Statistics
**GET** `/{folderId}/statistics`

**Frontend Use Case:** Folder analytics dashboard, storage usage reports, document metrics.

Get statistical information about documents in a folder.

**Parameters:**
- `includeSubfolders` (query, optional): Include statistics from subfolders

**Response:**
```json
{
  "success": true,
  "data": {
    "folderId": "folder-001",
    "folderName": "HR Policies",
    "totalDocuments": 25,
    "totalFileSize": 52428800,
    "subfoldersIncluded": 3,
    "documentsByStatus": {
      "Draft": 5,
      "Pending": 3,
      "Approved": 17
    },
    "documentsByType": {
      "Policy": 12,
      "Procedure": 8,
      "Form": 5
    },
    "mostRecentDocument": "2024-01-15T10:00:00Z",
    "oldestDocument": "2023-06-01T09:00:00Z",
    "generatedAt": "2024-01-15T14:00:00Z"
  },
  "message": "Folder statistics retrieved successfully"
}
```

### 21. Move Document to Folder
**PUT** `/{documentVersionId}/move`

**Frontend Use Case:** Drag-and-drop document organization, document management interfaces.

Move a document to a different folder with permission validation.

**Parameters:**
- `targetFolderId` (query): Target folder ID

**Response:**
```json
{
  "success": true,
  "data": {
    "documentVersionId": "version-001",
    "targetFolderId": "folder-002"
  },
  "message": "Document moved successfully"
}
```

### 22. Get Document Folder Path
**GET** `/{documentVersionId}/folder-path`

**Frontend Use Case:** Breadcrumb navigation, document location display, folder hierarchy navigation.

Get breadcrumb path from root to document's folder.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "root",
      "name": "Root",
      "level": 0
    },
    {
      "id": "folder-001",
      "name": "HR Policies",
      "level": 1
    },
    {
      "id": "folder-002",
      "name": "Employee Handbook",
      "level": 2
    }
  ],
  "message": "Document folder path retrieved successfully"
}
```

---

## ✅ Folder-Aware Approval Workflow

**Base URL:** `/api/document/folder-approval`

**Frontend Usage:** Use these APIs for approval workflow UI, manager dashboards, and document approval processes.

### 23. Submit Document for Approval
**POST** `/{versionId}/submit`

**Frontend Use Case:** Submit button in document editor, approval workflow initiation.

Submit a document for approval with optional target folder specification.

**Parameters:**
- `targetFolderId` (query, optional): Target folder after approval

**Response:**
```json
{
  "success": true,
  "data": {
    "versionId": "version-001",
    "submissionId": "submission-001",
    "targetFolderId": "folder-approved",
    "submittedAt": "2024-01-15T10:00:00Z",
    "estimatedApprovalTime": "2024-01-17T10:00:00Z"
  },
  "message": "Document submitted for approval successfully"
}
```

### 24. Approve Document
**POST** `/{versionId}/approve`

**Frontend Use Case:** Approval interface for managers, approval decision forms.

Approve a document with folder-aware workflow and optional comments.

**Request Body:**
```json
{
  "comments": "Approved with minor suggestions",
  "targetFolderId": "folder-approved"
}
```

### 25. Reject Document
**POST** `/{versionId}/reject`

**Frontend Use Case:** Rejection interface with comment requirements, feedback forms.

Reject a document with mandatory comments for improvement.

**Request Body:**
```json
{
  "comments": "Please update section 3 with latest regulations",
  "returnToDrafts": true
}
```

### 26. Get Approval Queue
**GET** `/queue`

**Frontend Use Case:** Manager dashboard, approval task list, workflow management interface.

Get approval queue with folder context and filtering options.

**Parameters:**
- `departmentId` (query, optional): Filter by department
- `folderId` (query, optional): Filter by folder
- `includeSubfolders` (query, optional): Include subfolders
- `page` (query, optional): Page number
- `pageSize` (query, optional): Items per page

**✅ Enhanced Response (Updated 2024):**
```json
{
  "success": true,
  "data": {
    "pendingDocuments": [
      {
        "id": "version-123",
        "documentFileId": "file-456",
        "versionId": "version-123",
        "versionName": "v1.0",
        "title": "Employee Policy Update",
        "submittedBy": "user-123",
        "submittedByName": "John Editor",
        "submittedAt": "2024-01-15T10:00:00Z",
        "status": "Pending",
        "departmentId": "hr-dept",
        "departmentName": "Human Resources",
        "documentTypeId": "policy-type",
        "documentTypeName": "Policy",
        "isPublic": false,
        "signedBy": "CEO",
        "effectiveFrom": "2024-01-01T00:00:00Z",
        "effectiveUntil": "2024-12-31T23:59:59Z",
        "isBeingReviewed": false,
        "reviewedBy": null,
        "claimedAt": null,
        "reviewedByName": null,
        "description": "Updated company policy document",
        "summary": "Key changes to employee handbook",
        "fileSize": 1024000,
        "fileType": "PDF",
        "tags": ["policy", "hr", "employee"],
        "createdTime": "2024-01-15T10:00:00Z",
        "lastUpdatedTime": "2024-01-15T10:30:00Z",
        "ownerId": "owner-789",
        "ownerName": "Jane Smith",
        "priority": "Medium",
        "daysSinceSubmission": 3,
        "isApproachingExpiration": false,
        "resubmissionCount": 0,
        "previousRejectionReason": null,
        "containingFolder": {
          "id": "folder-789",
          "name": "_draft",
          "fullPath": "Human Resources/_draft"
        },
        "approvalDeadline": "2024-01-22T10:00:00Z",
        "isUrgent": false,
        "currentClaim": null
      }
    ],
    "totalPending": 15,
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 1,
    "appliedFilters": {
      "departmentId": "hr-dept",
      "folderId": "folder-789",
      "includeSubfolders": true
    }
  },
  "message": "Approval queue retrieved successfully"
}
```

### 27. Get Folder Approval History
**GET** `/{folderId}/history`

**Frontend Use Case:** Folder audit trail, approval history reports, compliance tracking.

Get approval history for documents in a folder with filtering.

**Parameters:**
- `includeSubfolders` (query, optional): Include subfolders
- `fromDate` (query, optional): Start date filter
- `toDate` (query, optional): End date filter
- `page` (query, optional): Page number
- `pageSize` (query, optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "folderId": "folder-001",
    "folderName": "HR Policies",
    "approvalHistory": [
      {
        "versionId": "version-001",
        "documentTitle": "Employee Policy 2024",
        "action": "Approved",
        "approvedBy": "Jane Manager",
        "approvedAt": "2024-01-15T11:00:00Z",
        "comments": "Approved for publication"
      }
    ],
    "totalEntries": 50,
    "currentPage": 1,
    "totalPages": 3
  },
  "message": "Folder approval history retrieved successfully"
}
```

### 28. Get Pending Documents in Folder
**GET** `/{folderId}/pending`

**Frontend Use Case:** Folder-specific approval view, department manager interfaces.

Get documents pending approval in a specific folder.

**Parameters:**
- `includeSubfolders` (query, optional): Include subfolders

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "versionId": "version-001",
      "documentTitle": "Employee Policy Update",
      "submittedBy": "John Editor",
      "submittedAt": "2024-01-15T10:00:00Z",
      "folderPath": "HR Policies/Employee Handbook"
    }
  ],
  "message": "Found 5 pending documents in folder"
}
```

---

## 🚀 **Recent API Enhancements (2024)**

### **✅ Enhanced Document Response Fields**
All document listing and approval APIs now include comprehensive document information:

**New Document Fields Added:**
- `documentFileId`: Parent document file ID for version management
- `versionId`: Specific version identifier (same as `id` for compatibility)
- `fileType`: File extension (PDF, DOCX, XLSX, etc.)
- `summary`: Document summary for quick overview
- `signedBy`: Person who signed the document
- `effectiveFrom`/`effectiveUntil`: Document validity dates
- `isPublic`: Public/private access indicator
- `departmentId`: Department ownership
- `createdTime`/`lastUpdatedTime`: Timestamp information

**Enhanced User Information (Enriched):**
- `submittedByName`: Full name of document submitter
- `ownerName`: Full name of document owner
- `departmentName`: Human-readable department name
- `documentTypeName`: Human-readable document type
- `reviewedByName`: Full name of reviewer (for approval workflow)

**Calculated Fields:**
- `priority`: Auto-calculated priority (Normal/Medium/High) based on submission age
- `daysSinceSubmission`: Days since document was submitted
- `isApproachingExpiration`: Whether document is approaching 7-day deadline
- `resubmissionCount`: Number of times document was resubmitted
- `previousRejectionReason`: Last rejection reason if applicable

### **✅ Folder-Aware Approval Service Fixes**
- **Fixed NullReferenceException**: Resolved repository usage issues
- **Enhanced Response Structure**: Now matches regular ApprovalService response
- **User Name Enrichment**: All user IDs now include corresponding names
- **Priority Calculation**: Automatic priority assignment based on document age
- **Complete Field Coverage**: All fields from PendingDocumentResponse included

### **✅ Document Count Accuracy**
- **Real-time Counts**: Folder tree and detail APIs now show accurate document counts
- **Dynamic Calculation**: Document counts calculated from actual database records
- **Cache Synchronization**: Cached counts updated when documents are added/moved

---

## ⚠️ **API Implementation Status**

### **✅ Fully Implemented APIs**
All folder document browsing, search, and folder-aware approval workflow APIs are implemented and working.

### **🚧 Partially Implemented APIs**
- **Folder Approval History** (`GET /{folderId}/history`) - Documented but not yet implemented
- **Folder Approval Statistics** (`GET /{folderId}/statistics`) - Documented but not yet implemented

### **📝 Implementation Notes**
- Base URL for approval APIs: `/api/document/folder-approval` (not `/folder-aware-approval`)
- Search API uses GET method with query parameters (not POST with request body)
- **Document listing APIs return ALL documents** (no pagination) as requested
- All APIs now include `documentFileId` and `versionId` for proper document management

---

## 📤 Document Upload & Management with Folders

**Base URL:** `/api/document`

**Frontend Usage:** Use these APIs for document upload forms, file management, and document lifecycle operations.

### 29. Upload Document Draft to Folder
**POST** `/drafts`

**Frontend Use Case:** Document upload forms, drag-and-drop upload interfaces with folder selection.

Upload a new document directly to a specific folder.

**Request Body (multipart/form-data):**
- `file`: Document file
- `title`: Document title
- `description`: Document description (optional)
- `folderId`: Target folder ID
- `documentTypeId`: Document type ID
- `tags`: Tags array (optional)
- `isPublic`: Public visibility flag (optional)
- `versionName`: Version name

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-001",
    "versionId": "version-001",
    "title": "New Policy Document",
    "fileName": "policy.pdf",
    "folderId": "folder-001",
    "folderPath": "HR Policies",
    "status": "Draft",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Document draft uploaded successfully"
}
```

### 30. Update Document Draft
**PUT** `/drafts/{documentId}`

**Frontend Use Case:** Document editor interfaces, metadata update forms.

Update document metadata and optionally move to different folder.

**Request Body (multipart/form-data):**
- `file`: New document file (optional)
- `title`: Updated title (optional)
- `description`: Updated description (optional)
- `folderId`: New folder ID (optional)
- `tags`: Updated tags (optional)

### 31. Create New Document Version
**POST** `/documents/{documentId}/versions`

**Frontend Use Case:** Version management interfaces, document revision workflows.

Create new version of existing document with folder context preservation.

**Request Body (multipart/form-data):**
- `file`: New version file
- `versionName`: Version name
- `description`: Version description
- `folderId`: Target folder (optional, inherits from parent if not specified)

---

## � Advanced Folder Operations

**Base URL:** `/api/document/folder-permissions`

**Frontend Usage:** Use these APIs for advanced folder management, bulk operations, and administrative functions.

### 32. Bulk Set Permissions
**POST** `/{folderId}/bulk`

**Frontend Use Case:** Bulk permission management interfaces, team setup wizards.

Set multiple permissions at once with optional subfolder application.

**Request Body:**
```json
{
  "permissions": [
    {
      "userId": "user-001",
      "permissionType": "Edit"
    },
    {
      "departmentId": "dept-001",
      "permissionType": "View"
    }
  ],
  "applyToSubfolders": true
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "perm-001",
      "userId": "user-001",
      "permissionType": "Edit",
      "applied": true
    },
    {
      "id": "perm-002",
      "departmentId": "dept-001",
      "permissionType": "View",
      "applied": true
    }
  ],
  "message": "Bulk permissions set successfully"
}
```

### 33. Copy Permissions
**POST** `/{sourceFolderId}/copy-to/{targetFolderId}`

**Frontend Use Case:** Folder template application, permission replication tools.

Copy all permissions from source folder to target folder.

**Request Body:**
```json
{
  "overwriteExisting": true,
  "applyToSubfolders": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sourceFolderId": "folder-001",
    "targetFolderId": "folder-002",
    "copiedPermissions": 5,
    "overwrittenPermissions": 2
  },
  "message": "Permissions copied successfully"
}
```

### 34. Validate Folder Action
**GET** `/{folderId}/validate-action`

**Frontend Use Case:** UI element visibility control, action validation before execution.

Validate if user can perform specific action on folder.

**Parameters:**
- `action` (query): Action to validate (View, Edit, Delete, Manage, Upload)
- `userId` (query, optional): User ID to check (defaults to current user)

**Response:**
```json
{
  "success": true,
  "data": {
    "folderId": "folder-001",
    "action": "Edit",
    "isAllowed": true,
    "reason": "User has Edit permission"
  },
  "message": "Action validation completed"
}
```

**Base URL:** `/api/document/folders`

### 35. Get Folder Breadcrumb
**GET** `/{folderId}/breadcrumb`

**Frontend Use Case:** Navigation breadcrumbs, folder hierarchy display.

Get breadcrumb navigation path for a folder.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "root",
      "name": "Root",
      "level": 0,
      "isClickable": true
    },
    {
      "id": "folder-001",
      "name": "HR Policies",
      "level": 1,
      "isClickable": true
    }
  ],
  "message": "Folder breadcrumb retrieved successfully"
}
```

### 36. Search Folders
**GET** `/search`

**Frontend Use Case:** Folder search interfaces, folder picker components.

Search folders by name, description, or path.

**Parameters:**
- `query` (query): Search query
- `departmentId` (query, optional): Filter by department
- `includePublic` (query, optional): Include public folders
- `maxResults` (query, optional): Maximum results to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder-001",
      "name": "HR Policies",
      "fullPath": "HR Policies",
      "departmentName": "Human Resources",
      "isPublic": false,
      "documentCount": 12
    }
  ],
  "message": "Found 5 matching folders"
}
```

### 37. Validate Folder Name
**POST** `/validate-name`

**Frontend Use Case:** Real-time validation in folder creation forms, name availability checking.

Validate if folder name is available in parent folder.

**Request Body:**
```json
{
  "name": "New Folder Name",
  "parentFolderId": "folder-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isAvailable": true,
    "suggestedName": null
  },
  "message": "Folder name is available"
}
```

---

## ���📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## 🚀 Usage Examples

### Creating a Public Folder
```bash
curl -X POST "/api/document/folders" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Company Announcements",
    "description": "Public announcements for all employees",
    "isPublic": true,
    "departmentId": null
  }'
```

### Creating a Department Folder
```bash
curl -X POST "/api/document/folders" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HR Confidential",
    "description": "Confidential HR documents",
    "isPublic": false,
    "departmentId": "hr-dept-001",
    "initialPermissions": [
      {
        "departmentId": "hr-dept-001",
        "permissionType": "Edit"
      }
    ]
  }'
```

### Getting Department Folder Tree
```bash
curl -X GET "/api/document/folders/tree/department/hr-dept-001?includeSystemFolders=true&maxDepth=3" \
  -H "Authorization: Bearer {token}"
```

---

## 📋 Notes

- All timestamps are in UTC format
- Folder names must be unique within the same parent folder
- System folders cannot be deleted or renamed by regular users
- Public folders are read-only for non-managers
- Department folders inherit permissions from parent by default
- Google Drive integration maintains real-time synchronization

---

## 🎯 Frontend Developer Quick Reference

### **API Categories Overview**

| Category | Base URL | Primary Use Cases |
|----------|----------|-------------------|
| **Folder CRUD** | `/api/document/folders` | Tree navigation, folder management, basic operations |
| **Folder Permissions** | `/api/document/folder-permissions` | Access control, security management, user permissions |
| **Folder Documents** | `/api/document/folder-documents` | Document browsing, search, file management |
| **✅ Folder-Aware Approval** | `/api/document/folder-approval` | ✅ **Corrected URL** - Workflow management, approval processes |
| **Document Upload** | `/api/document` | File uploads, document lifecycle |

### **Common Frontend Workflows**

#### **1. Folder Browser Interface**
```
1. GET /folders/tree → Display folder hierarchy
2. GET /folder-documents/browse → Show folder contents
3. GET /{folderId}/permissions/check → Validate user actions
4. GET /{folderId}/breadcrumb → Show navigation path
```

#### **2. Document Upload with Folder Selection**
```
1. GET /folders/accessible → Get available folders
2. POST /validate-name → Validate folder names (if creating new)
3. POST /drafts → Upload document to selected folder
4. GET /folder-documents/{folderId}/list → Refresh folder contents
```

#### **3. Permission Management Interface**
```
1. GET /folder-permissions/{folderId} → Get current permissions
2. POST /folder-permissions/{folderId} → Add new permissions
3. DELETE /folder-permissions/{folderId}/{permissionId} → Remove permissions
4. POST /{folderId}/bulk → Bulk permission operations
```

#### **4. ✅ Approval Workflow Dashboard**
```
1. GET /folder-approval/queue → Get pending approvals (✅ corrected URL)
2. GET /folder-approval/{folderId}/pending → Get folder-specific pending docs
3. POST /folder-approval/{versionId}/approve → Approve documents
4. GET /folder-approval/{folderId}/history → View approval history
```

#### **5. Advanced Search Interface**
```
1. POST /folder-documents/search → Advanced document search
2. GET /folders/search → Find folders
3. GET /folder-documents/recent → Show recent activity
4. GET /{folderId}/statistics → Display folder analytics
```

### **Key Response Fields for Frontend**

#### **Folder Objects**
- `id`: Unique folder identifier
- `name`: Display name
- `fullPath`: Complete path for breadcrumbs
- `permissions.canView/canEdit/canDelete/canManage`: UI control flags
- `documentCount/subFolderCount`: ✅ **Real-time accurate counts**

#### **Permission Objects**
- `userEmail/userFullName`: Display user information
- `departmentName`: Show department context
- `permissionDescription`: Human-readable permission level
- `isInherited`: Show inheritance status
- `expiresAt`: Display expiration information

#### **✅ Enhanced Document Objects**
**Core Identification:**
- `id`: Document version ID
- `documentFileId`: ✅ **Parent document file ID**
- `versionId`: ✅ **Version identifier (same as id)**
- `title`: Document title
- `versionName`: ✅ **Version name (v1.0, v2.0, etc.)**

**File Information:**
- `fileType`: ✅ **File extension (PDF, DOCX, XLSX)**
- `fileSize`: File size in bytes
- `summary`: ✅ **Document summary**
- `description`: ✅ **Document description**

**User Information (Enriched):**
- `submittedBy`: User ID who submitted
- `submittedByName`: ✅ **Full name of submitter**
- `ownerId`: Document owner ID
- `ownerName`: ✅ **Full name of owner**
- `createdBy`: User ID who created
- `reviewedBy`: User ID of reviewer
- `reviewedByName`: ✅ **Full name of reviewer**

**Department & Type:**
- `departmentId`: Department ID
- `departmentName`: ✅ **Human-readable department name**
- `documentTypeId`: Document type ID
- `documentTypeName`: ✅ **Human-readable document type**

**Status & Workflow:**
- `status`: Document status (Draft, Pending, Approved, Rejected)
- `priority`: ✅ **Auto-calculated priority (Normal/Medium/High)**
- `daysSinceSubmission`: ✅ **Days since submission**
- `isApproachingExpiration`: ✅ **Whether approaching deadline**
- `isBeingReviewed`: ✅ **Whether currently under review**

**Document Properties:**
- `isPublic`: ✅ **Public/private access indicator**
- `signedBy`: ✅ **Person who signed the document**
- `effectiveFrom`/`effectiveUntil`: ✅ **Document validity dates**
- `tags`: Document tags array
- `folderPath`: Show document location
- `searchSnippet`: Highlight search matches
- `lastUpdatedTime`: Sort and display timestamps

### **Error Handling Patterns**

```javascript
// Standard error response format
{
  "success": false,
  "errorCode": "ACCESS_DENIED",
  "message": "You do not have permission to access this folder",
  "statusCode": 403
}

// Common error codes to handle:
// - FOLDER_NOT_FOUND (404)
// - ACCESS_DENIED (403)
// - INVALID_REQUEST (400)
// - DUPLICATE_NAME (409)
// - OPERATION_FAILED (500)
```

### **Performance Optimization Tips**

1. **Batch Operations**: Use bulk APIs for multiple permissions
2. **Caching**: Cache folder trees and permission checks
3. **Pagination**: Always implement pagination for large lists
4. **Lazy Loading**: Load folder contents on demand
5. **Permission Validation**: Check permissions before showing UI elements

### **Security Considerations**

1. **JWT Tokens**: All APIs require valid JWT authentication
2. **Permission Checks**: Validate user permissions before actions
3. **Department Isolation**: Respect department-based access control
4. **Audit Trail**: Log important folder and permission changes
5. **Input Validation**: Validate all user inputs on frontend

---

## 📋 **Summary of 2024 Enhancements**

### **🎯 Key Improvements Made**

1. **✅ Complete Document Information**
   - Added `documentFileId` and `versionId` to all document responses
   - Added `fileType` extraction from filenames (PDF, DOCX, XLSX, etc.)
   - Added comprehensive document metadata (signedBy, effectiveFrom/Until, etc.)

2. **✅ User Name Enrichment**
   - All user IDs now include corresponding full names
   - `submittedByName`, `ownerName`, `reviewedByName`, `departmentName`
   - Automatic enrichment via DocumentEnrichmentService

3. **✅ Fixed Folder-Aware Approval Service**
   - Resolved NullReferenceException from improper repository usage
   - Enhanced response structure to match regular ApprovalService
   - Added priority calculation and comprehensive field coverage

4. **✅ Accurate Document Counts**
   - Folder tree and detail APIs now show real-time document counts
   - Dynamic calculation from actual database records instead of cached fields
   - Automatic cache synchronization when documents are added/moved

5. **✅ No Pagination for Document Lists**
   - Folder document listing APIs return ALL documents as requested
   - Simplified frontend integration without pagination complexity
   - Maintains filtering and sorting capabilities

### **🚀 Frontend Benefits**

- **Complete Data**: All necessary document information in single API calls
- **User-Friendly**: Human-readable names instead of just IDs
- **Accurate Counts**: Real-time folder document counts for UI display
- **Consistent Structure**: All APIs follow same enhanced response format
- **Better UX**: Priority indicators and status information for better workflow management

### **🔧 Technical Improvements**

- **Repository Pattern**: Proper UnitOfWork usage throughout all services
- **Performance**: Optimized queries with proper includes and predicates
- **Error Handling**: Robust error handling with meaningful error messages
- **Code Quality**: Consistent patterns across all folder-related services
