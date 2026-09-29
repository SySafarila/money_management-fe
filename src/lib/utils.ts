import axios from "axios"
import { useAuthStore } from "@/stores/auth.ts"

export { cn } from "cn"

export const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL || "https://money-management-api.fsm.web.id",
})

// Attach x-api-key to every outgoing request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers["x-api-key"] = token
    }
    return config
})

type LoginResponse = {
    message: string
    data: { token: string; valid_until: number }
}

export type Category = {
    id: string
    user_id: string
    name: string
    created_at: string
    updated_at: string
}

export type CategoryResponse = {
    message: string
    data: Category
}

export type CategoriesResponse = {
    message: string
    data: Category[]
}

export type DeleteCategoryResponse = {
    message: string
    data: null
}

export type TransactionCreateParam = {
    category_id: string
    amount: number
    description: string
    is_income: boolean
    date: string
}

export interface Transaction {
    id: string
    user_id: string
    amount: number
    is_income: boolean
    description: string
    created_at: string
    updated_at: string
    date: string
    category_id: string
    category: Category
}

export type TransactionsResponse = {
    message: string
    data: Record<string, Transaction[]>
}

export class Api {
    static async login(
        username: string,
        password: string
    ): Promise<LoginResponse> {
        const res = await api.post<LoginResponse>("/login", {
            username,
            password,
        })
        const state = useAuthStore.getState()
        state.setToken(res.data.data.token)
        state.setAuthenticated()
        return res.data
    }

    static async getTransactions() {
        return await api.get<TransactionsResponse>("/transactions")
    }

    static async createTransaction(transaction: TransactionCreateParam) {
        return await api.post("/transactions", transaction)
    }

    static async updateTransaction(
        id: string,
        transaction: TransactionCreateParam
    ) {
        return await api.patch(`/transactions/${id}`, transaction)
    }

    static async deleteTransaction(id: string) {
        return await api.delete(`/transactions/${id}`)
    }

    static async getCategories() {
        return await api.get<CategoriesResponse>("/categories")
    }

    static async getCategory(id: string) {
        return await api.get<CategoryResponse>(`/categories/${id}`)
    }

    static async createCategory(
        categoryName: string
    ): Promise<CategoryResponse> {
        const res = await api.post<CategoryResponse>("/categories", {
            name: categoryName.trim(),
        })
        return res.data
    }

    static async updateCategory(
        id: string,
        categoryName: string
    ): Promise<CategoryResponse> {
        const res = await api.patch<CategoryResponse>(`/categories/${id}`, {
            name: categoryName.trim(),
        })
        return res.data
    }

    static async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
        const res = await api.delete<DeleteCategoryResponse>(`/categories/${id}`)
        return res.data
    }
}
