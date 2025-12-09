"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { updateNews, deleteNews, fetchNewsById, fetchCategories, fetchTags } from "@/app/dashboard/news/services/api";
import { ArrowLeft, FileText, Save, Eye, PenTool, Trash2, AlertTriangle, Edit3, Upload, Tag, FolderOpen, X } from "lucide-react";
import Link from "next/link";
import { Category, Tags } from "@/app/dashboard/news/types";


const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    content: z.string().min(2, {
        message: "Content is required.",
    }),
    status: z.enum(["DRAFT", "PUBLISHED", "DELETED", "REVIEW"], {
        required_error: "Status is required.",
    }),
    category_id: z.string().min(1, {
        message: "Category is required.",
    }),
    tag_ids: z.array(z.string()).optional(),
    file: z.any().optional(),
});

export default function EditNewsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tags[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            status: "DRAFT",
            category_id: "",
            tag_ids: [],
        },
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [news, categoriesData, tagsData] = await Promise.all([
                    fetchNewsById(id as string),
                    fetchCategories(),
                    fetchTags()
                ]);
                
                setCategories(categoriesData);
                setTags(tagsData);
                
                if (news) {
                    form.reset({
                        title: news.title,
                        content: news.content,
                        status: news.status,
                        category_id: news.category_id || "",
                        tag_ids: news.tag_ids || [],
                    });
                    
                    if (news.img_url) {
                        setCurrentImageUrl(news.img_url);
                    }
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleTagToggle = (tagId: string) => {
        const currentTags = form.getValues("tag_ids") || [];
        if (currentTags.includes(tagId)) {
            form.setValue("tag_ids", currentTags.filter(id => id !== tagId));
        } else {
            form.setValue("tag_ids", [...currentTags, tagId]);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            
            formData.append("title", values.title);
            formData.append("content", values.content);
            formData.append("status", values.status);
            formData.append("category_id", values.category_id);
            
            if (selectedFile) {
                formData.append("file", selectedFile);
            }
            
            if (values.tag_ids && values.tag_ids.length > 0) {
                values.tag_ids.forEach(tagId => {
                    formData.append("tag_ids", tagId);
                });
            }

            await updateNews(id, formData);
            router.push("/dashboard/news/articles");
        } catch (error) {
            console.error("Failed to update news:", error);
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this news item?")) {
            try {
                setIsDeleting(true);
                await deleteNews(id);
                router.push("/dashboard/news/articles");
            } catch (error) {
                console.error("Failed to delete news:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return <Eye className="w-4 h-4" />;
            case "DRAFT":
                return <PenTool className="w-4 h-4" />;
            case "REVIEW":
                return <FileText className="w-4 h-4" />;
            case "DELETED":
                return <Trash2 className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="max-w-4xl mx-auto relative p-6">
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Loading article...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const displayImageUrl = previewUrl || currentImageUrl;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
            <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
            
            <div className="max-w-4xl mx-auto relative p-6">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button 
                            asChild
                            variant="outline" 
                            size="sm"
                            className="bg-white/60 backdrop-blur-sm border-gray-200 hover:bg-white/80 transition-all duration-200"
                        >
                            <Link href="/dashboard/news/articles" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to News
                            </Link>
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit News Article</h1>
                            <p className="text-gray-600">Update the existing article content and settings</p>
                        </div>
                    </div>
                </div>

                <Alert className="mb-6 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Warning:</strong> Changes are permanent. Use the delete button with caution as it cannot be undone.
                    </AlertDescription>
                </Alert>

                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200/50">
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2 mt-6">
                            <Edit3 className="w-5 h-5" />
                            Edit Article Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                Title
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="Enter article title..."
                                                    className="h-12 text-base bg-white/60 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-200"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <PenTool className="w-4 h-4 text-purple-600" />
                                                Content
                                            </FormLabel>
                                            <FormControl>
                                                <textarea 
                                                    {...field} 
                                                    placeholder="Write your article content here..."
                                                    className="w-full h-48 p-4 text-base bg-white/60 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none transition-all duration-200 placeholder:text-gray-400"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field: { onChange } }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <Upload className="w-4 h-4 text-green-600" />
                                                Cover Image
                                            </FormLabel>
                                            
                                            {displayImageUrl && (
                                                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img 
                                                        src={displayImageUrl} 
                                                        alt="Article cover" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {previewUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveImage}
                                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <FormControl>
                                                <input
                                                    id="file-input"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        handleFileChange(e);
                                                        onChange(e.target.files);
                                                    }}
                                                    className="w-full h-12 px-4 text-base bg-white/60 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                                />
                                            </FormControl>
                                            {selectedFile && (
                                                <p className="text-sm text-gray-600">New image selected: {selectedFile.name}</p>
                                            )}
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <FolderOpen className="w-4 h-4 text-orange-600" />
                                                Category
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <select
                                                        {...field}
                                                        className="w-full h-12 pl-12 pr-4 text-base bg-white/60 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none cursor-pointer transition-all duration-200"
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                        <FolderOpen className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tag_ids"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-pink-600" />
                                                Tags (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex flex-wrap gap-2 p-4 bg-white/60 border border-gray-200 rounded-lg min-h-[60px]">
                                                    {tags.length === 0 ? (
                                                        <p className="text-sm text-gray-400">No tags available</p>
                                                    ) : (
                                                        tags.map((tag) => {
                                                            const isSelected = field.value?.includes(tag.id);
                                                            return (
                                                                <button
                                                                    key={tag.id}
                                                                    type="button"
                                                                    onClick={() => handleTagToggle(tag.id)}
                                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                                                        isSelected
                                                                            ? "bg-orange-500 text-white shadow-md"
                                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                    }`}
                                                                >
                                                                    {tag.name}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-green-600" />
                                                Publication Status
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <select
                                                        {...field}
                                                        value={field.value}
                                                        className="w-full h-12 pl-12 pr-4 text-base bg-white/60 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none cursor-pointer transition-all duration-200"
                                                    >
                                                        <option value="PUBLISHED">Published - Live on website</option>
                                                        <option value="DRAFT">Draft - Work in progress</option>
                                                        <option value="REVIEW">Review - Pending approval</option>
                                                        <option value="DELETED">Deleted - Archived</option>
                                                    </select>
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                        {getStatusIcon(field.value)}
                                                    </div>
                                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 h-auto text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Deleting...
                                            </div>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Article
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        type="submit"
                                        disabled={isUpdating}
                                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 h-auto text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isUpdating ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Updating...
                                            </div>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Article
                                            </>
                                        )}
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