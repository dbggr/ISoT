/**
 * Example usage of validation schemas
 * This file demonstrates how to use the validation schemas in forms and API calls
 */

import {
  createServiceSchema,
  updateServiceSchema,
  createGroupSchema,
  updateGroupSchema,
  validateServiceForm,
  validateGroupForm,
  validateIPAddress,
  validatePort,
  validateVLAN,
  validateDomain,
  createGroupNameUniqueSchema,
  type CreateServiceInput,
  type CreateGroupInput
} from './validations';

// Example: Validating service form data
export function validateServiceFormData(formData: unknown) {
  const result = validateServiceForm(formData);
  
  if (!result.success) {
    // Extract error messages for display
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

// Example: Validating group form data with uniqueness check
export function validateGroupFormWithUniqueness(
  formData: unknown, 
  existingGroupNames: string[],
  isEdit = false,
  currentName?: string
) {
  // First validate basic structure
  const basicResult = validateGroupForm(formData);
  if (!basicResult.success) {
    return {
      success: false,
      errors: basicResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    };
  }

  // Then check uniqueness
  const uniqueSchema = isEdit 
    ? updateGroupSchema.extend({
        name: createGroupNameUniqueSchema(existingGroupNames).shape.name
      })
    : createGroupNameUniqueSchema(existingGroupNames);

  const uniqueResult = uniqueSchema.safeParse(formData);
  if (!uniqueResult.success) {
    return {
      success: false,
      errors: uniqueResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    };
  }

  return { success: true, data: uniqueResult.data };
}

// Example: Real-time field validation for forms
export function validateFormField(fieldName: string, value: any) {
  switch (fieldName) {
    case 'ip_address':
      return validateIPAddress(value);
    case 'port':
      return validatePort(value);
    case 'vlan_id':
      return validateVLAN(value);
    case 'domain':
      return validateDomain(value);
    default:
      return { success: true, data: value };
  }
}

// Example: Preparing data for API submission
export function prepareServiceForSubmission(formData: CreateServiceInput) {
  // Validate the data
  const result = createServiceSchema.safeParse(formData);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
  }

  // Transform data if needed (e.g., ensure arrays are properly formatted)
  return {
    ...result.data,
    ipAddress: result.data.ipAddress ? result.data.ipAddress.split(',').map(ip => ip.trim()).join(',') : '',
    internalPorts: result.data.internalPorts.sort((a, b) => a - b), // Sort ports
    name: result.data.name.toLowerCase() // Normalize name
  };
}

// Example: Preparing group data for API submission
export function prepareGroupForSubmission(formData: CreateGroupInput) {
  const result = createGroupSchema.safeParse(formData);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
  }

  return {
    ...result.data,
    name: result.data.name.toLowerCase(), // Normalize name
    description: result.data.description?.trim() || undefined // Clean description
  };
}

// Example: Batch validation for bulk operations
export function validateBulkServiceData(services: unknown[]) {
  const results = services.map((service, index) => {
    const result = createServiceSchema.safeParse(service);
    return {
      index,
      success: result.success,
      data: result.success ? result.data : null,
      errors: result.success ? [] : result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    };
  });

  const validServices = results.filter(r => r.success).map(r => r.data);
  const invalidServices = results.filter(r => !r.success);

  return {
    valid: validServices,
    invalid: invalidServices,
    hasErrors: invalidServices.length > 0
  };
}

// Example: Dynamic validation based on service type
export function getServiceTypeValidationRules(serviceType: string) {
  const baseRules = {
    name: 'required|string|max:100',
    ip_addresses: 'required|array|min:1',
    ports: 'required|array|min:1',
    group_id: 'required|uuid'
  };

  // Add type-specific rules
  switch (serviceType) {
    case 'web':
      return {
        ...baseRules,
        domain: 'string', // Domain is common for web services
        ports: 'required|array|min:1|contains:80,443' // Common web ports
      };
    case 'database':
      return {
        ...baseRules,
        vlan_id: 'number|min:1|max:4094', // Databases often use VLANs
        ports: 'required|array|min:1|contains:3306,5432,1521' // Common DB ports
      };
    case 'security':
      return {
        ...baseRules,
        vlan_id: 'required|number|min:1|max:4094', // Security services typically require VLAN
        domain: 'string' // Security services often have domains
      };
    default:
      return baseRules;
  }
}

// Example: Error message formatting for UI display
export function formatValidationErrorsForUI(errors: any[]) {
  return errors.reduce((acc, error) => {
    const field = error.field || 'general';
    if (!acc[field]) {
      acc[field] = [];
    }
    acc[field].push(error.message);
    return acc;
  }, {} as Record<string, string[]>);
}

// Example: Validation middleware for API routes (if needed)
export function createValidationMiddleware(schema: any) {
  return (data: unknown) => {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = result.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      throw new Error(JSON.stringify({
        message: 'Validation failed',
        errors
      }));
    }
    
    return result.data;
  };
}