import axios from "axios"
import { useAuthStore } from "@/stores/auth.ts"

export { cn } from "cn"

export const api = axios.create({
    baseURL: "https://money-management-api.fsm.web.id",
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

type CreateCategoryResponse = {
    message: string
    data: Category
}

type CategoriesResponse = {
    message: string
    data: Category[]
}

type TransactionCreateParam = {
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

type TransactionsResponse = {
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
        state.setAuthenticated()
        state.setToken(res.data.data.token)
        return res.data
    }

    static async getTransactions() {
        return await api.get<TransactionsResponse>("/transactions", {
            headers: {
                "x-api-key": useAuthStore.getState().token,
            },
        })
    }

    static async getCategories() {
        return await api.get<CategoriesResponse>("/categories", {
            headers: {
                "x-api-key": useAuthStore.getState().token,
            },
        })
    }

    static async createCategory(
        category: string
    ): Promise<CreateCategoryResponse> {
        return await api.post(
            `/categories`,
            {
                name: category,
            },
            {
                headers: {
                    "x-api-key": useAuthStore.getState().token,
                },
            }
        )
    }

    static async createTransaction(transaction: TransactionCreateParam) {
        return await api.post("/transactions", transaction, {
            headers: {
                "x-api-key": useAuthStore.getState().token,
            },
        })
    }
}
