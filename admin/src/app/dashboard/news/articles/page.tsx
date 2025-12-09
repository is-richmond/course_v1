"use client";

import { useEffect, useState } from "react";
import { fetchNews, deleteNews } from "@/app/dashboard/news/services/api";
import { News } from "@/app/dashboard/news/types";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Edit, Trash2, Newspaper, Clock, AlertCircle } from "lucide-react";

export default function NewsPage() {

    // Redirect to login if not authenticated
    // useAuthRedirect()

    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const data = await fetchNews();
            setNews(data);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        await deleteNews(id);
        setNews(await fetchNews());
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'published':
            case 'опубликовано':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'draft':
            case 'черновик':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'archived':
            case 'архив':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                {/* Background decorations */}
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`} />
                <div className="max-w-7xl mx-auto relative p-6">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Loading news...</span>
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
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Newspaper className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Новости</h1>
                            <p className="text-gray-600">Управление новостными материалами</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="bg-white/60 backdrop-blur-sm border-blue-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Newspaper className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{news.length}</p>
                                        <p className="text-sm text-gray-600">Всего новостей</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/60 backdrop-blur-sm border-green-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {news.filter(n => n.status.toLowerCase().includes('published') || n.status.toLowerCase().includes('опубликовано')).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Опублdddиковано</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/60 backdrop-blur-sm border-yellow-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {news.filter(n => n.status.toLowerCase().includes('draft') || n.status.toLowerCase().includes('черновик')).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Черновики</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add News Button */}
                    <div className="flex justify-end">
                        <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            <Link href="articles/create" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Добавить новость
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* News Table */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/50">
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2 mt-6">
                            <Newspaper className="w-5 h-5" />
                            Список новостей
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {news.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Newspaper className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Новостей пока нет</h3>
                                <p className="text-gray-500 mb-4">Создайте первую новость, чтобы начать</p>
                                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                    <Link href="articles/create" className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Добавить новость
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/70 border-b border-gray-200/50">
                                        <TableHead className="font-semibold text-gray-700">Title</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Content</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {news.map((n, index) => (
                                        <TableRow 
                                            key={n.id} 
                                            className={`hover:bg-blue-50/30 transition-colors duration-200 border-b border-gray-100 ${
                                                index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/20'
                                            }`}
                                        >
                                            <TableCell className="font-medium text-gray-900 max-w-xs">
                                                <div className="truncate" title={n.title}>
                                                    {n.title}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 max-w-sm">
                                                <div className="truncate" title={n.content}>
                                                    {n.content.length > 50 ? n.content.substring(0, 50) + '...' : n.content}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(n.status)}`}>
                                                    {n.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                                                    >
                                                        <Link href={`articles/${n.id}`} className="flex items-center gap-1">
                                                            <Edit className="w-3 h-3" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDelete(n.id)} 
                                                        size="sm"
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Delete
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