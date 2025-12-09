// components/ControlledFormField.tsx

"use client";

import { Control, useController, Path } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";

interface ControlledFormFieldProps<T extends z.ZodTypeAny> {
    control: Control<z.infer<T>>; // Use z.infer<T> for Control
    name: Path<z.infer<T>>;
    label: string;
    type?: string; // 'text', 'textarea', 'select'
    options?: { value: string; label: string }[]; // For select
}

export function ControlledFormField<T extends z.ZodTypeAny>({
    control,
    name,
    label,
    type = "text",
    options,
}: ControlledFormFieldProps<T>) {
    const { field } = useController({
        control,
        name,
    });

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                {type === "textarea" ? (
                    <textarea className="w-full h-40 mt-2 p-2 border rounded" {...field} />
                ) : type === "select" && options ? (
                    <select {...field} value={field.value} className="w-full h-10 mt-2 p-2 border rounded">
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <Input type={type} {...field} />
                )}
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}