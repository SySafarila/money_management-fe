import { useAuthStore } from "@/stores/auth.ts"
import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
    Wallet,
    Sun,
    Moon,
    LogOut,
    Key,
    RotateCcw,
    Check,
    ChevronDown,
} from "lucide-react"

function AuthLayout({ children }: { children: React.ReactNode }) {
    const { token, isAuthenticated, setUnauthenticated, resetToTestToken } =
        useAuthStore()
    const { theme, setTheme } = useTheme()
    const [showTokenDetails, setShowTokenDetails] = useState<boolean>(false)
    const [copiedToken, setCopiedToken] = useState<boolean>(false)

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const copyTokenToClipboard = () => {
        if (token) {
            navigator.clipboard.writeText(token)
            setCopiedToken(true)
            setTimeout(() => setCopiedToken(false), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading text-base font-bold leading-none tracking-tight">
                                Money Management
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Category & Transaction System
                            </span>
                        </div>
                    </Link>

                    {/* Right Nav Actions */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setShowTokenDetails(!showTokenDetails)
                                    }
                                    className="h-8 gap-1.5 text-xs font-normal"
                                >
                                    <Key className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="hidden sm:inline">
                                        Test JWT Active
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-60" />
                                </Button>

                                {showTokenDetails && (
                                    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card p-4 shadow-lg ring-1 ring-foreground/10 z-50">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-xs font-semibold">
                                                Active JWT Token
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px]"
                                            >
                                                Authorized
                                            </Badge>
                                        </div>
                                        <div className="mt-2.5">
                                            <p className="text-[11px] text-muted-foreground break-all font-mono bg-muted p-2 rounded-lg max-h-24 overflow-y-auto">
                                                {token}
                                            </p>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 h-7 text-xs"
                                                onClick={copyTokenToClipboard}
                                            >
                                                {copiedToken ? (
                                                    <>
                                                        <Check className="mr-1 h-3 w-3 text-emerald-600" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    "Copy Token"
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-xs"
                                                onClick={resetToTestToken}
                                                title="Reset to original test token"
                                            >
                                                <RotateCcw className="mr-1 h-3 w-3" />
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 px-0"
                            onClick={toggleTheme}
                            title="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>

                        {/* Auth status / Logout */}
                        {isAuthenticated ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 px-0 text-muted-foreground hover:text-destructive"
                                onClick={setUnauthenticated}
                                title="Log out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Link to="/login">
                                <Button size="sm" className="h-8 text-xs">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
                {isAuthenticated ? (
                    children
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Key className="h-6 w-6" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold">
                                Authentication Required
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Please sign in or use the provided testing JWT
                                token to access your categories and transactions.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={resetToTestToken}>
                                Use Provided Test Token
                            </Button>
                            <Link to="/login">
                                <Button variant="outline">
                                    Sign In with Credentials
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AuthLayout
