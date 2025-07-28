/**
 * Unit tests for validation utility functions
 */

import {
  isValidIPAddress,
  isValidCIDR,
  isValidPortRange,
  isValidPortArray,
  isValidDomain
} from '../../../api/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidIPAddress', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isValidIPAddress('192.168.1.1')).toBe(true);
      expect(isValidIPAddress('10.0.0.1')).toBe(true);
      expect(isValidIPAddress('172.16.0.1')).toBe(true);
      expect(isValidIPAddress('255.255.255.255')).toBe(true);
      expect(isValidIPAddress('0.0.0.0')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIPAddress('256.1.1.1')).toBe(false);
      expect(isValidIPAddress('192.168.1')).toBe(false);
      expect(isValidIPAddress('192.168.1.1.1')).toBe(false);
      expect(isValidIPAddress('192.168.-1.1')).toBe(false);
      expect(isValidIPAddress('not.an.ip.address')).toBe(false);
      expect(isValidIPAddress('')).toBe(false);
    });
  });

  describe('isValidCIDR', () => {
    it('should validate correct CIDR notation', () => {
      expect(isValidCIDR('192.168.1.0/24')).toBe(true);
      expect(isValidCIDR('10.0.0.0/8')).toBe(true);
      expect(isValidCIDR('172.16.0.0/16')).toBe(true);
      expect(isValidCIDR('192.168.1.1/32')).toBe(true);
      expect(isValidCIDR('0.0.0.0/0')).toBe(true);
    });

    it('should reject invalid CIDR notation', () => {
      expect(isValidCIDR('192.168.1.0/33')).toBe(false);
      expect(isValidCIDR('192.168.1.0/-1')).toBe(false);
      expect(isValidCIDR('256.1.1.0/24')).toBe(false);
      expect(isValidCIDR('192.168.1.0')).toBe(false);
      expect(isValidCIDR('192.168.1.0/24/8')).toBe(false);
      expect(isValidCIDR('')).toBe(false);
    });
  });

  describe('isValidPortRange', () => {
    it('should validate ports within valid range', () => {
      expect(isValidPortRange(1)).toBe(true);
      expect(isValidPortRange(80)).toBe(true);
      expect(isValidPortRange(443)).toBe(true);
      expect(isValidPortRange(8080)).toBe(true);
      expect(isValidPortRange(65535)).toBe(true);
    });

    it('should reject ports outside valid range', () => {
      expect(isValidPortRange(0)).toBe(false);
      expect(isValidPortRange(-1)).toBe(false);
      expect(isValidPortRange(65536)).toBe(false);
      expect(isValidPortRange(100000)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(isValidPortRange(80.5)).toBe(false);
      expect(isValidPortRange(NaN)).toBe(false);
      expect(isValidPortRange(Infinity)).toBe(false);
    });
  });

  describe('isValidPortArray', () => {
    it('should validate arrays of valid ports', () => {
      expect(isValidPortArray([80, 443, 8080])).toBe(true);
      expect(isValidPortArray([1])).toBe(true);
      expect(isValidPortArray([65535])).toBe(true);
    });

    it('should reject arrays with invalid ports', () => {
      expect(isValidPortArray([80, 0, 443])).toBe(false);
      expect(isValidPortArray([80, 65536])).toBe(false);
      expect(isValidPortArray([-1, 80])).toBe(false);
    });

    it('should reject non-arrays', () => {
      expect(isValidPortArray(80 as any)).toBe(false);
      expect(isValidPortArray('80' as any)).toBe(false);
      expect(isValidPortArray(null as any)).toBe(false);
    });
  });

  describe('isValidDomain', () => {
    it('should validate correct domain names', () => {
      expect(isValidDomain('example.com')).toBe(true);
      expect(isValidDomain('sub.example.com')).toBe(true);
      expect(isValidDomain('api.v1.example.com')).toBe(true);
      expect(isValidDomain('localhost')).toBe(true);
      expect(isValidDomain('test-domain.co.uk')).toBe(true);
    });

    it('should reject invalid domain names', () => {
      expect(isValidDomain('')).toBe(false);
      expect(isValidDomain('.')).toBe(false);
      expect(isValidDomain('.example.com')).toBe(false);
      expect(isValidDomain('example.com.')).toBe(false);
      expect(isValidDomain('ex ample.com')).toBe(false);
      expect(isValidDomain('-example.com')).toBe(false);
      expect(isValidDomain('example-.com')).toBe(false);
    });

    it('should reject domains that are too long', () => {
      const longDomain = 'a'.repeat(250) + '.com';
      expect(isValidDomain(longDomain)).toBe(false);
    });
  });
});