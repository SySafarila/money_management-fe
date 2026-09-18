import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Link, useNavigate } from "@tanstack/react-router"
import { memo, useMemo, useState } from "react"
import { Api } from "@/lib/utils.ts"
import { useAuthStore } from "@/stores/auth.ts"

const RegisterButtonLink = memo(() => {
    return (
        <Link to="/register">
            <Button variant="secondary" className="w-full">
                Register Instead
            </Button>
        </Link>
    )
})

function LoginForm() {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const navigate = useNavigate({ from: "/login" })

    const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
    // const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const setToken = useAuthStore((state) => state.setToken)

    const validateForm = useMemo((): string[] => {
        const errors = []
        if (username === "") errors.push("Username is required")
        if (username.length < 4) errors.push("Username at least 4 characters")
        if (password === "") errors.push("Password is required")
        if (password.length < 8) errors.push("Password at least 8 characters")
        return errors
    }, [username, password])

    const login = async (): Promise<void> => {
        try {
            const res = await Api.login(username, password)
            setAuthenticated()
            setToken(res.data.token)
            await navigate({ to: "/" })
        } catch (error) {
            alert(error)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <FieldDescription>
                    Choose a unique username for your account.
                </FieldDescription>
            </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Field>
            {validateForm.length > 0 && (
                <Alert className="w-full" variant="destructive">
                    {/*<CheckCircle2Icon />*/}
                    <AlertTitle>Form Invalid</AlertTitle>
                    <AlertDescription>{validateForm[0]}</AlertDescription>
                </Alert>
            )}
            <Button
                variant="outline"
                onClick={login}
                disabled={validateForm.length > 0}
            >
                Login
            </Button>
            <RegisterButtonLink />
        </div>
    )
}

export default LoginForm
