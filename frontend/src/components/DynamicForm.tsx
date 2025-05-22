import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"

interface FormField {
  label: string;
  name: string;
  type: "text" | "number" | "select" | "checkbox";
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormMetadata {
  formTitle: string;
  fields: FormField[];
}

type FormValues = Record<string, string | number | boolean>;

interface DynamicFormProps {
  metadata: FormMetadata;
  onSubmit: (data: FormValues) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ metadata, onSubmit }) => {
  const formSchema = z.object(
    metadata.fields.reduce((acc, field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "number":
          fieldSchema = field.isRequired 
            ? z.string()
                .transform((val) => Number(val))
                .pipe(z.number({ required_error: `${field.label} is required` }))
            : z.string()
                .transform((val) => val ? Number(val) : undefined)
                .pipe(z.number().optional());
          break;
        case "checkbox":
          // Transform the checkbox value to boolean
          fieldSchema = field.isRequired
            ? z.boolean({ required_error: `${field.label} is required` })
            : z.boolean().optional().default(false);
          break;
        case "select":
          fieldSchema = field.isRequired
            ? z.string({ required_error: `${field.label} is required` })
            : z.string().optional();
          break;
        case "text":
          fieldSchema = field.isRequired
            ? z.string({ required_error: `${field.label} is required` }).min(1, `${field.label} is required`)
            : z.string().optional();
          break;
        default:
          fieldSchema = z.string().optional();
      }

      acc[field.name] = fieldSchema;
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {metadata.formTitle && (
        <h3 className="text-lg font-semibold mb-4">{metadata.formTitle}</h3>
      )}
      
      {metadata.fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="text-sm font-medium mb-1">
            {field.label}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "select" && field.options ? (
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, value } }) => (
                <Select 
                  onValueChange={onChange} 
                  value={value?.toString() || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : field.type === "checkbox" ? (
            <div className="flex items-center">
              <Controller
                control={control}
                name={field.name}
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    id={field.name}
                    checked={Boolean(value)}
                    onCheckedChange={onChange}
                  />
                )}
              />
            </div>
          ) : (
            <input
              id={field.name}
              type={field.type}
              {...register(field.name)}
              className="border rounded px-2 py-1 text-sm"
              placeholder={field.placeholder}
            />
          )}

          {errors[field.name] && (
            <span className="text-red-500 text-xs mt-1">
              {errors[field.name]?.message as string}
            </span>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
};

export default DynamicForm;
