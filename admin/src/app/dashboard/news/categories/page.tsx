"use client";

import { useState, useEffect } from "react";
import { fetchCategories, deleteCategory } from "@/app/dashboard/news/services/api";
import { Category } from "../types";
import Link from "next/link";
import { useAuthRedirect } from "@/hooks/use-loggedIn";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, FolderOpen, Layers, AlertCircle } from "lucide-react";

export default function CategoriesPage() {
    // Redirect to login if not authenticated
    useAuthRedirect();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, []);

    const handleDeleteCategory = async (id: string) => {
        if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
            try {
                await deleteCategory(id);
                setCategories(categories.filter((category) => category.id !== id));
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="max-w-7xl mx-auto relative p-6">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Загрузка категорий...</span>
                            </div>
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
            
            <div className="max-w-7xl mx-auto relative p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Категории</h1>
                            <p className="text-gray-600">Управление категориями новостей</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="bg-white/60 backdrop-blur-sm border-purple-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                                        <p className="text-sm text-gray-600">Всего категорий</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/60 backdrop-blur-sm border-pink-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {categories.filter(c => c.description && c.description.length > 0).length}
                                        </p>
                                        <p className="text-sm text-gray-600">С описанием</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/60 backdrop-blur-sm border-indigo-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {categories.filter(c => !c.description || c.description.length === 0).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Без описания</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Category Button */}
                    <div className="flex justify-end">
                        <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            <Link href="categories/create" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Добавить категорию
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Categories Table */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/50">
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2 mt-6">
                            <FolderOpen className="w-5 h-5" />
                            Список категорий
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {categories.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FolderOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Категорий пока нет</h3>
                                <p className="text-gray-500 mb-4">Создайте первую категорию, чтобы начать</p>
                                <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                                    <Link href="categories/create" className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Добавить категорию
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/70 border-b border-gray-200/50">
                                        <TableHead className="font-semibold text-gray-700">Название</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Описание</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category, index) => (
                                        <TableRow 
                                            key={category.id} 
                                            className={`hover:bg-purple-50/30 transition-colors duration-200 border-b border-gray-100 ${
                                                index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/20'
                                            }`}
                                        >
                                            <TableCell className="font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                                        <FolderOpen className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    {category.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 max-w-md">
                                                <div className="truncate" title={category.description}>
                                                    {category.description && category.description.length > 80 
                                                        ? category.description.substring(0, 80) + '...' 
                                                        : category.description || <span className="text-gray-400 italic">Нет описания</span>
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
                                                    >
                                                        <Link href={`categories/${category.id}`} className="flex items-center gap-1">
                                                            <Edit className="w-3 h-3" />
                                                            Изменить
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDeleteCategory(category.id)} 
                                                        size="sm"
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Удалить
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}