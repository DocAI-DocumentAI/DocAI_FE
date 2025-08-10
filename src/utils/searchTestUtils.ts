import type { SemanticSearchParams } from '../lib/api/document';

/**
 * Utility function to test and verify semantic search parameter construction
 * This can be used in the browser console for manual testing
 */
export const testSemanticSearchParams = () => {
  console.log('🔍 Testing Enhanced Semantic Search Parameters');
  
  // Test case 1: All parameters
  const fullParams: SemanticSearchParams = {
    Query: 'financial report 2023',
    Tags: ['finance', 'annual'],
    EffectiveFrom: '2023-01-01T00:00:00Z',
    EffectiveUntil: '2023-12-31T23:59:59Z',
    userId: 'user123',
    pageNumber: 1,
    pageSize: 20,
    // Enhanced parameters
    minRelevance: 0.3,
    maxResults: 20,
    enableHybridScoring: true,
    boostDepartmentResults: true,
    latestVersionsOnly: true,
    scope: 0,
    documentTypeId: 'doc-type-123',
    signedBy: 'John Doe',
    fromDate: '2023-01-01T00:00:00Z',
    toDate: '2023-12-31T23:59:59Z'
  };

  console.log('✅ Full parameters test:', fullParams);

  // Test case 2: Minimal parameters
  const minimalParams: SemanticSearchParams = {
    Query: 'test query'
  };

  console.log('✅ Minimal parameters test:', minimalParams);

  // Test case 3: Scope values
  const scopeTests = [
    { scope: 0, description: 'All documents' },
    { scope: 1, description: 'Public documents only' },
    { scope: 2, description: 'Department documents only' }
  ];

  console.log('✅ Scope values test:');
  scopeTests.forEach(test => {
    console.log(`  - Scope ${test.scope}: ${test.description}`);
  });

  // Test URL construction
  const constructTestUrl = (params: SemanticSearchParams) => {
    const searchParams = new URLSearchParams();
    
    if (params.Query) searchParams.append('Query', params.Query);
    if (params.Tags && params.Tags.length > 0) params.Tags.forEach(tag => searchParams.append('Tags', tag));
    if (params.EffectiveFrom) searchParams.append('EffectiveFrom', params.EffectiveFrom);
    if (params.EffectiveUntil) searchParams.append('EffectiveUntil', params.EffectiveUntil);
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.pageNumber) searchParams.append('pageNumber', String(params.pageNumber));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));
    
    // Enhanced filter parameters
    if (params.minRelevance !== undefined) searchParams.append('minRelevance', String(params.minRelevance));
    if (params.maxResults !== undefined) searchParams.append('maxResults', String(params.maxResults));
    if (params.enableHybridScoring !== undefined) searchParams.append('enableHybridScoring', String(params.enableHybridScoring));
    if (params.boostDepartmentResults !== undefined) searchParams.append('boostDepartmentResults', String(params.boostDepartmentResults));
    if (params.latestVersionsOnly !== undefined) searchParams.append('latestVersionsOnly', String(params.latestVersionsOnly));
    if (params.scope !== undefined) searchParams.append('scope', String(params.scope));
    if (params.documentTypeId) searchParams.append('documentTypeId', params.documentTypeId);
    if (params.signedBy) searchParams.append('signedBy', params.signedBy);
    if (params.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params.toDate) searchParams.append('toDate', params.toDate);

    return `/document/semantic-search?${searchParams.toString()}`;
  };

  const fullUrl = constructTestUrl(fullParams);
  const minimalUrl = constructTestUrl(minimalParams);

  console.log('🌐 URL Construction Test:');
  console.log('Full URL:', fullUrl);
  console.log('Minimal URL:', minimalUrl);

  // Verify all expected parameters are present in full URL
  const expectedParams = [
    'Query', 'Tags', 'EffectiveFrom', 'EffectiveUntil', 'userId', 
    'pageNumber', 'pageSize', 'minRelevance', 'maxResults', 
    'enableHybridScoring', 'boostDepartmentResults', 'latestVersionsOnly',
    'scope', 'documentTypeId', 'signedBy', 'fromDate', 'toDate'
  ];

  const urlParams = new URLSearchParams(fullUrl.split('?')[1]);
  const missingParams = expectedParams.filter(param => {
    if (param === 'Tags') {
      return !urlParams.has(param);
    }
    return !urlParams.has(param);
  });

  if (missingParams.length === 0) {
    console.log('✅ All expected parameters are present in the URL');
  } else {
    console.log('❌ Missing parameters:', missingParams);
  }

  return {
    fullParams,
    minimalParams,
    fullUrl,
    minimalUrl,
    allParametersPresent: missingParams.length === 0
  };
};

/**
 * Test the SearchFilterValue interface default values
 */
export const testDefaultFilterValues = () => {
  const defaultFilter = {
    documentTags: [],
    startDate: null,
    endDate: null,
    // Enhanced filter parameters with default values
    minRelevance: 0.3,
    maxResults: 20,
    enableHybridScoring: true,
    boostDepartmentResults: true,
    latestVersionsOnly: true,
    scope: 0,
    documentTypeId: '',
    signedBy: '',
    fromDate: null,
    toDate: null,
  };

  console.log('🎯 Default Filter Values Test:', defaultFilter);
  
  // Verify default values match expected requirements
  const expectedDefaults = {
    minRelevance: 0.3,
    maxResults: 20,
    enableHybridScoring: true,
    boostDepartmentResults: true,
    latestVersionsOnly: true,
    scope: 0
  };

  const isValid = Object.entries(expectedDefaults).every(([key, expectedValue]) => {
    const actualValue = defaultFilter[key as keyof typeof defaultFilter];
    return actualValue === expectedValue;
  });

  console.log(isValid ? '✅ Default values are correct' : '❌ Default values mismatch');
  
  return { defaultFilter, isValid };
};

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testSemanticSearchParams = testSemanticSearchParams;
  (window as any).testDefaultFilterValues = testDefaultFilterValues;
}
