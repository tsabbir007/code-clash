"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, Users, Globe, Lock, Save, AlertCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Contest {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isPublic: boolean;
}

interface EditContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contest: Contest | null;
}

interface ContestFormData {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isPublic: boolean;
}

export default function EditContestModal({ isOpen, onClose, onSuccess, contest }: EditContestModalProps) {
    const [formData, setFormData] = useState<ContestFormData>({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        isPublic: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Initialize form data when contest changes
    useEffect(() => {
        if (contest) {
            const startDate = new Date(contest.startTime);
            const endDate = new Date(contest.endTime);

            setFormData({
                title: contest.title,
                description: contest.description || '',
                startDate: startDate.toISOString().split('T')[0],
                startTime: startDate.toTimeString().slice(0, 5),
                endDate: endDate.toISOString().split('T')[0],
                endTime: endDate.toTimeString().slice(0, 5),
                isPublic: contest.isPublic
            });
        }
    }, [contest]);

    const handleInputChange = (field: keyof ContestFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            setError('Contest title is required');
            return false;
        }

        if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
            setError('Start and end dates/times are required');
            return false;
        }

        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (endDateTime <= startDateTime) {
            setError('End time must be after start time');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !contest) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/contests/${contest.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    startTime: `${formData.startDate}T${formData.startTime}`,
                    endTime: `${formData.endDate}T${formData.endTime}`,
                    isPublic: formData.isPublic
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update contest');
            }

            const result = await response.json();
            console.log('Contest updated successfully:', result);

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Error updating contest:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !contest) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Edit className="w-6 h-6" />
                        Edit Contest
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>Contest updated successfully!</AlertDescription>
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Basic Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Contest Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter contest title"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter contest description"
                                rows={3}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Schedule
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time *</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date *</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time *</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Contest Settings
                        </h3>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Public Contest</Label>
                                <p className="text-sm text-muted-foreground">
                                    Make contest visible to all users
                                </p>
                            </div>
                            <Switch
                                checked={formData.isPublic}
                                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Update Contest
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
