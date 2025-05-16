'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from 'react';

const formSchema = z.object({
  firstName: z.string().nonempty("First Name is required"),
  lastName: z.string().nonempty("Last Name is required"),
  username: z.string()
    .nonempty("Username is required")
    .min(2, "Username must be at least 2 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers"),
  email: z.string().nonempty("Email is required").email("Invalid email address"),
  password: z.string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string().nonempty("Confirm Password is required"),
  description: z.string().max(1000, "Description cannot be longer than 1000 characters").optional(),
  country: z.enum(["USA", "Canada", "India", "Australia", "Germany", "UK"], {
    required_error: "Select a country from the dropdown",
  }),
  birthDate: z.date({
    required_error: "Please select a birth date",
    invalid_type_error: "Invalid date",
  }).refine((date) => date < new Date(new Date().toDateString()), {
    message: "You cannot select a date in the future",
  }),
  newsLetter: z.boolean(),
  agreeToTerms: z.boolean().refine((value) => value === true, {
    message: "You need to agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type FormDataType = z.infer<typeof formSchema>;

const steps = [
  {
    id: "Step 1",
    name: "Account Details",
    fields: ["username", "email", "password", "confirmPassword"],
  },
  {
    id: "Step 2",
    name: "Personal Information",
    fields: ["firstName", "lastName", "description", "country", "birthDate"],
  },
  {
    id: "Step 3",
    name: "Account Settings",
    fields: ["newsLetter", "agreeToTerms"],
  },
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newsLetter: true,
      agreeToTerms: false,
    }
  });

  const step = steps[currentStep];

  const nextStep = async () => {
    const valid = await trigger(step.fields as any);
    if (valid) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: FormDataType) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Submitted Data:", data);
    reset();
    setCurrentStep(0);
  };

  const renderStep = (index: number) => {
    switch (index) {
      case 0:
        return (
          <>
            <Label htmlFor="username">
              Username
            </Label>
            <Input id="username" placeholder="Username" {...register("username")} />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

            <Label htmlFor="email">
              Email
            </Label>
            <Input id="email" type="email" placeholder="Email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <Label htmlFor="password">
              Password
            </Label>
            <Input id="password" type="password" placeholder="Password" {...register("password")} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

            <Label htmlFor="confirmPassword">
              Confirm Password
            </Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </>
        );
      case 1:
        return (
          <>
            <Label htmlFor="firstName">
              First Name
            </Label>
            <Input id="firstName" autoComplete="off" placeholder="First Name" {...register("firstName")} />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}

            <Label htmlFor="lastName">
              Last Name
            </Label>
            <Input id="lastName" autoComplete="off" placeholder="Last Name" {...register("lastName")} />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}

            <Label htmlFor="description">
              Description
            </Label>
            <Textarea id="description" placeholder="Description (optional)" {...register("description")} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

            <Label htmlFor="country">
              Country
            </Label>
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {["USA", "Canada", "India", "Australia", "Germany", "UK"].map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}

            <Label htmlFor="birthDate">
              Birth Date
            </Label>
            <Controller
              control={control}
              name="birthDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      {field.value ? format(field.value, "PPP") : "Pick a birth date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
          </>
        );
      case 2:
        return (
          <>
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="newsLetter"
                render={({ field }) => (
                  <Checkbox
                    id="newsletter"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="newsletter">
                Subscribe to newsletter
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="agreeToTerms"
                render={({ field }) => (
                  <Checkbox
                    id="agreeToTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="agreeToTerms">
                I agree to the terms and conditions
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}
          </>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4 w-lg p-4">
      <h2 className="text-xl font-semibold mb-4">{step.name}</h2>

      {renderStep(currentStep)}

      <div className="flex justify-between pt-4">
        {currentStep > 0 && (
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </form>
  );
}
