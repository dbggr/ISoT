/**
 * Tests for the API client
 */

import { ApiClient, ApiClientError, isApiError, getErrorMessage } from '../../../lib/api'

describe('ApiClient', () => {
  describe('constructor', () => {
    it('should create an instance with default config', () => {
      const client = new ApiClient()
      expect(client).toBeInstanceOf(ApiClient)
    })

    it('should create an instance with custom config', () => {
      const client = new ApiClient({
        baseUrl: '/custom-api',
        timeout: 5000,
        retries: 1
      })
      expect(client).toBeInstanceOf(ApiClient)
    })
  })

  describe('ApiClientError', () => {
    it('should create error with correct properties', () => {
      const error = new ApiClientError({
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR'
      })

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiClientError)
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(400)
      expect(error.code).toBe('TEST_ERROR')
    })
  })
})

describe('Error Utility Functions', () => {
  describe('isApiError', () => {
    it('should identify API errors correctly', () => {
      const apiError = new ApiClientError({ message: 'API Error', status: 400 })
      const regularError = new Error('Regular error')
      
      expect(isApiError(apiError)).toBe(true)
      expect(isApiError(regularError)).toBe(false)
      expect(isApiError('string')).toBe(false)
      expect(isApiError(null)).toBe(false)
    })
  })

  describe('getErrorMessage', () => {
    it('should extract message from API errors', () => {
      const apiError = new ApiClientError({ message: 'API Error', status: 400 })
      expect(getErrorMessage(apiError)).toBe('API Error')
    })

    it('should extract message from regular errors', () => {
      const error = new Error('Regular error')
      expect(getErrorMessage(error)).toBe('Regular error')
    })

    it('should handle unknown errors', () => {
      expect(getErrorMessage('string')).toBe('An unexpected error occurred')
      expect(getErrorMessage(null)).toBe('An unexpected error occurred')
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
    })
  })
})