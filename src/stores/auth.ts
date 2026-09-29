import { create } from "zustand"

export const DEFAULT_TEST_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTEyOTc4ODksImlhdCI6MTc5MDY5MzA4OSwiaXNzIjoic3lhaHJ1bCIsInN1YiI6IiIsInVzZXJfaWQiOiIwZjJlZjE1ZS1jMTU4LTRhZjUtOGQ1OC00MmM5NzNkMWRlOGQifQ.PNAsjTcoN12Mm3gdvPsorKYPS976njYAFscHGZzktMo"

const getInitialToken = (): string => {
    if (typeof window === "undefined") return DEFAULT_TEST_TOKEN
    const stored = localStorage.getItem("auth_token")
    if (stored !== null && stored.trim() !== "") {
        return stored
    }
    // Set default test token into localStorage
    localStorage.setItem("auth_token", DEFAULT_TEST_TOKEN)
    return DEFAULT_TEST_TOKEN
}

const initialToken = getInitialToken()

interface AuthState {
    token: string
    isAuthenticated: boolean
    setToken: (token: string) => void
    setAuthenticated: () => void
    setUnauthenticated: () => void
    resetToTestToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    setToken: (token: string) => {
        if (typeof window !== "undefined") {
            if (token) {
                localStorage.setItem("auth_token", token)
            } else {
                localStorage.removeItem("auth_token")
            }
        }
        set(() => ({
            token: token,
            isAuthenticated: Boolean(token),
        }))
    },
    setAuthenticated: () =>
        set(() => ({
            isAuthenticated: true,
        })),
    setUnauthenticated: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
        }
        set(() => ({
            token: "",
            isAuthenticated: false,
        }))
    },
    resetToTestToken: () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", DEFAULT_TEST_TOKEN)
        }
        set(() => ({
            token: DEFAULT_TEST_TOKEN,
            isAuthenticated: true,
        }))
    },
}))
