export const getTenantCode = (): string => {
  const hostname = window.location.hostname;
  
  // For localhost, return hardcoded tenant code
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'HMA001';
  }
  
  // Extract tenant code from subdomain
  const parts = hostname.split('.');
  return parts[0];
};
