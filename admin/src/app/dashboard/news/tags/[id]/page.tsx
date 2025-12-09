"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteTag, fetchTagById, updateTag } from "@/app/dashboard/news/services/api";
import { Tags } from "@/app/dashboard/news/types";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthRedirect } from "@/hooks/use-loggedIn";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Edit, Trash2, ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
})

export default function EditTagPage() {
    const { id } = useParams();
    const router = useRouter();
    const [tag, setTag] = useState<Tags | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect to login if not authenticated  
    useAuthRedirect()

    //form 
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        }
    })

    useEffect(() => {
        async function loadCategoryData() {
            try {
                const categoryData = await fetchTagById(id as string);
                setTag(categoryData || null);
                form.reset({
                    name: categoryData?.name || "",
                })
                setError(null);
            } catch (error) {
                console.error("Error loading tag:", error);
                setError("Failed to load tag data");
            } finally {
                setLoading(false);
            }
        }
        loadCategoryData();
    }, [id, form]);

    const handleUpdateTag = async (data: z.infer<typeof formSchema>) => {
        try {
            await updateTag(id as string, data);
            router.push("/dashboard/news/tags");
        } catch (error) {
            console.error("Error updating tag:", error);
            setError("Failed to update tag");
        }
    }

    const handleDeleteTag = async () => {
        if (confirm("Are you sure you want to delete this tag?")) {
            try {
                await deleteTag(id as string);
                router.push("/dashboard/news/tags");
            } catch (error) {
                console.error("Error deleting tag:", error);
                setError("Failed to delete tag");
            }
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="w-full h-full relative p-6">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Loading tag...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="w-full h-full relative p-6 flex items-center justify-center">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="py-20 px-16">
                            <div className="text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                                <p className="text-red-500 text-xl mb-6">{error}</p>
                                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                    <Link href="/dashboard/news/tags">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Tags
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!tag) {
        return (
            <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="w-full h-full relative p-6 flex items-center justify-center">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="py-20 px-16">
                            <div className="text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                                <p className="text-red-500 text-xl mb-6">Tag not found</p>
                                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                    <Link href="/dashboard/news/tags">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Tags
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-auto">
            {/* Background decorations */}
            <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
            
            <div className="w-full relative p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Button asChild variant="outline" size="lg" className="border-blue-200 hover:bg-blue-50">
                            <Link href="/dashboard/news/tags">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Назад к тегам
                            </Link>
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Edit className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Редактировать тег</h1>
                            <p className="text-gray-600 text-lg">Изменение данных тега {tag.name}</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards - точно как на странице тегов */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white/60 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Tag className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{tag.id}</p>
                                        <p className="text-sm text-gray-600">ID тега</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit Form - точно как форма добавления тега */}
                <Card className="bg-white/60 backdrop-blur-sm border-blue-200 shadow-lg mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Редактировать тег
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleUpdateTag)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold text-lg">Название тега</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-lg py-3"
                                                    placeholder="Введите название тега"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="flex gap-4">
                                    <Button 
                                        type="submit" 
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-8 py-3"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Сохранить
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => router.push("/dashboard/news/tags")}
                                        className="border-blue-200 hover:bg-blue-50 px-8 py-3"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        Отмена
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={handleDeleteTag}
                                        className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 px-8 py-3 ml-auto"
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        Удалить тег
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}