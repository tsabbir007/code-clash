"use client";

import { useState } from 'react';
import { X, Calendar, Users, Globe, Lock, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ContestFormData {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isPublic: boolean;
    allowRegistration: boolean;
    showStandings: boolean;
    allowPractice: boolean;
    maxParticipants: number;
}

export default function CreateContestModal({ isOpen, onClose, onSuccess }: CreateContestModalProps) {
    const [formData, setFormData] = useState<ContestFormData>({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        isPublic: true,
        allowRegistration: true,
        showStandings: true,
        allowPractice: false,
        maxParticipants: 100
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (field: keyof ContestFormData, value: string | boolean | number) => {
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
        const now = new Date();

        if (startDateTime <= now) {
            setError('Start time must be in the future');
            return false;
        }

        if (endDateTime <= startDateTime) {
            setError('End time must be after start time');
            return false;
        }

        if (formData.maxParticipants < 1 || formData.maxParticipants > 10000) {
            setError('Maximum participants must be between 1 and 10,000');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/contests', {
                method: 'POST',
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
                throw new Error(errorData.error || 'Failed to create contest');
            }

            const result = await response.json();
            console.log('Contest created successfully:', result);

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                resetForm();
            }, 1500);

        } catch (err) {
            console.error('Error creating contest:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            isPublic: true,
            allowRegistration: true,
            showStandings: true,
            allowPractice: false,
            maxParticipants: 100
        });
        setError(null);
        setSuccess(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">Create New Contest</h2>
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
                            <AlertDescription>Contest created successfully! Redirecting...</AlertDescription>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxParticipants">Max Participants</Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    value={formData.maxParticipants}
                                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                                    min="1"
                                    max="10000"
                                    disabled={loading}
                                />
                            </div>
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

                        <div className="space-y-4">
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

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Allow Self-Registration</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Let users register themselves
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.allowRegistration}
                                    onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Show Real-time Standings</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Display rankings to participants
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.showStandings}
                                    onCheckedChange={(checked) => handleInputChange('showStandings', checked)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Allow Practice After Contest</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable practice submissions after end
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.allowPractice}
                                    onCheckedChange={(checked) => handleInputChange('allowPractice', checked)}
                                    disabled={loading}
                                />
                            </div>
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
                                    Creating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Create Contest
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
