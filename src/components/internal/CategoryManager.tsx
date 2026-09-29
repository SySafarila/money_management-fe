import { useState, useMemo, useEffect } from "react"
import { Api, type Category } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import {
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Tag,
    RefreshCw,
    Search,
    AlertCircle,
    CheckCircle2,
    ArrowUpDown,
} from "lucide-react"
import { format } from "date-fns"

interface CategoryManagerProps {
    onCategoriesUpdated?: (categories: Category[]) => void
}

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc"

export function CategoryManager({ onCategoriesUpdated }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

    // Form: Create Category
    const [newCategoryName, setNewCategoryName] = useState<string>("")
    const [isCreating, setIsCreating] = useState<boolean>(false)

    // Edit State
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
        null
    )
    const [editCategoryName, setEditCategoryName] = useState<string>("")
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    // Delete State
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
        null
    )
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // Filtering & Sorting
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [sortBy, setSortBy] = useState<SortOption>("newest")

    // Alerts
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg)
        setErrorMessage(null)
        setTimeout(() => {
            setSuccessMessage((prev) => (prev === msg ? null : prev))
        }, 4000)
    }

    const showError = (msg: string) => {
        setErrorMessage(msg)
        setSuccessMessage(null)
    }

    const fetchCategories = async (showRefreshSpinner = false) => {
        if (showRefreshSpinner) {
            setIsRefreshing(true)
        }
        try {
            const res = await Api.getCategories()
            const data = res.data.data || []
            setCategories(data)
            onCategoriesUpdated?.(data)
            setErrorMessage(null)
        } catch (err: unknown) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to load categories"
            showError(`Error loading categories: ${errorMsg}`)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        let isMounted = true
        Api.getCategories()
            .then((res) => {
                if (isMounted) {
                    const data = res.data.data || []
                    setCategories(data)
                    onCategoriesUpdated?.(data)
                    setIsLoading(false)
                }
            })
            .catch((err: unknown) => {
                if (isMounted) {
                    const errorMsg =
                        err instanceof Error
                            ? err.message
                            : "Failed to load categories"
                    setErrorMessage(`Error loading categories: ${errorMsg}`)
                    setIsLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Create Category Handler
    const handleCreateCategory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const trimmed = newCategoryName.trim()
        if (!trimmed) return

        // Duplicate check
        const exists = categories.some(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (exists) {
            showError(`Category "${trimmed}" already exists.`)
            return
        }

        setIsCreating(true)
        setErrorMessage(null)
        try {
            const res = await Api.createCategory(trimmed)
            const created = res.data
            const updatedList = [created, ...categories]
            setCategories(updatedList)
            onCategoriesUpdated?.(updatedList)
            setNewCategoryName("")
            showSuccess(`Category "${created.name}" created successfully!`)
        } catch (err: unknown) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to create category"
            showError(`Error creating category: ${errorMsg}`)
        } finally {
            setIsCreating(false)
        }
    }

    // Start Editing
    const startEditing = (category: Category) => {
        setEditingCategoryId(category.id)
        setEditCategoryName(category.name)
        setDeletingCategoryId(null)
    }

    // Cancel Editing
    const cancelEditing = () => {
        setEditingCategoryId(null)
        setEditCategoryName("")
    }

    // Update Category Handler
    const handleUpdateCategory = async (id: string) => {
        const trimmed = editCategoryName.trim()
        if (!trimmed) {
            showError("Category name cannot be empty.")
            return
        }

        // Duplicate check (ignoring current category)
        const duplicate = categories.some(
            (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (duplicate) {
            showError(`Another category named "${trimmed}" already exists.`)
            return
        }

        setIsUpdating(true)
        setErrorMessage(null)
        try {
            const res = await Api.updateCategory(id, trimmed)
            const updated = res.data
            const updatedList = categories.map((c) =>
                c.id === id ? updated : c
            )
            setCategories(updatedList)
            onCategoriesUpdated?.(updatedList)
            cancelEditing()
            showSuccess(`Category updated to "${updated.name}"!`)
        } catch (err: unknown) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to update category"
            showError(`Error updating category: ${errorMsg}`)
        } finally {
            setIsUpdating(false)
        }
    }

    // Delete Category Handler
    const handleDeleteCategory = async (id: string) => {
        setIsDeleting(true)
        setErrorMessage(null)
        try {
            await Api.deleteCategory(id)
            const updatedList = categories.filter((c) => c.id !== id)
            setCategories(updatedList)
            onCategoriesUpdated?.(updatedList)
            setDeletingCategoryId(null)
            showSuccess("Category deleted successfully.")
        } catch (err: unknown) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to delete category"
            showError(`Error deleting category: ${errorMsg}`)
        } finally {
            setIsDeleting(false)
        }
    }

    // Filter & Sort
    const filteredCategories = useMemo(() => {
        let list = [...categories]
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            list = list.filter((c) => c.name.toLowerCase().includes(q))
        }

        list.sort((a, b) => {
            if (sortBy === "newest") {
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
            }
            if (sortBy === "oldest") {
                return (
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                )
            }
            if (sortBy === "name_asc") {
                return a.name.localeCompare(b.name)
            }
            if (sortBy === "name_desc") {
                return b.name.localeCompare(a.name)
            }
            return 0
        })

        return list
    }, [categories, searchQuery, sortBy])

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Summary */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Tag className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                                Category Management
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Manage expense and income categories
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-2.5 py-1">
                            {categories.length} Categories
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchCategories(true)}
                            disabled={isRefreshing || isLoading}
                            title="Refresh categories"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {successMessage && (
                <Alert className="border-emerald-500/50 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription className="text-emerald-800 dark:text-emerald-300">
                        {successMessage}
                    </AlertDescription>
                </Alert>
            )}

            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Create Category Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                        Add New Category
                    </CardTitle>
                    <CardDescription>
                        Create a category to organize your financial
                        transactions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleCreateCategory}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <div className="relative flex-1">
                            <Input
                                placeholder="Enter category name (e.g. Salary, Groceries, Utilities)"
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                disabled={isCreating}
                                maxLength={60}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                !newCategoryName.trim() ||
                                isCreating ||
                                newCategoryName.trim().length < 2
                            }
                            className="shrink-0"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            {isCreating ? "Adding..." : "Add Category"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search category name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        <ArrowUpDown className="mr-1 inline h-3 w-3" />
                        Sort:
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value as SortOption)
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                    </select>
                </div>
            </div>

            {/* Category List */}
            <div className="flex flex-col gap-2.5">
                {isLoading && (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                    </div>
                )}

                {!isLoading && filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                        <Tag className="mb-2 h-8 w-8 text-muted-foreground/60" />
                        <p className="text-sm font-medium">
                            {searchQuery
                                ? `No categories matching "${searchQuery}"`
                                : "No categories found"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {searchQuery
                                ? "Try checking for typos or searching a different term."
                                : "Create your first category using the form above."}
                        </p>
                    </div>
                )}

                {!isLoading &&
                    filteredCategories.map((item) => {
                        const isEditing = editingCategoryId === item.id
                        const isConfirmingDelete = deletingCategoryId === item.id

                        return (
                            <div
                                key={item.id}
                                className="group flex flex-col gap-2 rounded-xl border bg-card p-3.5 shadow-xs transition-all hover:border-foreground/20 sm:flex-row sm:items-center sm:justify-between"
                            >
                                {/* Left Side: Category Info or Edit Input */}
                                <div className="flex flex-1 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <Tag className="h-4 w-4" />
                                    </div>

                                    {isEditing ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <Input
                                                value={editCategoryName}
                                                onChange={(e) =>
                                                    setEditCategoryName(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleUpdateCategory(
                                                            item.id
                                                        )
                                                    } else if (
                                                        e.key === "Escape"
                                                    ) {
                                                        cancelEditing()
                                                    }
                                                }}
                                                placeholder="Category name"
                                                className="h-8 text-sm"
                                                autoFocus
                                                disabled={isUpdating}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleUpdateCategory(
                                                        item.id
                                                    )
                                                }
                                                disabled={
                                                    !editCategoryName.trim() ||
                                                    isUpdating
                                                }
                                                className="h-8 px-2.5"
                                            >
                                                <Check className="mr-1 h-3.5 w-3.5" />
                                                {isUpdating ? "Saving" : "Save"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={cancelEditing}
                                                disabled={isUpdating}
                                                className="h-8 px-2"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {item.name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Created{" "}
                                                {item.created_at
                                                    ? format(
                                                          new Date(
                                                              item.created_at
                                                          ),
                                                          "dd MMM yyyy, HH:mm"
                                                      )
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Actions or Delete Confirmation */}
                                {!isEditing && (
                                    <div className="flex items-center justify-end gap-1.5 pt-1 sm:pt-0">
                                        {isConfirmingDelete ? (
                                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-1.5 text-xs text-destructive">
                                                <span>Delete category?</span>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            item.id
                                                        )
                                                    }
                                                    disabled={isDeleting}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                    {isDeleting
                                                        ? "Deleting..."
                                                        : "Yes, Delete"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setDeletingCategoryId(
                                                            null
                                                        )
                                                    }
                                                    disabled={isDeleting}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        startEditing(item)
                                                    }
                                                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                                    title="Edit category"
                                                >
                                                    <Pencil className="mr-1 h-3.5 w-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDeletingCategoryId(
                                                            item.id
                                                        )
                                                    }
                                                    className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

export default CategoryManager
