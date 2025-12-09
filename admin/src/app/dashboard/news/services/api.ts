// import axios from "axios";
import axios from "@/config/axiosConfig";
import { News, Category, ApiResponse, Tags } from "../types";




// News API
export async function fetchNews(): Promise<News[]> {
    const res = await axios.get<ApiResponse<News>>(`/news/articles`);
    return res.data.items;
}

export async function fetchNewsById(id: string): Promise<News> {
    const res = await axios.get<News>(`/news/articles/${id}`);
    return res.data;
}

export async function fetchNewsByCategoryId(id: string): Promise<News[]> {
    const res = await axios.get<News[]>(`/news/articles/${id}`);
    return res.data;
}

export async function createNews(data: FormData): Promise<void> {
    await axios.post(`/news/articles`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function updateNews(id: string, data: FormData | Partial<News>): Promise<void> {
    const config = data instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
    
    await axios.patch(`/news/articles/${id}`, data, config);
}

export async function deleteNews(id: string): Promise<void> {
    await axios.delete(`/news/articles/${id}`);
}

// Categories API
export async function fetchCategories(): Promise<Category[]> {
    const res = await axios.get<ApiResponse<Category>>(`/news/categories`);
    return res.data.items;
}

export async function fetchCategoriesById(id: string): Promise<Category> {
    const res = await axios.get<Category>(`/news/categories/${id}`);
    return res.data;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
    const res = await axios.post(`/news/categories`, data);
    return res.data;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
    await axios.patch(`/news/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<void> {
    await axios.delete(`/news/categories/${id}`);
}

// Tags API
export async function fetchTags(): Promise<Tags[]> {
    const res = await axios.get<ApiResponse<Tags>>(`/news/tags`);
    return res.data.items;
}

export async function createTag(data: Partial<Tags>): Promise<Tags> {
    const res = await axios.post(`/news/tags`, data);
    return res.data;
}

export async function updateTag(id: string, data: Partial<Tags>): Promise<void> {
    await axios.patch(`/news/tags/${id}`, data);
}

export async function deleteTag(id: string): Promise<void> {
    await axios.delete(`/news/tags/${id}`);
}

export async function fetchTagById(id: string): Promise<Tags> {
    const res = await axios.get<Tags>(`/news/tags/${id}`);
    return res.data;
}