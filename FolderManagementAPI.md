# Folder Management API Documentation

## Overview
The Folder Management API provides comprehensive functionality for organizing documents in a hierarchical folder structure with department-based access control. All folders are synchronized with Google Drive for seamless file management.

## Authentication
All endpoints require JWT Bearer token authentication. The token should contain:
- `userId`: User identifier
- `departmentId`: User's department for access control

```http
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
https://your-api-domain/api/document/folders
```

---

## 📁 Folder Management Endpoints

### 1. Create Folder
Creates a new folder with proper permissions and Google Drive synchronization.

**Endpoint:** `POST /api/document/folders`

**Request Body:**
```json
{
  "name": "Project Documents",
  "description": "Folder for storing project-related documents",
  "parentFolderId": "123e4567-e89b-12d3-a456-426614174000",
  "isPublic": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Project Documents",
    "description": "Folder for storing project-related documents",
    "path": "/approved/IT/Project Documents",
    "parentFolderId": "123e4567-e89b-12d3-a456-426614174000",
    "isPublic": false,
    "folderType": "user",
    "departmentId": "dept-001",
    "ownerId": "user-123",
    "googleDriveFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Folder Tree
Retrieves the hierarchical folder structure with enhanced visualization features.

**Endpoint:** `GET /api/document/folders/tree`

**Query Parameters:**
- `maxDepth` (optional): Maximum depth to load (default: 5)
- `includeDocuments` (optional): Include document counts (default: false)
- `expandedFolders` (optional): Comma-separated folder IDs to expand

**Request:**
```http
GET /api/document/folders/tree?maxDepth=3&includeDocuments=true&expandedFolders=123e4567-e89b-12d3-a456-426614174000,456e7890-e89b-12d3-a456-426614174001
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder tree retrieved successfully",
  "data": {
    "rootNodes": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "approved",
        "path": "/approved",
        "folderType": "system",
        "isPublic": true,
        "documentCount": 25,
        "userPermission": "read",
        "canExpand": true,
        "canCreateSubfolders": false,
        "canUploadFiles": false,
        "isExpanded": true,
        "children": [
          {
            "id": "456e7890-e89b-12d3-a456-426614174001",
            "name": "IT",
            "path": "/approved/IT",
            "folderType": "system",
            "isPublic": false,
            "documentCount": 12,
            "userPermission": "write",
            "canExpand": true,
            "canCreateSubfolders": true,
            "canUploadFiles": true,
            "isExpanded": false,
            "children": []
          }
        ]
      }
    ],
    "departmentId": "dept-001",
    "totalFolders": 15,
    "totalDocuments": 125
  }
}
```

### 3. Get Folder Children (Lazy Loading)
Retrieves immediate children of a specific folder for lazy loading scenarios.

**Endpoint:** `GET /api/document/folders/children`

**Query Parameters:**
- `parentId` (optional): Parent folder ID (null for root)
- `includeDocuments` (optional): Include document counts

**Request:**
```http
GET /api/document/folders/children?parentId=123e4567-e89b-12d3-a456-426614174000&includeDocuments=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder children retrieved successfully",
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "IT Department",
      "path": "/approved/IT Department",
      "folderType": "system",
      "isPublic": false,
      "documentCount": 8,
      "userPermission": "write",
      "canExpand": true,
      "canCreateSubfolders": true,
      "canUploadFiles": true,
      "children": []
    }
  ]
}
```

### 4. Update Folder
Updates folder name and description.

**Endpoint:** `PUT /api/document/folders/{folderId}`

**Request Body:**
```json
{
  "name": "Updated Project Documents",
  "description": "Updated description for project documents"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder updated successfully",
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Updated Project Documents",
    "description": "Updated description for project documents",
    "path": "/approved/IT/Updated Project Documents",
    "parentFolderId": "123e4567-e89b-12d3-a456-426614174000",
    "isPublic": false,
    "folderType": "user",
    "departmentId": "dept-001",
    "ownerId": "user-123",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

### 5. Move Folder
Moves a folder to a new parent location.

**Endpoint:** `PUT /api/document/folders/{folderId}/move`

**Request Body:**
```json
{
  "newParentFolderId": "789e0123-e89b-12d3-a456-426614174002"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder moved successfully",
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Project Documents",
    "path": "/approved/HR/Project Documents",
    "parentFolderId": "789e0123-e89b-12d3-a456-426614174002",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 6. Delete Folder
Soft deletes a folder (moves to trash).

**Endpoint:** `DELETE /api/document/folders/{folderId}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

### 7. Search Folders
Searches folders by name with access control filtering.

**Endpoint:** `GET /api/document/folders/search`

**Query Parameters:**
- `searchTerm` (required): Search term for folder names
- `maxResults` (optional): Maximum results (default: 20)

**Request:**
```http
GET /api/document/folders/search?searchTerm=project&maxResults=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder search completed successfully",
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Project Documents",
      "path": "/approved/IT/Project Documents",
      "folderType": "user",
      "isPublic": false,
      "documentCount": 15,
      "userPermission": "write",
      "parentFolderName": "IT"
    }
  ]
}
```

### 8. Get Folder Statistics
Retrieves comprehensive statistics about the folder tree.

**Endpoint:** `GET /api/document/folders/statistics`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tree statistics retrieved successfully",
  "data": {
    "totalFolders": 45,
    "systemFolders": 8,
    "userFolders": 37,
    "publicFolders": 12,
    "totalDocuments": 234,
    "maxDepth": 6,
    "emptyFolders": 5
  }
}
```

### 9. Get Subtree
Retrieves a subtree starting from a specific folder.

**Endpoint:** `GET /api/document/folders/{rootId}/subtree`

**Query Parameters:**
- `maxDepth` (optional): Maximum depth (default: 3)
- `includeDocuments` (optional): Include document counts

**Request:**
```http
GET /api/document/folders/123e4567-e89b-12d3-a456-426614174000/subtree?maxDepth=2&includeDocuments=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subtree retrieved successfully",
  "data": {
    "rootNodes": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "IT Department",
        "path": "/approved/IT Department",
        "folderType": "system",
        "isPublic": false,
        "documentCount": 25,
        "userPermission": "admin",
        "children": [
          {
            "id": "456e7890-e89b-12d3-a456-426614174001",
            "name": "Projects",
            "path": "/approved/IT Department/Projects",
            "folderType": "user",
            "isPublic": false,
            "documentCount": 12,
            "userPermission": "write",
            "children": []
          }
        ]
      }
    ],
    "departmentId": "dept-001",
    "totalFolders": 8,
    "totalDocuments": 45
  }
}
```

---

## 🔐 Folder Permission Management Endpoints

### 1. Grant User Permission
Grants specific permission to a user for a folder.

**Endpoint:** `POST /api/document/folders/{folderId}/permissions/users`

**Request Body:**
```json
{
  "userId": "user-456",
  "permission": "write"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User permission granted successfully",
  "data": {
    "id": "perm-001",
    "folderId": "456e7890-e89b-12d3-a456-426614174001",
    "userId": "user-456",
    "permission": "write",
    "grantedBy": "user-123",
    "grantedAt": "2024-01-15T13:30:00Z"
  }
}
```

### 2. Grant Department Permission
Grants permission to an entire department for a folder.

**Endpoint:** `POST /api/document/folders/{folderId}/permissions/departments`

**Request Body:**
```json
{
  "departmentId": "dept-002",
  "permission": "read"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Department permission granted successfully",
  "data": {
    "id": "perm-002",
    "folderId": "456e7890-e89b-12d3-a456-426614174001",
    "departmentId": "dept-002",
    "permission": "read",
    "grantedBy": "user-123",
    "grantedAt": "2024-01-15T13:35:00Z"
  }
}
```

### 3. Get Folder Permissions
Retrieves all permissions for a specific folder.

**Endpoint:** `GET /api/document/folders/{folderId}/permissions`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder permissions retrieved successfully",
  "data": {
    "folderId": "456e7890-e89b-12d3-a456-426614174001",
    "folderName": "Project Documents",
    "userPermissions": [
      {
        "id": "perm-001",
        "userId": "user-456",
        "userName": "John Doe",
        "permission": "write",
        "grantedBy": "user-123",
        "grantedAt": "2024-01-15T13:30:00Z"
      }
    ],
    "departmentPermissions": [
      {
        "id": "perm-002",
        "departmentId": "dept-002",
        "departmentName": "Human Resources",
        "permission": "read",
        "grantedBy": "user-123",
        "grantedAt": "2024-01-15T13:35:00Z"
      }
    ]
  }
}
```

