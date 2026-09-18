import { useAuthStore } from "@/stores/auth.ts"
import React from "react"
import { Link } from "@tanstack/react-router"

function AuthLayout({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    return (
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 border border-gray-200 p-4">
            {isAuthenticated && <>{children}</>}
            {!isAuthenticated && (
                <div>
                    <Link to="/login">Login Page</Link>
                </div>
            )}
        </div>
    )
}

export default AuthLayout
