"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createCategory, fetchCategories } from "@/app/dashboard/news/services/api";
import { Category } from "../../types";
import { useEffect, useState } from "react";
import { FolderPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Название должно содержать минимум 2 символа.",
    }),
    description: z.string().min(5, {
        message: "Описание должно содержать минимум 5 символов.",
    }),
});

export default function CreateCategoryPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const categoriesData = await fetchCategories();
                setCategories(categoriesData || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        getCategories();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (categories.some(category => category.name === values.name)) {
            form.setError("name", { message: "Категория с таким названием уже существует." });
            return;
        }
        
        setLoading(true);
        try {
            await createCategory(values);
            router.push("/dashboard/news/categories");
        } catch (error) {
            console.error("Error creating category:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
            {/* Background decorations */}
            <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
            
            <div className="max-w-4xl mx-auto relative p-6">
                {/* Header */}
                <div className="mb-8">
                    <Button 
                        asChild 
                        variant="ghost" 
                        className="mb-4 hover:bg-white/50 transition-colors"
                    >
                        <Link href="/dashboard/news/categories" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Назад к категориям
                        </Link>
                    </Button>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FolderPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Создать категорию</h1>
                            <p className="text-gray-600">Добавьте новую категорию для организации новостей</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/50">
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                            <FolderPlus className="w-5 h-5" />
                            Информация о категории
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">
                                                Название категории
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="Введите название категории"
                                                    className="bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">
                                                Описание категории
                                            </FormLabel>
                                            <FormControl>
                                                <textarea 
                                                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                                                    placeholder="Введите описание категории"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex-1"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Создание...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <FolderPlus className="w-4 h-4" />
                                                Создать категорию
                                            </div>
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/dashboard/news/categories")}
                                        className="border-gray-300 hover:bg-gray-50"
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6 bg-blue-50/50 border-blue-200 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FolderPlus className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Совет</h3>
                                <p className="text-sm text-gray-600">
                                    Используйте понятные и описательные названия категорий. Это поможет лучше организовать контент и упростит навигацию для читателей.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}