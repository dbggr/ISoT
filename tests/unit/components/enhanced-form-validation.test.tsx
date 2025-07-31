/**
 * Tests for enhanced form validation and user feedback components
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  ValidationDisplay, 
  FormValidationSummary, 
  FormSubmissionFeedback,
  useFormSubmission 
} from '@/components/common/form-validation'
import { 
  useServiceNameValidation,
  useIPAddressValidation,
  usePortValidation,
  useVLANValidation,
  useDomainValidation
} from '@/lib/hooks/use-field-validation'

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getServices: jest.fn().mockResolvedValue([]),
    getGroups: jest.fn().mockResolvedValue([])
  },
  isApiError: jest.fn(),
  getErrorMessage: jest.fn((error) => error?.message || 'Unknown error'),
  isNetworkError: jest.fn(),
  isValidationError: jest.fn(),
  isServerError: jest.fn()
}))

describe('Enhanced Form Validation Components', () => {
  describe('ValidationDisplay', () => {
    it('shows loading state during validation', () => {
      const state = {
        isValid: false,
        isValidating: true
      }

      render(<ValidationDisplay state={state} />)
      
      expect(screen.getByText('Validating...')).toBeInTheDocument()
      // SVG elements don't have img role, so we check for the SVG element directly
      const svg = screen.getByText('Validating...').previousElementSibling
      expect(svg).toHaveClass('animate-spin')
    })

    it('shows error state with message', () => {
      const state = {
        isValid: false,
        isValidating: false,
        error: 'This field is required'
      }

      render(<ValidationDisplay state={state} />)
      
      expect(screen.getByText('This field is required')).toBeInTheDocument()
      // The error message is in a span with text-destructive class
      const errorSpan = screen.getByText('This field is required')
      expect(errorSpan.parentElement).toHaveClass('text-destructive')
    })

    it('shows success state with message', () => {
      const state = {
        isValid: true,
        isValidating: false,
        success: 'Field is valid'
      }

      render(<ValidationDisplay state={state} showSuccess={true} />)
      
      expect(screen.getByText('Field is valid')).toBeInTheDocument()
      // The success message is in a span with text-green-600 class
      const successSpan = screen.getByText('Field is valid')
      expect(successSpan.parentElement).toHaveClass('text-green-600')
    })

    it('shows warning state with message', () => {
      const state = {
        isValid: true,
        isValidating: false,
        warning: 'This might cause issues'
      }

      render(<ValidationDisplay state={state} />)
      
      expect(screen.getByText('This might cause issues')).toBeInTheDocument()
      // The warning message is in a span with text-yellow-600 class
      const warningSpan = screen.getByText('This might cause issues')
      expect(warningSpan.parentElement).toHaveClass('text-yellow-600')
    })

    it('hides success message when showSuccess is false', () => {
      const state = {
        isValid: true,
        isValidating: false,
        success: 'Field is valid'
      }

      render(<ValidationDisplay state={state} showSuccess={false} />)
      
      expect(screen.queryByText('Field is valid')).not.toBeInTheDocument()
    })
  })

  describe('FormValidationSummary', () => {
    it('displays multiple errors', () => {
      const errors = ['Name is required', 'Email is invalid']
      
      render(<FormValidationSummary errors={errors} />)
      
      expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument()
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is invalid')).toBeInTheDocument()
    })

    it('displays single error with correct text', () => {
      const errors = ['Name is required']
      
      render(<FormValidationSummary errors={errors} />)
      
      expect(screen.getByText('Please fix the following error:')).toBeInTheDocument()
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    it('displays warnings', () => {
      const warnings = ['This might cause issues']
      
      render(<FormValidationSummary errors={[]} warnings={warnings} />)
      
      expect(screen.getByText('Warning:')).toBeInTheDocument()
      expect(screen.getByText('This might cause issues')).toBeInTheDocument()
    })

    it('does not render when no errors or warnings', () => {
      const { container } = render(<FormValidationSummary errors={[]} warnings={[]} />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('FormSubmissionFeedback', () => {
    it('shows submitting state', () => {
      const state = {
        isSubmitting: true
      }

      render(<FormSubmissionFeedback state={state} />)
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      // SVG elements don't have img role, so we check for the SVG element directly
      const svg = screen.getByText('Submitting...').previousElementSibling
      expect(svg).toHaveClass('animate-spin')
    })

    it('shows error state', () => {
      const state = {
        isSubmitting: false,
        error: 'Submission failed'
      }

      render(<FormSubmissionFeedback state={state} />)
      
      expect(screen.getByText('Submission failed')).toBeInTheDocument()
      // The alert has border-destructive class
      expect(screen.getByRole('alert')).toHaveClass('border-destructive/50')
    })

    it('shows success state', () => {
      const state = {
        isSubmitting: false,
        success: 'Submission successful'
      }

      render(<FormSubmissionFeedback state={state} />)
      
      expect(screen.getByText('Submission successful')).toBeInTheDocument()
      // The alert has border-green-200 class
      expect(screen.getByRole('alert')).toHaveClass('border-green-200')
    })
  })
})

// Test component for field validation hooks
function TestFieldValidation({ 
  type, 
  value 
}: { 
  type: 'service-name' | 'ip' | 'port' | 'vlan' | 'domain'
  value: any 
}) {
  let validation
  
  switch (type) {
    case 'service-name':
      validation = useServiceNameValidation(value)
      break
    case 'ip':
      validation = useIPAddressValidation(value)
      break
    case 'port':
      validation = usePortValidation(value)
      break
    case 'vlan':
      validation = useVLANValidation(value)
      break
    case 'domain':
      validation = useDomainValidation(value)
      break
    default:
      validation = { isValid: true, isValidating: false }
  }

  return <ValidationDisplay state={validation} />
}

describe('Field Validation Hooks', () => {
  describe('useIPAddressValidation', () => {
    it('validates correct IP address', async () => {
      render(<TestFieldValidation type="ip" value="192.168.1.1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Valid IP address')).toBeInTheDocument()
      })
    })

    it('shows error for invalid IP address', async () => {
      render(<TestFieldValidation type="ip" value="invalid-ip" />)
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid IP address format/)).toBeInTheDocument()
      })
    })
  })

  describe('usePortValidation', () => {
    it('validates correct port number', async () => {
      render(<TestFieldValidation type="port" value={80} />)
      
      await waitFor(() => {
        expect(screen.getByText('Valid port number')).toBeInTheDocument()
      })
    })

    it('shows error for invalid port number', async () => {
      render(<TestFieldValidation type="port" value={70000} />)
      
      await waitFor(() => {
        expect(screen.getByText('Port must be between 1 and 65535')).toBeInTheDocument()
      })
    })

    it('shows error for non-numeric port', async () => {
      render(<TestFieldValidation type="port" value="invalid" />)
      
      await waitFor(() => {
        expect(screen.getByText('Port must be a number')).toBeInTheDocument()
      })
    })
  })

  describe('useVLANValidation', () => {
    it('validates correct VLAN ID', async () => {
      render(<TestFieldValidation type="vlan" value={100} />)
      
      await waitFor(() => {
        expect(screen.getByText('Valid VLAN ID')).toBeInTheDocument()
      })
    })

    it('shows error for invalid VLAN ID', async () => {
      render(<TestFieldValidation type="vlan" value={5000} />)
      
      await waitFor(() => {
        expect(screen.getByText('VLAN ID must be between 1 and 4094')).toBeInTheDocument()
      })
    })

    it('allows empty VLAN ID (optional field)', async () => {
      const { container } = render(<TestFieldValidation type="vlan" value={undefined} />)
      
      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('useDomainValidation', () => {
    it('validates correct domain', async () => {
      render(<TestFieldValidation type="domain" value="example.com" />)
      
      await waitFor(() => {
        expect(screen.getByText('Valid domain format')).toBeInTheDocument()
      })
    })

    it('shows error for invalid domain', async () => {
      render(<TestFieldValidation type="domain" value="invalid..domain" />)
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid domain format/)).toBeInTheDocument()
      })
    })

    it('allows empty domain (optional field)', async () => {
      const { container } = render(<TestFieldValidation type="domain" value="" />)
      
      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })
  })
})

// Test component for form submission hook
function TestFormSubmission() {
  const formSubmission = useFormSubmission()

  return (
    <div>
      <FormSubmissionFeedback state={formSubmission.state} />
      <button onClick={() => formSubmission.setSubmitting(true)}>
        Set Submitting
      </button>
      <button onClick={() => formSubmission.setError('Test error')}>
        Set Error
      </button>
      <button onClick={() => formSubmission.setSuccess('Test success')}>
        Set Success
      </button>
      <button onClick={() => formSubmission.reset()}>
        Reset
      </button>
    </div>
  )
}

describe('useFormSubmission Hook', () => {
  it('manages form submission state correctly', async () => {
    const user = userEvent.setup()
    render(<TestFormSubmission />)

    // Test submitting state
    await user.click(screen.getByText('Set Submitting'))
    expect(screen.getByText('Submitting...')).toBeInTheDocument()

    // Test error state
    await user.click(screen.getByText('Set Error'))
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.queryByText('Submitting...')).not.toBeInTheDocument()

    // Test success state
    await user.click(screen.getByText('Set Success'))
    expect(screen.getByText('Test success')).toBeInTheDocument()
    expect(screen.queryByText('Test error')).not.toBeInTheDocument()

    // Test reset
    await user.click(screen.getByText('Reset'))
    expect(screen.queryByText('Test success')).not.toBeInTheDocument()
  })
})