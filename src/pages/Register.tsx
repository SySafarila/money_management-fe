import { Input } from "@/components/ui/input.tsx"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.tsx"
import { Button } from "@/components/ui/button.tsx"
import { useMemo, useState } from "react"
import axios from "axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Link } from "@tanstack/react-router"
import { api } from "@/lib/utils.ts"
import { useAuthStore } from "@/stores/auth.ts"

function Register() {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [fullName, setFullName] = useState<string>("")

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    const validateForm = useMemo((): string[] => {
        const errors = []
        if (username === "") errors.push("Username is required")
        if (username.length < 4) errors.push("Username at least 4 characters")
        if (fullName === "") errors.push("Full name is required")
        if (fullName.length < 3) errors.push("Full name at least 3 characters")
        if (password === "") errors.push("Password is required")
        if (password.length < 8) errors.push("Password at least 8 characters")
        return errors
    }, [username, password, fullName])

    const register = async (): Promise<void> => {
        try {
            const res = await api.post("/register", {
                username,
                password,
                fullName,
            })
            console.log(res)
        } catch (e) {
            if (axios.isAxiosError<{ message: string }>(e)) {
                console.error(e)
                alert(e.response?.data.message)
            } else {
                alert("Something went wrong")
            }
        }
    }

    return (
        <div className="mx-auto w-full max-w-xl p-4">
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
                    <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                    <Input
                        id="full_name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
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
                    onClick={register}
                    disabled={validateForm.length > 0}
                >
                    Register {isAuthenticated ? "yes" : "no"}
                </Button>
                <Link to="/login">
                    <Button variant="secondary" className="w-full">
                        Login Instead
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default Register
