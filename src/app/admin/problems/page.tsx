"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { handleApiResponse, showErrorToast, showSuccessToast } from '@/lib/utils';
import Link from 'next/link';
import { Plus, X, Trash2, Tag, Edit2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Navbar } from '@/components/navbar/navbar';

interface Problem {
    id: number;
    title: string;
    description: string | null;
    difficulty: string;
    categories: number[]; // Changed from string[] to number[]
    timeLimit: number;
    memoryLimit: number;
    statement: string | null;
    checkerType: string;
    createdAt: string;
    updatedAt: string;
    userName: string;
    userEmail: string;
}

interface Category {
    id: number;
    name: string;
    description: string;
    color: string;
}

interface NewProblem {
    title: string;
    description: string;
    difficulty: string;
    categories: number[];
    timeLimit: number;
    memoryLimit: number;
    checkerType: string;
}

interface NewCategory {
    name: string;
    description: string;
    color: string;
}

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalProblems, setTotalProblems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [newProblem, setNewProblem] = useState<NewProblem>({
        title: '',
        description: '',
        difficulty: 'medium',
        categories: [],
        timeLimit: 1000,
        memoryLimit: 256,
        checkerType: 'standard'
    });
    const [newCategory, setNewCategory] = useState<NewCategory>({
        name: '',
        description: '',
        color: '#3B82F6'
    });

    useEffect(() => {
        loadProblems();
        loadCategories();
    }, [currentPage]);

    const loadProblems = async () => {
        try {
            const response = await fetch(`/api/problems?page=${currentPage}&perPage=${perPage}`);
            const apiResponse = await handleApiResponse(response, 'Problems loaded successfully', 'Failed to load problems');

            if (apiResponse.success) {
                setProblems(apiResponse.data.problems);
                setTotalProblems(apiResponse.data.pagination.total);
                setTotalPages(apiResponse.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error loading problems:', error);
            showErrorToast('Failed to load problems');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // loadProblems will be called automatically due to useEffect dependency
    };

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const apiResponse = await handleApiResponse(response, 'Categories loaded successfully', 'Failed to load categories');

            if (apiResponse.success) {
                setCategories(apiResponse.data.categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            showErrorToast('Failed to load categories');
        }
    };

    const handleCreateProblem = async () => {
        if (!newProblem.title.trim()) {
            showErrorToast('Problem title is required');
            return;
        }

        if (!newProblem.description.trim()) {
            showErrorToast('Problem description is required');
            return;
        }

        if (newProblem.categories.length === 0) {
            showErrorToast('At least one category is required');
            return;
        }

        setIsCreating(true);

        try {
            const response = await fetch('/api/problems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newProblem.title,
                    description: newProblem.description,
                    difficulty: newProblem.difficulty,
                    categories: newProblem.categories,
                    timeLimit: newProblem.timeLimit,
                    memoryLimit: newProblem.memoryLimit,
                    checkerType: newProblem.checkerType,
                }),
            });

            const apiResponse = await handleApiResponse(response, 'Problem created successfully!', 'Failed to create problem');

            if (apiResponse.success) {
                setIsDialogOpen(false);
                resetForm();
                setCurrentPage(1); // Reset to first page
                loadProblems();
            }
        } catch (error) {
            console.error('Error creating problem:', error);
            showErrorToast('Failed to create problem');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.name.trim()) {
            showErrorToast('Category name is required');
            return;
        }

        if (!newCategory.description.trim()) {
            showErrorToast('Category description is required');
            return;
        }

        setIsCreatingCategory(true);
        try {
            console.log('Creating category with data:', newCategory);

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCategory),
            });

            const apiResponse = await handleApiResponse(response, 'Category created successfully', 'Failed to create category');
            console.log('Category creation response:', apiResponse);

            if (apiResponse.success) {
                resetCategoryForm();
                setIsCategoryDialogOpen(false);
                loadCategories(); // Reload categories
            }
        } catch (error) {
            console.error('Error creating category:', error);
            showErrorToast('Failed to create category - Network error');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleDeleteProblem = async (problemId: number) => {
        try {
            const response = await fetch(`/api/problems/${problemId}`, {
                method: 'DELETE',
            });

            const apiResponse = await handleApiResponse(response, 'Problem deleted successfully', 'Failed to delete problem');

            if (apiResponse.success) {
                setCurrentPage(1); // Reset to first page
                loadProblems(); // Reload the list
            }
        } catch (error) {
            console.error('Error deleting problem:', error);
            showErrorToast('Failed to delete problem');
        }
    };

    const openEditDialog = (problem: Problem) => {
        setEditingProblem(problem);
        setIsEditDialogOpen(true);
    };

    const handleEditProblem = async () => {
        if (!editingProblem) return;

        if (!editingProblem.title.trim()) {
            showErrorToast('Problem title is required');
            return;
        }

        if (!editingProblem.description?.trim()) {
            showErrorToast('Problem description is required');
            return;
        }

        const updateData = {
            title: editingProblem.title,
            description: editingProblem.description,
            difficulty: editingProblem.difficulty,
            timeLimit: editingProblem.timeLimit,
            memoryLimit: editingProblem.memoryLimit,
            checkerType: editingProblem.checkerType,
            categories: editingProblem.categories // Include categories in the update
        };

        console.log('Sending update data:', updateData);

        try {
            const response = await fetch(`/api/problems/${editingProblem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const apiResponse = await handleApiResponse(response, 'Problem updated successfully', 'Failed to update problem');

            if (apiResponse.success) {
                setIsEditDialogOpen(false);
                setEditingProblem(null);
                setCurrentPage(1); // Reset to first page
                loadProblems(); // Reload the list
            }
        } catch (error) {
            console.error('Error updating problem:', error);
            showErrorToast('Failed to update problem');
        }
    };

    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditingProblem(null);
    };

    const resetForm = () => {
        setNewProblem({
            title: '',
            description: '',
            difficulty: 'medium',
            categories: [],
            timeLimit: 1000,
            memoryLimit: 256,
            checkerType: 'standard'
        });
    };

    const resetCategoryForm = () => {
        setNewCategory({
            name: '',
            description: '',
            color: '#3B82F6'
        });
    };

    const addCategory = (categoryId: number) => {
        if (!newProblem.categories.includes(categoryId)) {
            setNewProblem(prev => ({
                ...prev,
                categories: [...prev.categories, categoryId]
            }));
        }
    };

    const removeCategory = (categoryId: number) => {
        setNewProblem(prev => ({
            ...prev,
            categories: prev.categories.filter(id => id !== categoryId)
        }));
    };

    // Helper functions for edit mode
    const addCategoryToEdit = (categoryId: number) => {
        if (editingProblem && !editingProblem.categories.includes(categoryId)) {
            console.log('Adding category to edit:', categoryId);
            setEditingProblem(prev => prev ? {
                ...prev,
                categories: [...prev.categories, categoryId]
            } : null);
        }
    };

    const removeCategoryFromEdit = (categoryId: number) => {
        if (editingProblem) {
            console.log('Removing category from edit:', categoryId);
            setEditingProblem(prev => prev ? {
                ...prev,
                categories: prev.categories.filter(id => id !== categoryId)
            } : null);
        }
    };

    const getSelectedCategories = () => {
        return categories.filter(cat => newProblem.categories.includes(cat.id));
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

    const predefinedColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    if (isLoading) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading problems...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
            <Navbar />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Problems</h1>
                <div className="flex gap-2">
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Tag className="h-4 w-4 mr-2" />
                                Create Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="category-name">Category Name *</Label>
                                    <Input
                                        id="category-name"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter category name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category-description">Description *</Label>
                                    <Textarea
                                        id="category-description"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter category description"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Color</Label>
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {predefinedColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${newCategory.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" onClick={() => {
                                        setIsCategoryDialogOpen(false);
                                        resetCategoryForm();
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateCategory} disabled={isCreatingCategory}>
                                        {isCreatingCategory ? 'Creating...' : 'Create Category'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Problem
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Problem</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="problem-title">Problem Title *</Label>
                                            <Input
                                                id="problem-title"
                                                value={newProblem.title}
                                                onChange={(e) => setNewProblem(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Enter problem title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="problem-difficulty">Difficulty *</Label>
                                            <Select value={newProblem.difficulty} onValueChange={(value) => setNewProblem(prev => ({ ...prev, difficulty: value }))}>
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
                                    </div>
                                    <div>
                                        <Label htmlFor="problem-description">Description *</Label>
                                        <Textarea
                                            id="problem-description"
                                            value={newProblem.description}
                                            onChange={(e) => setNewProblem(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Enter problem description"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Categories */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Categories</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <Label>Add Categories</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                                {categories.map((category) => (
                                                    <Button
                                                        key={category.id}
                                                        variant={newProblem.categories.includes(category.id) ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => addCategory(category.id)}
                                                        className="justify-start"
                                                    >
                                                        <div
                                                            className="w-3 h-3 rounded-full mr-2"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        {category.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        {getSelectedCategories().length > 0 && (
                                            <div>
                                                <Label>Selected Categories</Label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {getSelectedCategories().map((category) => (
                                                        <Badge
                                                            key={category.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1"
                                                        >
                                                            <div
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            {category.name}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-4 w-4 p-0 hover:bg-red-100"
                                                                onClick={() => removeCategory(category.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Limits and Configuration */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Limits & Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="time-limit">Time Limit (ms)</Label>
                                            <Input
                                                id="time-limit"
                                                type="number"
                                                value={newProblem.timeLimit}
                                                onChange={(e) => setNewProblem(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 1000 }))}
                                                min="100"
                                                max="30000"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatTimeLimit(newProblem.timeLimit)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="memory-limit">Memory Limit (KB)</Label>
                                            <Input
                                                id="memory-limit"
                                                type="number"
                                                value={newProblem.memoryLimit}
                                                onChange={(e) => setNewProblem(prev => ({ ...prev, memoryLimit: parseInt(e.target.value) || 256 }))}
                                                min="16"
                                                max="512000"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatMemoryLimit(newProblem.memoryLimit)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="checker-type">Checker Type</Label>
                                            <Select value={newProblem.checkerType} onValueChange={(value) => setNewProblem(prev => ({ ...prev, checkerType: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Standard</SelectItem>
                                                    <SelectItem value="custom">Custom</SelectItem>
                                                    <SelectItem value="floating-point">Floating Point</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" onClick={() => {
                                        setIsDialogOpen(false);
                                        resetForm();
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateProblem} disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create Problem'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Problem</DialogTitle>
                            </DialogHeader>
                            {editingProblem && (
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="edit-title">Problem Title *</Label>
                                                <Input
                                                    id="edit-title"
                                                    value={editingProblem.title}
                                                    onChange={(e) => setEditingProblem(prev => prev ? { ...prev, title: e.target.value } : null)}
                                                    placeholder="Enter problem title"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="edit-difficulty">Difficulty *</Label>
                                                <Select
                                                    value={editingProblem.difficulty}
                                                    onValueChange={(value) => setEditingProblem(prev => prev ? { ...prev, difficulty: value } : null)}
                                                >
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
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-description">Description *</Label>
                                            <Textarea
                                                id="edit-description"
                                                value={editingProblem.description || ''}
                                                onChange={(e) => setEditingProblem(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                placeholder="Enter problem description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Categories */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Categories</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <Label>Add Categories</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                                    {categories.map((category) => (
                                                        <Button
                                                            key={category.id}
                                                            variant={editingProblem.categories.includes(category.id) ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => addCategoryToEdit(category.id)}
                                                            className="justify-start"
                                                        >
                                                            <div
                                                                className="w-3 h-3 rounded-full mr-2"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            {category.name}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                            {editingProblem.categories.length > 0 && (
                                                <div>
                                                    <Label>Selected Categories</Label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {editingProblem.categories.map((categoryId) => (
                                                            <Badge
                                                                key={categoryId}
                                                                variant="secondary"
                                                                className="flex items-center gap-1"
                                                            >
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: categories.find(cat => cat.id === categoryId)?.color || '#3B82F6' }
                                                                    }
                                                                />
                                                                {categories.find(cat => cat.id === categoryId)?.name || 'Unknown Category'}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-4 w-4 p-0 hover:bg-red-100"
                                                                    onClick={() => removeCategoryFromEdit(categoryId)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Limits and Configuration */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Limits & Configuration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="edit-time-limit">Time Limit (ms)</Label>
                                                <Input
                                                    id="edit-time-limit"
                                                    type="number"
                                                    value={editingProblem.timeLimit}
                                                    onChange={(e) => setEditingProblem(prev => prev ? { ...prev, timeLimit: parseInt(e.target.value) || 1000 } : null)}
                                                    min="100"
                                                    max="30000"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatTimeLimit(editingProblem.timeLimit)}
                                                </p>
                                            </div>
                                            <div>
                                                <Label htmlFor="edit-memory-limit">Memory Limit (KB)</Label>
                                                <Input
                                                    id="edit-memory-limit"
                                                    type="number"
                                                    value={editingProblem.memoryLimit}
                                                    onChange={(e) => setEditingProblem(prev => prev ? { ...prev, memoryLimit: parseInt(e.target.value) || 256 } : null)}
                                                    min="16"
                                                    max="512000"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatMemoryLimit(editingProblem.memoryLimit)}
                                                </p>
                                            </div>
                                            <div>
                                                <Label htmlFor="edit-checker-type">Checker Type</Label>
                                                <Select
                                                    value={editingProblem.checkerType}
                                                    onValueChange={(value) => setEditingProblem(prev => prev ? { ...prev, checkerType: value } : null)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="standard">Standard</SelectItem>
                                                        <SelectItem value="custom">Custom</SelectItem>
                                                        <SelectItem value="floating-point">Floating Point</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button variant="outline" onClick={closeEditDialog}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleEditProblem}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>


            <div className="grid gap-4">
                {problems.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <p className="text-muted-foreground">No problems found</p>
                                <p className="text-sm text-muted-foreground">Create your first problem to get started</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    problems.map((problem) => (
                        <Card key={problem.id}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span>{problem.title}</span>
                                        <Badge variant="outline">{problem.difficulty}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(problem)}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Link href={`/admin/problems/${problem.id}/overview`}>
                                            <Button variant="outline" size="sm">
                                                Enter Overview
                                            </Button>
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Problem</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{problem.title}"? This action cannot be undone and will remove all associated data including submissions, test cases, and configurations.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteProblem(problem.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete Problem
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {problem.description && (
                                        <p className="text-muted-foreground">{problem.description}</p>
                                    )}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">ID:</span> {problem.id}
                                        </div>
                                        <div>
                                            <span className="font-medium">Owner:</span> {problem.userName || 'Unknown'}
                                        </div>
                                        <div>
                                            <span className="font-medium">My Role:</span> Owner
                                        </div>
                                        <div>
                                            <span className="font-medium">Created:</span> {new Date(problem.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {problem.categories && problem.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            <span className="font-medium text-sm">Categories:</span>
                                            {problem.categories.map((categoryId, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {categories.find(cat => cat.id === categoryId)?.name || 'Unknown Category'}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Per Page Selector and Results Info */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                    {totalProblems > 0 && (
                        <>
                            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalProblems)} of {totalProblems} problems
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="per-page" className="text-sm">Per page:</Label>
                    <Select
                        value={perPage.toString()}
                        onValueChange={(value) => {
                            // This would require updating the perPage state and API call
                            // For now, we'll keep it fixed at 10 as requested
                        }}
                        disabled
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}