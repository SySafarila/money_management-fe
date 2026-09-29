import AuthLayout from "@/layouts/AuthLayout.tsx"
import { Api, type Category, type Transaction } from "@/lib/utils.ts"
import { useEffect, useMemo, useState, useCallback } from "react"
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
import { CategoryManager } from "@/components/internal/CategoryManager.tsx"
import { Tag, Receipt } from "lucide-react"

export function Home() {
    const [selectedDeleteTransactionId, setSelectedDeleteTransactionId] =
        useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isEditMode, setIsEditMode] = useState<boolean>(false)
    const [selectedEditTransactionId, setSelectedEditTransactionId] = useState<
        string | null
    >(null)
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

    const categoriesSelect = useMemo(() => {
        return categories.map((category) => ({
            label: category.name,
            value: category.id,
        }))
    }, [categories])

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
        try {
            setLoadingCreate(true)
            await Api.createTransaction({
                amount: amount,
                description: description,
                category_id: categoryId,
                is_income: isIncome,
                date: date!.toISOString(),
            })
            const r = await getTransactions()
            setTransactions(r.data.data)
            setDescription("")
            setAmount(0)
            setDate(undefined)
            setCategoryId("")
            setIsIncome(false)
        } catch (error) {
            alert(error)
        } finally {
            setLoadingCreate(false)
        }
    }

    const editTransaction = (transaction: Transaction) => {
        setIsEditMode(true)
        setSelectedEditTransactionId(transaction.id)
        setDescription(transaction.description)
        setAmount(transaction.amount)
        setDate(new Date(transaction.date))
        setCategoryId(transaction.category_id)
        setIsIncome(transaction.is_income)
    }

    const updateTransaction = async () => {
        try {
            setLoadingCreate(true)
            await Api.updateTransaction(selectedEditTransactionId!, {
                amount: amount,
                description: description,
                category_id: categoryId,
                is_income: isIncome,
                date: date!.toISOString(),
            })
            const r = await getTransactions()
            setTransactions(r.data.data)
            setIsEditMode(false)
            setSelectedEditTransactionId(null)
            setDescription("")
            setAmount(0)
            setDate(undefined)
            setCategoryId("")
            setIsIncome(false)
        } catch (error) {
            alert(error)
        } finally {
            setLoadingCreate(false)
        }
    }

    const deleteTransaction = async (transaction: Transaction) => {
        if (selectedDeleteTransactionId === transaction.id) {
            try {
                setIsDeleting(true)
                await Api.deleteTransaction(selectedDeleteTransactionId)
                setSelectedDeleteTransactionId(null)
                const r = await getTransactions()
                setTransactions(r.data.data)
            } catch (e) {
                alert(e)
            } finally {
                setIsDeleting(false)
            }
        } else {
            setSelectedDeleteTransactionId(transaction.id)
        }
    }

    const handleCategoriesUpdated = useCallback((updatedList: Category[]) => {
        setCategories(updatedList)
        setIsLoadingCategories(false)
    }, [])

    useEffect(() => {
        getTransactions()
            .then((r) => {
                setTransactions(r.data.data)
                setIsLoadingTransactions(false)
            })
            .catch(() => setIsLoadingTransactions(false))
    }, [])

    return (
        <AuthLayout>
            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-2" variant="line">
                    <TabsTrigger
                        value="categories"
                        className="cursor-pointer gap-2"
                    >
                        <Tag className="h-4 w-4" />
                        <span>Categories</span>
                        {categories.length > 0 && (
                            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {categories.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="transactions"
                        className="cursor-pointer gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        <span>Transactions</span>
                    </TabsTrigger>
                </TabsList>

                {/* Categories Tab Content */}
                <TabsContent value="categories" className="mt-4">
                    <CategoryManager
                        onCategoriesUpdated={handleCategoriesUpdated}
                    />
                </TabsContent>

                {/* Transactions Tab Content */}
                <TabsContent
                    value="transactions"
                    className="mt-4 flex flex-col gap-4"
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
                                        value={categoryId}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
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
                                placeholder="Enter description"
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
                                    placeholder="Enter amount"
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
                        {isEditMode && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setIsEditMode(false)
                                        setSelectedEditTransactionId(null)
                                    }}
                                    disabled={loadingCreate}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel Update
                                </Button>
                                <Button
                                    onClick={updateTransaction}
                                    disabled={
                                        createTransactionValidation.length >
                                            0 || loadingCreate
                                    }
                                    className="flex-1"
                                >
                                    {loadingCreate
                                        ? "Updating..."
                                        : "Update Transaction"}
                                </Button>
                            </div>
                        )}
                        {!isEditMode && (
                            <Button
                                onClick={createTransaction}
                                disabled={
                                    createTransactionValidation.length > 0 ||
                                    loadingCreate
                                }
                            >
                                {loadingCreate
                                    ? "Creating..."
                                    : "Create New Transaction"}
                            </Button>
                        )}
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
                                ([dateKey, items]) => (
                                    <div
                                        key={dateKey}
                                        className="mb-4 flex flex-col gap-3"
                                    >
                                        <Badge variant="outline">
                                            {dateKey}
                                        </Badge>
                                        <div className="flex flex-col gap-3">
                                            {items.map((transaction) => (
                                                <Card key={transaction.id}>
                                                    <CardHeader>
                                                        <CardTitle>
                                                            {
                                                                transaction.description
                                                            }
                                                        </CardTitle>
                                                        <CardDescription className="flex justify-between">
                                                            <span className="font-semibold text-foreground">
                                                                Rp{" "}
                                                                {transaction.amount.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <Badge variant="secondary">
                                                                    {
                                                                        transaction
                                                                            .category
                                                                            .name
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    variant={
                                                                        transaction.is_income
                                                                            ? "default"
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
                                                            {selectedDeleteTransactionId ===
                                                                transaction.id && (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setSelectedDeleteTransactionId(
                                                                            null
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isDeleting
                                                                    }
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                            {selectedDeleteTransactionId !==
                                                                transaction.id && (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        editTransaction(
                                                                            transaction
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    deleteTransaction(
                                                                        transaction
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeleting
                                                                }
                                                            >
                                                                {selectedDeleteTransactionId ===
                                                                transaction.id
                                                                    ? "Click Again To Delete"
                                                                    : "Delete"}
                                                            </Button>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {transaction.date}
                                                        </span>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </AuthLayout>
    )
}

export default Home
