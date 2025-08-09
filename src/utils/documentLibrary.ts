import moment from 'moment';
import type { DocumentDraftResponse, OfficialDocumentsRequest } from '../types/DocumentLibrary';

/**
 * Document Library Utility Functions
 * Following project patterns and conventions
 */

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Date formatting utilities
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return moment(dateString).format('MMM DD, YYYY');
};

export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return moment(dateString).format('MMM DD, YYYY HH:mm');
};

export const formatRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return moment(dateString).fromNow();
};

// Document type color mapping
export const getDocumentTypeColor = (typeName: string): string => {
  const colorMap: Record<string, string> = {
    'Policy': 'blue',
    'Procedure': 'green',
    'Guidelines': 'orange',
    'Manual': 'purple',
    'Form': 'cyan',
    'Template': 'magenta',
    'Report': 'red',
    'Specification': 'geekblue',
    'Standard': 'gold',
    'Regulation': 'volcano',
    'default': 'default'
  };
  
  return colorMap[typeName] || colorMap.default;
};

// Document status color mapping
export const getDocumentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'Draft': 'orange',
    'Under Review': 'blue',
    'Approved': 'green',
    'Published': 'success',
    'Archived': 'default',
    'Rejected': 'red',
    'Expired': 'error',
    'Active': 'green',
    'Inactive': 'default'
  };
  
  return colorMap[status] || 'default';
};

// File type icon mapping
export const getFileTypeIcon = (fileType: string): string => {
  const iconMap: Record<string, string> = {
    'PDF': '📄',
    'DOCX': '📝',
    'DOC': '📝',
    'TXT': '📄',
    'RTF': '📄',
    'XLS': '📊',
    'XLSX': '📊',
    'PPT': '📊',
    'PPTX': '📊'
  };
  
  return iconMap[fileType.toUpperCase()] || '📄';
};

// Document filtering utilities
export const cleanApiParams = (params: OfficialDocumentsRequest): OfficialDocumentsRequest => {
  const cleanedParams = { ...params };
  
  // Remove empty values
  Object.keys(cleanedParams).forEach(key => {
    const value = (cleanedParams as any)[key];
    if (
      value === '' || 
      value === 0 || 
      value === null || 
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete (cleanedParams as any)[key];
    }
  });
  
  return cleanedParams;
};

// Document search and filtering helpers
export const searchDocuments = (
  documents: DocumentDraftResponse[], 
  searchTerm: string
): DocumentDraftResponse[] => {
  if (!searchTerm.trim()) return documents;
  
  const term = searchTerm.toLowerCase();
  return documents.filter(doc => 
    doc.title.toLowerCase().includes(term) ||
    doc.description?.toLowerCase().includes(term) ||
    doc.summary?.toLowerCase().includes(term) ||
    doc.fileName.toLowerCase().includes(term) ||
    doc.tags.some(tag => tag.toLowerCase().includes(term)) ||
    doc.documentTypeName?.toLowerCase().includes(term)
  );
};

// Document sorting utilities
export type SortField = 'title' | 'createdTime' | 'fileSize' | 'status' | 'documentType';
export type SortOrder = 'asc' | 'desc';

export const sortDocuments = (
  documents: DocumentDraftResponse[], 
  field: SortField, 
  order: SortOrder = 'asc'
): DocumentDraftResponse[] => {
  return [...documents].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (field) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdTime':
        aValue = new Date(a.createdTime);
        bValue = new Date(b.createdTime);
        break;
      case 'fileSize':
        aValue = a.fileSize || 0;
        bValue = b.fileSize || 0;
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      case 'documentType':
        aValue = a.documentTypeName?.toLowerCase() || '';
        bValue = b.documentTypeName?.toLowerCase() || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Document lifecycle utilities
export const isDocumentExpiring = (effectiveUntil: string | undefined, daysAhead: number = 30): boolean => {
  if (!effectiveUntil) return false;
  
  const expirationDate = new Date(effectiveUntil);
  const today = new Date();
  const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  
  return expirationDate >= today && expirationDate <= futureDate;
};

export const isDocumentExpired = (effectiveUntil: string | undefined): boolean => {
  if (!effectiveUntil) return false;
  
  const expirationDate = new Date(effectiveUntil);
  const today = new Date();
  
  return expirationDate < today;
};

export const getDocumentLifecycleStatus = (
  effectiveFrom: string | undefined,
  effectiveUntil: string | undefined
): 'upcoming' | 'active' | 'expiring' | 'expired' | 'unknown' => {
  const today = new Date();
  
  if (effectiveFrom) {
    const startDate = new Date(effectiveFrom);
    if (startDate > today) return 'upcoming';
  }
  
  if (effectiveUntil) {
    const endDate = new Date(effectiveUntil);
    if (endDate < today) return 'expired';
    if (isDocumentExpiring(effectiveUntil, 30)) return 'expiring';
  }
  
  if (effectiveFrom && effectiveUntil) {
    const startDate = new Date(effectiveFrom);
    const endDate = new Date(effectiveUntil);
    if (startDate <= today && endDate >= today) return 'active';
  }
  
  return 'unknown';
};

// URL and navigation utilities
export const getDocumentViewUrl = (documentId: string): string => {
  return `/document/${documentId}`;
};

export const getDocumentDownloadUrl = (documentId: string, versionId?: string): string => {
  const baseUrl = `/api/document/documents/${documentId}/download`;
  return versionId ? `${baseUrl}?versionId=${versionId}` : baseUrl;
};

// Validation utilities
export const validateFileSize = (size: number, maxSizeInMB: number = 100): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
};

export const validateFileType = (fileType: string, allowedTypes: string[] = ['PDF', 'DOCX', 'DOC', 'TXT', 'RTF']): boolean => {
  return allowedTypes.includes(fileType.toUpperCase());
};

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.statusText) return error.response.statusText;
  return 'An unexpected error occurred';
};

// Local storage utilities for document library preferences
export const STORAGE_KEYS = {
  DOCUMENT_LIBRARY_FILTERS: 'documentLibrary_filters',
  DOCUMENT_LIBRARY_VIEW_MODE: 'documentLibrary_viewMode',
  DOCUMENT_LIBRARY_PAGE_SIZE: 'documentLibrary_pageSize',
  DOCUMENT_LIBRARY_SORT: 'documentLibrary_sort'
} as const;

export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Constants for document library
export const DOCUMENT_LIBRARY_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_FILE_SIZE_MB: 100,
  SUPPORTED_FILE_TYPES: ['PDF', 'DOCX', 'DOC', 'TXT', 'RTF', 'XLS', 'XLSX', 'PPT', 'PPTX'],
  LIFECYCLE_WARNING_DAYS: 30
} as const;
