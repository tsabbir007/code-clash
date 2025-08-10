'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Copy, Plus, X, Edit2, Save, X as CloseIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TestCase {
    id: number;
    label: string;
    input: string;
    output: string;
    isSample: boolean;
    isHidden: boolean;
}

interface ProblemPreview {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    statement: string;
    timeLimit: number;
    memoryLimit: number;
    checkerType: string;
    customChecker: string;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: number;
    name: string;
    description: string;
    color: string;
}

interface ProblemCategory {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryDescription: string;
    categoryColor: string;
}

export default function PreviewProblemPage() {
    const params = useParams();
    const problemId = params.problem_id as string;

    const [problem, setProblem] = useState<ProblemPreview | null>(null);
    const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
    const [totalTestCases, setTotalTestCases] = useState(0);
    const [hiddenTestCases, setHiddenTestCases] = useState(0);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [problemCategories, setProblemCategories] = useState<ProblemCategory[]>([]);
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    useEffect(() => {
        fetchProblemPreview();
        fetchCategories();
        fetchProblemCategories();
    }, [problemId]);

    const fetchProblemPreview = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/problems/${problemId}/preview`);
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
                setSampleTestCases(data.sampleTestCases);
                setTotalTestCases(data.totalTestCases);
                setHiddenTestCases(data.hiddenTestCases);
            } else {
                toast.error(data.error || 'Failed to fetch problem preview');
            }
        } catch (error) {
            console.error('Error fetching problem preview:', error);
            toast.error('Failed to fetch problem preview');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeLimit = (timeMs: number) => {
        if (timeMs >= 1000) {
            return `${timeMs / 1000}s`;
        }
        return `${timeMs}ms`;
    };

    const formatMemoryLimit = (memoryKB: number) => {
        if (memoryKB >= 1024) {
            return `${(memoryKB / 1024).toFixed(1)}MB`;
        }
        return `${memoryKB}KB`;
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${type} copied to clipboard!`);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProblemCategories = async () => {
        try {
            const response = await fetch(`/api/problems/${problemId}/categories`);
            const data = await response.json();
            if (data.success) {
                setProblemCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching problem categories:', error);
        }
    };

    const createCategory = async (name: string, description: string, color: string) => {
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, color })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Category created successfully');
                setIsCreatingCategory(false);
                fetchCategories();
            } else {
                toast.error(data.error || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
        }
    };

    const addCategoryToProblem = async (categoryId: number) => {
        try {
            const response = await fetch(`/api/problems/${problemId}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Category added to problem successfully');
                setIsAddingCategory(false);
                fetchProblemCategories();
            } else {
                toast.error(data.error || 'Failed to add category to problem');
            }
        } catch (error) {
            console.error('Error adding category to problem:', error);
            toast.error('Failed to add category to problem');
        }
    };

    const removeCategoryFromProblem = async (categoryId: number) => {
        try {
            const response = await fetch(`/api/problems/${problemId}/categories?categoryId=${categoryId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Category removed from problem successfully');
                fetchProblemCategories();
            } else {
                toast.error(data.error || 'Failed to remove category from problem');
            }
        } catch (error) {
            console.error('Error removing category from problem:', error);
            toast.error('Failed to remove category from problem');
        }
    };

    const updateBasicInfo = async (title: string, description: string, difficulty: string) => {
        try {
            const response = await fetch(`/api/problems/${problemId}/basic-info`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, difficulty })
            });
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
                toast.success('Problem updated successfully');
                setIsEditingBasicInfo(false);
            } else {
                toast.error(data.error || 'Failed to update problem');
            }
        } catch (error) {
            console.error('Error updating problem:', error);
            toast.error('Failed to update problem');
        }
    };

    if (loading) {
        return (
            <div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading problem preview...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!problem) {
        return (
            <div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-muted-foreground">Problem not found</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Problem Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {isEditingBasicInfo ? (
                                <BasicInfoEditForm
                                    problem={problem}
                                    onSave={updateBasicInfo}
                                    onCancel={() => setIsEditingBasicInfo(false)}
                                />
                            ) : (
                                <div>
                                    <CardTitle className="text-2xl font-bold">{problem.title}</CardTitle>
                                    {problem.description && (
                                        <p className="text-muted-foreground mt-2">{problem.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary">{problem.difficulty}</Badge>
                                        <p className="text-muted-foreground">Problem ID: {problem.id}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {!isEditingBasicInfo && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingBasicInfo(true)}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Info
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Badge variant="outline">
                                    {formatTimeLimit(problem.timeLimit)} time limit
                                </Badge>
                                <Badge variant="outline">
                                    {formatMemoryLimit(problem.memoryLimit)} memory limit
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Problem Statement */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Problem Statement</CardTitle>
                </CardHeader>
                <CardContent>
                    {problem.statement ? (
                        <div className="prose prose-sm max-w-none">
                            <SimpleEditor
                                initialContent={problem.statement}
                                showSaveButton={false}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">No problem statement available.</p>
                    )}
                </CardContent>
            </Card>

            {/* Categories */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Categories</CardTitle>
                        <div className="flex gap-2">
                            <Dialog open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Category
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Category</DialogTitle>
                                    </DialogHeader>
                                    <CreateCategoryForm onSave={createCategory} />
                                </DialogContent>
                            </Dialog>
                            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Category
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Category to Problem</DialogTitle>
                                    </DialogHeader>
                                    <AddCategoryForm
                                        categories={categories}
                                        existingCategories={problemCategories}
                                        onSave={addCategoryToProblem}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {problemCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {problemCategories.map((pc) => (
                                <div
                                    key={pc.id}
                                    className="flex items-center gap-2 px-3 py-1 rounded-full border"
                                    style={{ borderColor: pc.categoryColor, backgroundColor: `${pc.categoryColor}10` }}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: pc.categoryColor }}
                                    />
                                    <span className="text-sm font-medium">{pc.categoryName}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-red-100"
                                        onClick={() => removeCategoryFromProblem(pc.categoryId)}
                                    >
                                        <X className="h-3 w-3 text-red-600" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">No categories assigned to this problem.</p>
                    )}
                </CardContent>
            </Card>

            {/* Sample Test Cases */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Sample Test Cases</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {sampleTestCases.length} sample test case{sampleTestCases.length !== 1 ? 's' : ''}
                        • {totalTestCases} total test cases ({hiddenTestCases} hidden)
                    </p>
                </CardHeader>
                <CardContent>
                    {sampleTestCases.length > 0 ? (
                        <div className="space-y-6">
                            {sampleTestCases.map((testCase, index) => (
                                <div key={testCase.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold">Sample {index + 1}</h4>
                                        <Badge variant="secondary">{testCase.label}</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-sm text-green-700">Input</h5>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(testCase.input);
                                                        toast.success('Input copied to clipboard');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <pre className="p-3 rounded text-sm overflow-x-auto">
                                                <code>{testCase.input}</code>
                                            </pre>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-sm text-blue-700">Expected Output</h5>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(testCase.output);
                                                        toast.success('Output copied to clipboard');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <pre className="p-3 rounded text-sm overflow-x-auto">
                                                <code>{testCase.output}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">No sample test cases available.</p>
                    )}
                </CardContent>
            </Card>

            {/* Problem Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Problem Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Limits</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time Limit:</span>
                                    <span className="font-mono">{formatTimeLimit(problem.timeLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Memory Limit:</span>
                                    <span className="font-mono">{formatMemoryLimit(problem.memoryLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Checker Type:</span>
                                    <Badge variant="outline">{problem.checkerType}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Statistics</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Test Cases:</span>
                                    <span className="font-mono">{totalTestCases}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sample Test Cases:</span>
                                    <span className="font-mono">{sampleTestCases.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hidden Test Cases:</span>
                                    <span className="font-mono">{hiddenTestCases}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Timestamps</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="text-sm">{new Date(problem.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="text-sm">{new Date(problem.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {problem.customChecker && (
                            <div>
                                <h4 className="font-semibold mb-3">Custom Checker</h4>
                                <p className="text-sm text-muted-foreground">
                                    This problem uses a custom checker for validation.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// BasicInfoEditForm Component
function BasicInfoEditForm({
    problem,
    onSave,
    onCancel
}: {
    problem: ProblemPreview,
    onSave: (title: string, description: string, difficulty: string) => void,
    onCancel: () => void
}) {
    const [title, setTitle] = useState(problem.title);
    const [description, setDescription] = useState(problem.description || '');
    const [difficulty, setDifficulty] = useState(problem.difficulty);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title.trim(), description.trim(), difficulty);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                    Problem Title *
                </label>
                <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter problem title"
                    required
                />
            </div>
            <div>
                <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
                    Description
                </label>
                <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter problem description"
                    rows={3}
                />
            </div>
            <div>
                <label htmlFor="edit-difficulty" className="block text-sm font-medium mb-2">
                    Difficulty
                </label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!title.trim()}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

// CreateCategoryForm Component
function CreateCategoryForm({ onSave }: { onSave: (name: string, description: string, color: string) => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6');

    const predefinedColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && description.trim()) {
            onSave(name.trim(), description.trim(), color);
            setName('');
            setDescription('');
            setColor('#3B82F6');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="category-name" className="block text-sm font-medium mb-2">
                    Category Name *
                </label>
                <Input
                    id="category-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    required
                />
            </div>
            <div>
                <label htmlFor="category-description" className="block text-sm font-medium mb-2">
                    Description *
                </label>
                <Textarea
                    id="category-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((colorOption) => (
                        <button
                            key={colorOption}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${color === colorOption ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                                }`}
                            style={{ backgroundColor: colorOption }}
                            onClick={() => setColor(colorOption)}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit" disabled={!name.trim() || !description.trim()}>
                    Create Category
                </Button>
            </div>
        </form>
    );
}

// AddCategoryForm Component
function AddCategoryForm({
    categories,
    existingCategories,
    onSave
}: {
    categories: Category[],
    existingCategories: ProblemCategory[],
    onSave: (categoryId: number) => void
}) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

    const availableCategories = categories.filter(cat =>
        !existingCategories.some(ec => ec.categoryId === cat.id)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCategoryId && typeof selectedCategoryId === 'number') {
            onSave(selectedCategoryId);
            setSelectedCategoryId('');
        }
    };

    if (availableCategories.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted-foreground">All available categories are already assigned to this problem.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="category-select" className="block text-sm font-medium mb-2">
                    Select Category
                </label>
                <Select value={selectedCategoryId.toString()} onValueChange={(value) => setSelectedCategoryId(parseInt(value) || '')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit" disabled={!selectedCategoryId}>
                    Add Category
                </Button>
            </div>
        </form>
    );
}
