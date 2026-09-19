import AuthLayout from "@/layouts/AuthLayout.tsx"
import { Api, type Category, type Transaction } from "@/lib/utils.ts"
import { useEffect, useMemo, useState } from "react"
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
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"

export function Home() {
    const [category, setCategory] = useState<string>("")
    const [categories, setCategories] = useState<Category[]>([])
    const [transactions, setTransactions] = useState<
        Record<string, Transaction[]>
    >({})
    const [isLoadingTransactions, setIsLoadingTransactions] =
        useState<boolean>(true)
    const [isLoadingCategories, setIsLoadingCategories] =
        useState<boolean>(true)
    const [description, setDescription] = useState<string>("")
    const [amount, setAmount] = useState<number>(0)
    const [isIncome, setIsIncome] = useState<boolean>(false)
    const [date, setDate] = useState<Date>()
    const [categoryId, setCategoryId] = useState<string>("")
    const [loadingCreate, setLoadingCreate] = useState<boolean>(false)
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
        return await Api.getTransactions()
    }

    const getCategories = async () => {
        return await Api.getCategories()
    }

    const createCategories = async () => {
        setLoadingCreate(true)
        await Api.createCategory(category)
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
        await Api.createTransaction({
            amount: amount,
            description: description,
            category_id: categoryId,
            is_income: isIncome,
            date: date!.toISOString(),
        })
        getTransactions().then((r) => {
            setTransactions(r.data.data)
            setIsLoadingTransactions(false)
        })
    }

    useEffect(() => {
        getTransactions().then((r) => {
            setTransactions(r.data.data)
            setIsLoadingTransactions(false)
        })
        getCategories().then((r) => {
            setCategories(r.data.data)
            setIsLoadingCategories(false)
        })
    }, [])

    return (
        <AuthLayout>
            <Tabs defaultValue="transactions">
                <TabsList className="w-full" variant="line">
                    <TabsTrigger
                        value="transactions"
                        className="cursor-pointer"
                    >
                        Transactions
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="cursor-pointer">
                        Categories
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value="transactions"
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="category">
                                    Category
                                </FieldLabel>
                                {isLoadingCategories && (
                                    <Skeleton className="h-9 w-full" />
                                )}
                                {!isLoadingCategories && (
                                    <Select
                                        items={categoriesSelect}
                                        onValueChange={(value) =>
                                            setCategoryId(String(value))
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {categoriesSelect.map(
                                                    (item) => (
                                                        <SelectItem
                                                            key={item.value}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="amount">Type</FieldLabel>
                                <Select
                                    items={isIncomeSelect}
                                    onValueChange={(value) =>
                                        setIsIncome(Boolean(value))
                                    }
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
                        </div>
                        <Field>
                            <FieldLabel htmlFor="description">
                                Description
                            </FieldLabel>
                            <Input
                                id="description"
                                type="text"
                                placeholder="Enter your description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter your amount"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(Number(e.target.value))
                                    }
                                />
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
                        </div>
                        <Button
                            onClick={createTransaction}
                            disabled={createTransactionValidation.length > 0}
                        >
                            {loadingCreate
                                ? "Creating..."
                                : "Create New Transaction"}
                        </Button>
                        {/*<p>{createTransactionValidation}</p>*/}
                    </div>
                    {isLoadingTransactions && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Skeleton className="h-4 w-full" />
                                </CardTitle>
                                <CardDescription className="flex justify-between">
                                    <Skeleton className="h-4 w-40" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between gap-2">
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <span>
                                    <Skeleton className="h-4 w-20" />
                                </span>
                            </CardFooter>
                        </Card>
                    )}
                    {!isLoadingTransactions && (
                        <div>
                            {Object.entries(transactions).map(
                                ([date, items]) => (
                                    <div
                                        key={date}
                                        className="flex flex-col gap-4"
                                    >
                                        <Badge>{date}</Badge>
                                        <div className="flex flex-col gap-4">
                                            {items.map((transaction) => (
                                                <Card key={transaction.id}>
                                                    <CardHeader>
                                                        <CardTitle>
                                                            "
                                                            {
                                                                transaction.description
                                                            }
                                                            "
                                                        </CardTitle>
                                                        <CardDescription className="flex justify-between">
                                                            <span>
                                                                Rp{" "}
                                                                {transaction.amount.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <Badge>
                                                                    {
                                                                        transaction
                                                                            .category
                                                                            .name
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    variant={
                                                                        transaction.is_income
                                                                            ? "secondary"
                                                                            : "destructive"
                                                                    }
                                                                >
                                                                    {transaction.is_income
                                                                        ? "Income"
                                                                        : "Expense"}
                                                                </Badge>
                                                            </div>
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardFooter className="flex justify-between gap-2">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                        <span>
                                                            {transaction.date}
                                                        </span>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>{" "}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="categories">
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
                            onClick={createCategories}
                            disabled={category.length === 0 || loadingCreate}
                        >
                            {loadingCreate
                                ? "Creating..."
                                : "Create New Category"}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </AuthLayout>
    )
}

export default Home
