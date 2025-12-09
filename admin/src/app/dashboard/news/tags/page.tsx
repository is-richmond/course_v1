"use client";

import { useState, useEffect } from "react";
import { createTag, deleteTag, fetchTags } from "@/app/dashboard/news/services/api";
import { Tags } from "../types";
import Link from "next/link";
import { useAuthRedirect } from "@/hooks/use-loggedIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Tag, Hash } from "lucide-react";

export default function TagsPage() {

    // Redirect to login if not authenticated
    useAuthRedirect()

    const [tags, setTags] = useState<Tags[]>([]);
    const [newTag, setNewTag] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadTags() {
            try {
                const data = await fetchTags(); // Replace with fetchTags when available
                setTags(data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            } finally {
                setLoading(false);
            }
        }
        loadTags();
    }, []);

    const handleDeleteTag = async (id: string) => {
        try {
            await deleteTag(id); // Replace with deleteTag when available
            setTags(tags.filter((tag) => tag.id !== id));
        } catch (error) {
            console.error("Error deleting tag:", error);
        }
    };
    
    const handleCreateTag = async () => {
        if (newTag.trim().length === 0 || tags.findIndex(tag => tag.name === newTag) !== -1) return;
        try {
            const createdTag = await createTag({ name: newTag });
            setTags([...tags, createdTag]);
            setNewTag("");
        } catch (error) {
            console.error("Error creating category:", error);
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
                                <span className="text-lg">Loading tags...</span>
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
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Теги</h1>
                            <p className="text-gray-600 text-lg">Управление тегами для новостей</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-white/60 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Tag className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{tags.length}</p>
                                        <p className="text-sm text-gray-600">Всего тегов</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/60 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-17 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Hash className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{tags.length}</p>
                                        <p className="text-sm text-gray-600">Активных</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Tag Form */}
                    <Card className="bg-white/60 backdrop-blur-sm border-blue-200 shadow-lg mb-8">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Добавить новый тег
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-lg py-3"
                                    placeholder="Введите название тега"
                                />
                                <Button 
                                    onClick={handleCreateTag} 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-8 py-3"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Добавить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tags List */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/50">
                        <CardTitle className="text-2xl text-gray-800 flex items-center gap-3 py-4">
                            <Tag className="w-6 h-6" />
                            Список тегов
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {tags.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Tag className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-medium text-gray-900 mb-4">Тегов пока нет</h3>
                                <p className="text-gray-500 mb-6 text-lg">Создайте первый тег, чтобы начать категоризацию новостей</p>
                                <Button 
                                    onClick={() => document.querySelector('input')?.focus()}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Добавить первый тег
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {tags.map((tag, index) => (
                                    <Card key={tag.id} className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4 border-l-blue-500 group ${
                                        index % 2 === 0 ? 'bg-white/70' : 'bg-blue-50/50'
                                    }`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex-1">
                                                    <Link 
                                                        href={`tags/${tag.id}`} 
                                                        className="group transition duration-300 text-xl font-semibold text-gray-900 hover:text-blue-600"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                                <Hash className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <span>{tag.name}</span>
                                                        </div>
                                                        <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-blue-600 mt-2"></span>
                                                    </Link>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                                                    >
                                                        <Link href={`tags/${tag.id}`} className="flex items-center gap-1">
                                                            <Edit className="w-3 h-3" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDeleteTag(tag.id)} 
                                                        size="sm"
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}