### 4. Update User Permission
Updates permission level for a specific user.

**Endpoint:** `PUT /api/document/folders/{folderId}/permissions/users/{userId}`

**Request Body:**
```json
{
  "permission": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User permission updated successfully",
  "data": {
    "id": "perm-001",
    "folderId": "456e7890-e89b-12d3-a456-426614174001",
    "userId": "user-456",
    "permission": "admin",
    "updatedBy": "user-123",
    "updatedAt": "2024-01-15T14:00:00Z"
  }
}
```

### 5. Revoke User Permission
Removes permission for a specific user from a folder.

**Endpoint:** `DELETE /api/document/folders/{folderId}/permissions/users/{userId}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User permission revoked successfully"
}
```

### 6. Revoke Department Permission
Removes permission for a department from a folder.

**Endpoint:** `DELETE /api/document/folders/{folderId}/permissions/departments/{departmentId}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department permission revoked successfully"
}
```

---

## 📋 Step-by-Step Usage Guide

### Step 1: Set Up Folder Structure
1. **Create root department folders** (usually done by admin):
   ```http
   POST /api/document/folders
   {
     "name": "IT Department",
     "description": "IT department documents",
     "isPublic": false
   }
   ```

2. **Create project-specific subfolders**:
   ```http
   POST /api/document/folders
   {
     "name": "Project Alpha",
     "description": "Documents for Project Alpha",
     "parentFolderId": "it-dept-folder-id",
     "isPublic": false
   }
   ```

