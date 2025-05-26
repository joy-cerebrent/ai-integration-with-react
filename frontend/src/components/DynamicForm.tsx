import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ControllerRenderProps } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { buildZodSchema } from './validators/SchemaBuilder';

export interface FormMetadataField {
  name: string;
  label: string;
  type: string;
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormMetadata {
  formTitle: string;
  fields: FormMetadataField[];
}

interface DynamicFormProps {
  metadata: FormMetadata;
  onSubmit: (data: Record<string, string | number | boolean>) => void;
  isSubmitting?: boolean;
}

type FormValues = Record<string, string | number | boolean>;

export const DynamicForm: React.FC<DynamicFormProps> = ({ metadata, onSubmit, isSubmitting = false }) => {
  // Create validation schema from metadata
  const zodSchema = buildZodSchema({
    schema: metadata.fields.reduce((acc, field) => {
      acc[field.name] = {
        type: field.type,
        required: field.isRequired,
        errorMessage: `${field.label} is required`,
      };
      return acc;
    }, {} as Record<string, { type: string; required?: boolean; errorMessage?: string }>),
    formTitle: metadata.formTitle,
  });

  // Create the form
  const form = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: metadata.fields.reduce((acc, field) => {
      if (field.type === 'checkbox') {
        acc[field.name] = false;
      } else if (field.type === 'number') {
        acc[field.name] = '';
      } else {
        acc[field.name] = '';
      }
      return acc;
    }, {} as FormValues)
  });

  const renderInput = (
    field: FormMetadataField,
    formField: ControllerRenderProps<FormValues, string>
  ) => {
    const baseInputClasses = "w-full bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors";

    switch (field.type) {
      case 'select':
        return (
          <Select 
            onValueChange={formField.onChange} 
            value={formField.value as string}
          >
            <SelectTrigger className={baseInputClasses}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem 
                  key={option} 
                  value={option}
                  className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formField.value as boolean}
              onCheckedChange={formField.onChange}
              className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {field.placeholder}
            </span>
          </div>
        );

      case 'number':
        return (
          <Input
            {...formField}
            type="number"
            value={typeof formField.value === 'number' || formField.value === '' ? formField.value : ''}
            onChange={e => {
              const val = e.target.value;
              formField.onChange(val === '' ? undefined : Number(val));
            }}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );
        
      default:
        return (
          <Input
            {...formField}
            value={String(formField.value || '')}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );
    }
  };
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-md p-4 shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          {metadata.formTitle}
        </h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {metadata.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
                    <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                      {field.label}
                      {field.isRequired && (
                        <span className="text-red-500 text-xs">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      {renderInput(field, formField)}
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            ))}
          </div>
            <div className="mt-4 flex justify-end">
            <Button 
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
