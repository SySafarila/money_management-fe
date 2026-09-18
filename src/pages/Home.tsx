import AuthLayout from "@/layouts/AuthLayout.tsx"
import { Api, type Category, type Transaction } from "@/lib/utils.ts"
import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/auth.ts"
import { Field, FieldLabel } from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.tsx"
import { Calendar } from "@/components/ui/calendar.tsx"
import { format } from "date-fns"

export function Home() {
    const [category, setCategory] = useState<string>("")
    const [categories, setCategories] = useState<Category[]>([])
    const [transactions, setTransactions] =
        useState<Record<string, Transaction[]>>()
    const [description, setDescription] = useState<string>("")
    const [amount, setAmount] = useState<number>(0)
    const [isIncome, setIsIncome] = useState<boolean>(false)
    const [date, setDate] = useState<Date>()
    const [categoryId, setCategoryId] = useState<string>("")
    const [loadingCreate, setLoadingCreate] = useState<boolean>(false)
    const token = useAuthStore((state) => state.token)
    const categoriesSelect = categories.map((category) => {
        return {
            label: category.name,
            value: category.id,
        }
    })
    const isIncomeSelect = [
        {
            label: "Income",
            value: true,
        },
        {
            label: "Expense",
            value: false,
        },
    ]

    const getTransactions = async () => {
        return await Api.getTransactions(token)
    }

    const getCategories = async () => {
        return await Api.getCategories(token)
    }

    const createCategories = async () => {
        setLoadingCreate(true)
        await Api.createCategory(token, category)
        setCategory("")
        const categories = await getCategories()
        setCategories(categories.data.data)
        setLoadingCreate(false)
    }

    const createTransactionValidation = useMemo(() => {
        const errors: string[] = []

        if (amount === 0) errors.push("Amount must be greater than 0")
        if (description.length === 0 || description === "")
            errors.push("Description required")
        if (categoryId === "") errors.push("Category required")
        if (!date) errors.push("Date required")
        return errors
    }, [amount, description, categoryId, date])

    const createTransaction = async () => {
        await Api.createTransaction(token, {
            amount: amount,
            description: description,
            category_id: categoryId,
            is_income: isIncome,
            date: date!.toISOString(),
        })
        getTransactions().then((r) => setTransactions(r.data.data))
    }

    useEffect(() => {
        getTransactions().then((r) => setTransactions(r.data.data))
        getCategories().then((r) => setCategories(r.data.data))
    }, [])

    return (
        <AuthLayout>
            <div className="flex flex-col gap-2">
                <span>Categories</span>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Badge>{category.name}</Badge>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Input
                        id="category"
                        type="text"
                        placeholder="Enter your category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </Field>
                <Button
                    variant="outline"
                    onClick={createCategories}
                    disabled={category.length === 0 || loadingCreate}
                >
                    {loadingCreate ? "Creating..." : "Create New Category"}
                </Button>
            </div>
            <div className="flex flex-col gap-4">
                <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                        items={categoriesSelect}
                        onValueChange={(value) => setCategoryId(String(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {categoriesSelect.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Input
                        id="description"
                        type="text"
                        placeholder="Enter your description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="Enter your amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="amount">Type</FieldLabel>
                    <Select
                        items={isIncomeSelect}
                        onValueChange={(value) => setIsIncome(Boolean(value))}
                        defaultValue={false}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {isIncomeSelect.map((item) => (
                                    <SelectItem
                                        key={item.label}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <Popover>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="outline"
                                    data-empty={!date}
                                    className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                />
                            }
                        >
                            {/*<CalendarIcon />*/}
                            {date ? (
                                format(date, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                required={true}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>
                <Button
                    variant="outline"
                    onClick={createTransaction}
                    disabled={createTransactionValidation.length > 0}
                >
                    {loadingCreate ? "Creating..." : "Create New Transaction"}
                </Button>
                {/*<p>{createTransactionValidation}</p>*/}
            </div>
        </AuthLayout>
    )
}

export default Home