### Step 2: Set Up Permissions
1. **Grant department access**:
   ```http
   POST /api/document/folders/{folderId}/permissions/departments
   {
     "departmentId": "dept-001",
     "permission": "write"
   }
   ```

2. **Grant specific user access**:
   ```http
   POST /api/document/folders/{folderId}/permissions/users
   {
     "userId": "project-manager-id",
     "permission": "admin"
   }
   ```

### Step 3: Navigate and Manage
1. **Get folder tree for navigation**:
   ```http
   GET /api/document/folders/tree?maxDepth=3&includeDocuments=true
   ```

2. **Search for specific folders**:
   ```http
   GET /api/document/folders/search?searchTerm=project
   ```

3. **Upload documents to folders** (using existing document upload API with folder reference)

### Step 4: Organize and Maintain
1. **Move folders as needed**:
   ```http
   PUT /api/document/folders/{folderId}/move
   {
     "newParentFolderId": "new-parent-id"
   }
   ```

2. **Update folder information**:
   ```http
   PUT /api/document/folders/{folderId}
   {
     "name": "Updated Folder Name",
     "description": "Updated description"
   }
   ```

3. **Monitor usage with statistics**:
   ```http
   GET /api/document/folders/statistics
   ```

---

## 🔒 Permission Levels

- **`read`**: View folder contents and download documents
- **`write`**: Read permissions + upload documents and create subfolders
- **`admin`**: Write permissions + manage folder permissions, move/rename/delete folders

## 🌐 Google Drive Integration

All folder operations are automatically synchronized with Google Drive:
- Creating a folder creates the corresponding Google Drive folder
- Moving folders updates the Google Drive structure
- Permissions are synchronized with Google Drive sharing settings
- Documents uploaded to folders are stored in the correct Google Drive location

## ⚠️ Error Responses

All endpoints may return these common error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Folder name is required"
    }
  ]
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions to access this folder"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Folder not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An error occurred while processing your request"
}
```
