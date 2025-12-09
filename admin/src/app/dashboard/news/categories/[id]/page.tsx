"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteCategory, fetchCategoriesById, updateCategory } from "@/app/dashboard/news/services/api";
import { Category } from "@/app/dashboard/news/types";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthRedirect } from "@/hooks/use-loggedIn";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Trash2, ArrowLeft, FolderOpen, Save } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Название должно содержать минимум 2 символа.",
    }),
    description: z.string().optional(),
});

export default function CategoryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Redirect to login if not authenticated  
    useAuthRedirect();

    // Form 
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        }
    });

    useEffect(() => {
        async function loadCategoryData() {
            try {
                const categoryData = await fetchCategoriesById(id as string);
                setCategory(categoryData || null);
                form.reset({
                    name: categoryData?.name || "",
                    description: categoryData?.description || "",
                });
            } catch (error) {
                console.error("Error loading category:", error);
            } finally {
                setLoading(false);
            }
        }
        loadCategoryData();
    }, [id, form]);

    const handleUpdateCategory = async (data: z.infer<typeof formSchema>) => {
        setSaving(true);
        try {
            await updateCategory(id as string, data);
            router.push("/dashboard/news/categories");
        } catch (error) {
            console.error("Error updating category:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
            try {
                await deleteCategory(id as string);
                router.push("/dashboard/news/categories");
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="max-w-4xl mx-auto relative p-6">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Загрузка категории...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="max-w-4xl mx-auto relative p-6">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="text-center py-16">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FolderOpen className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Категория не найдена</h3>
                            <p className="text-gray-500 mb-4">Запрашиваемая категория не существует</p>
                            <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                                <Link href="/dashboard/news/categories" className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Вернуться к категориям
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
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
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Редактировать категорию</h1>
                            <p className="text-gray-600">Измените информацию о категории</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/50">
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5" />
                            Информация о категории
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleUpdateCategory)} className="space-y-6">
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
                                        disabled={saving}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex-1"
                                    >
                                        {saving ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Сохранение...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                Сохранить изменения
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

                {/* Delete Card */}
                <Card className="mt-6 bg-red-50/50 border-red-200 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Опасная зона</h3>
                                    <p className="text-sm text-gray-600">
                                        Удаление категории является необратимым действием. Все связанные данные будут потеряны.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteCategory}
                                className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить категорию
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}