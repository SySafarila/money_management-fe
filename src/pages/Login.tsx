import { Input } from "@/components/ui/input.tsx"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.tsx"
import { Button } from "@/components/ui/button.tsx"
import { useMemo, useState } from "react"
import axios from "axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Link } from "@tanstack/react-router"
import { api } from "@/lib/utils.ts"

function Login() {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")

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
      const res = await api.post<{
        message: string
        data: { token: string; valid_until: number }
      }>("/login", {
        username,
        password,
      })
      console.log("Message:", res.data.message)
      console.log("Token:", res.data.data.token)
      console.log("Valid until:", res.data.data.valid_until)
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
        <Link to="/register">
          <Button variant="secondary" className="w-full">
            Register Instead
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Login
