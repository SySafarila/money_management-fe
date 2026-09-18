import { create } from "zustand"

interface AuthState {
    token: string
    isAuthenticated: boolean
    setToken: (token: string) => void
    setAuthenticated: () => void
    setUnauthenticated: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: "",
    isAuthenticated: false,
    setToken: (token: string) =>
        set(() => ({
            token: token,
        })),
    setAuthenticated: () =>
        set(() => ({
            isAuthenticated: true,
        })),
    setUnauthenticated: () =>
        set(() => ({
            isAuthenticated: false,
        })),
}))
