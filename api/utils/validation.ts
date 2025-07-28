/**
 * Validation utility functions
 * Network-specific validation for IP addresses, CIDR, ports
 */

/**
 * Validates IPv4 address format
 */
export const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

/**
 * Validates CIDR notation format (e.g., 192.168.1.0/24)
 */
export const isValidCIDR = (cidr: string): boolean => {
  const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
  
  if (!cidrRegex.test(cidr)) {
    return false;
  }

  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  // Validate IP part
  if (!isValidIPAddress(ip)) {
    return false;
  }
  
  // Validate prefix length (0-32 for IPv4)
  return prefix >= 0 && prefix <= 32;
};

/**
 * Validates port number is within valid range (1-65535)
 */
export const isValidPortRange = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

/**
 * Validates array of port numbers
 */
export const isValidPortArray = (ports: number[]): boolean => {
  return Array.isArray(ports) && ports.every(port => isValidPortRange(port));
};

/**
 * Validates domain name format (basic validation)
 * Supports both single-label domains (localhost) and multi-label domains (example.com)
 */
export const isValidDomain = (domain: string): boolean => {
  // Allow single-label domains (like localhost) or multi-label domains
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain) && domain.length <= 253;
};

// Legacy export for backward compatibility
export const validationUtils = {
  isValidIPAddress,
  isValidCIDR,
  isValidPortRange,
  isValidPortArray,
  isValidDomain
};