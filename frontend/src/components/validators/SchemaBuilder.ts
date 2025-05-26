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
    // Use the correct Zod type for each field
    let zodField;

    switch (fieldSchema.type) {
      case 'number': {
        let numField = z.number({
          invalid_type_error: fieldSchema.errorMessage || `${fieldName} must be a number`
        });
        if (fieldSchema.min) {
          numField = numField.min(fieldSchema.min.value, fieldSchema.min.message);
        }
        if (fieldSchema.max) {
          numField = numField.max(fieldSchema.max.value, fieldSchema.max.message);
        }
        zodField = numField;
        break;
      }
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
      default: {
        let strField = z.string();
        if (fieldSchema.minLength) {
          strField = strField.min(fieldSchema.minLength.value, fieldSchema.minLength.message);
        }
        if (fieldSchema.maxLength) {
          strField = strField.max(fieldSchema.maxLength.value, fieldSchema.maxLength.message);
        }
        if (fieldSchema.pattern) {
          strField = strField.regex(new RegExp(fieldSchema.pattern.value), fieldSchema.pattern.message);
        }
        if (fieldSchema.format) {
          switch (fieldSchema.format.toLowerCase()) {
            case 'email':
              strField = strField.email(fieldSchema.formatMessage);
              break;
            case 'url':
            case 'uri':
              strField = strField.url(fieldSchema.formatMessage);
              break;
          }
        }
        zodField = strField;
        break;
      }
    }

    // Make optional if not required
    if (!fieldSchema.required) {
      zodField = zodField.optional();
    } else {
      // Only call .nonempty for string fields
      if (zodField instanceof z.ZodString) {
        zodField = zodField.nonempty(fieldSchema.errorMessage);
      }
    }

    schemaMap[fieldName] = zodField;
  });
  return z.object(schemaMap);
}
