// /validators/SchemaBuilder.ts
import * as z from 'zod';
import { ZodType, ZodTypeDef } from 'zod';

interface FieldSchema {
  type: string;
  required?: boolean;
  errorMessage?: string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: string; message: string };
  format?: string;
  formatMessage?: string;
  enum?: string[];
  enumMessage?: string;
}

interface ValidationSchema {
  schema: Record<string, FieldSchema>;
  formTitle: string;
}

export function buildZodSchema(validationSchema: ValidationSchema): z.ZodObject<any> {
  const schemaMap: Record<string, ZodType<any, ZodTypeDef, any>> = {};
  
  Object.entries(validationSchema.schema).forEach(([fieldName, fieldSchema]) => {
    let zodField: ZodType<any, ZodTypeDef, any>;
    
    // Create base type
    switch (fieldSchema.type) {
      case 'number':
        zodField = z.number({ 
          invalid_type_error: fieldSchema.errorMessage || `${fieldName} must be a number` 
        });
        break;
      case 'boolean':
        zodField = z.boolean();
        break;
      case 'enum':
        if (fieldSchema.enum && fieldSchema.enum.length > 0) {
          zodField = z.enum(fieldSchema.enum as [string, ...string[]], {
            errorMap: () => ({ message: fieldSchema.enumMessage || `Invalid option for ${fieldName}` })
          });
        } else {
          zodField = z.string();
        }
        break;
      case 'array':
        zodField = z.array(z.string());
        break;
      case 'date':
        zodField = z.date({
          invalid_type_error: fieldSchema.formatMessage || `Invalid date for ${fieldName}`
        });
        break;
      default:
        zodField = z.string();
    }
    
    // Apply string validations
    if (fieldSchema.type === 'string') {
      if (fieldSchema.minLength) {
        zodField = zodField.min(
          fieldSchema.minLength.value, 
          fieldSchema.minLength.message
        );
      }
      
      if (fieldSchema.maxLength) {
        zodField = zodField.max(
          fieldSchema.maxLength.value, 
          fieldSchema.maxLength.message
        );
      }
      
      // Pattern validation
      if (fieldSchema.pattern) {
        zodField = zodField.regex(
          new RegExp(fieldSchema.pattern.value), 
          fieldSchema.pattern.message
        );
      }
      
      // Format validations
      if (fieldSchema.format) {
        switch (fieldSchema.format.toLowerCase()) {
          case 'email':
            zodField = zodField.email(fieldSchema.formatMessage);
            break;
          case 'url':
          case 'uri':
            zodField = zodField.url(fieldSchema.formatMessage);
            break;
          // Add other formats as needed
        }
      }
    }
    
    // Apply number validations
    if (fieldSchema.type === 'number') {
      if (fieldSchema.min) {
        zodField = zodField.min(
          fieldSchema.min.value,
          fieldSchema.min.message
        );
      }
      
      if (fieldSchema.max) {
        zodField = zodField.max(
          fieldSchema.max.value,
          fieldSchema.max.message
        );
      }
    }
    
    // Make optional if not required
    if (!fieldSchema.required) {
      zodField = zodField.optional();
    } else {
      zodField = zodField.nonempty(fieldSchema.errorMessage);
    }
    
    schemaMap[fieldName] = zodField;
  });
  
  return z.object(schemaMap);
}
