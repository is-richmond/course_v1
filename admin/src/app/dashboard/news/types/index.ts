// types.ts
export interface News {
    id: string;
    title: string;
    content: string;
    status: "DRAFT" | "PUBLISHED" | "DELETED" | "REVIEW";
    category_id?: string;
    tag_ids?: string[];
    img_url?: string; // Добавьте это поле
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export interface Tags {
    id: string;
    name: string;
}

export interface ApiResponse<T> {
    items: T[];
    total?: number;
}