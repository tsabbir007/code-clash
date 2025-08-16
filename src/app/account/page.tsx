"use client"

import { useState, useEffect } from 'react'
import { Navbar } from "@/components/navbar/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader, User, Mail, Calendar, Edit, Save, X, CheckCircle, AlertCircle } from "lucide-react"
import { showSuccessToast, showErrorToast } from "@/lib/utils"

interface UserProfile {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image?: string
    createdAt: string
    updatedAt: string
}

export default function AccountPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editedName, setEditedName] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/auth/profile')
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login'
                    return
                }
                throw new Error('Failed to load profile')
            }

            const data = await response.json()
            setProfile(data.profile)
            setEditedName(data.profile.name)
        } catch (err) {
            console.error('Error loading profile:', err)
            setError('Failed to load profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
        setEditedName(profile?.name || "")
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditedName(profile?.name || "")
    }

    const handleSave = async () => {
        if (!editedName.trim()) {
            showErrorToast('Name cannot be empty')
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedName.trim()
                })
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            const data = await response.json()
            setProfile(data.profile)
            setIsEditing(false)
            showSuccessToast('Profile updated successfully!')
        } catch (err) {
            console.error('Error updating profile:', err)
            setError('Failed to update profile. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
                <Navbar />
                <div className="flex-1 flex justify-center items-center px-4">
                    <div className="flex flex-col h-screen items-center justify-center text-center space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Profile</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fetching your account information...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error && !profile) {
        return (
            <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
                <Navbar />
                <div className="flex-1 flex justify-center items-center px-4">
                    <div className="text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Profile</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                        <Button onClick={loadProfile} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
                <Navbar />
                <div className="flex-1 flex justify-center items-center px-4">
                    <div className="text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Not Found</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Unable to load your profile information.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
            <Navbar />

            <div className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information and preferences</p>
                </div>

                {/* Profile Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Profile Information</CardTitle>
                                <CardDescription>Your personal account details</CardDescription>
                            </div>
                            {!isEditing && (
                                <Button onClick={handleEdit} variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Input
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || !editedName.trim()}
                                        size="sm"
                                    >
                                        {isSaving ? (
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" size="sm">
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{profile.name}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Email Field (Read-only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-900 dark:text-gray-100">{profile.email}</span>
                                <Badge variant={profile.emailVerified ? "default" : "secondary"} className="ml-auto">
                                    {profile.emailVerified ? "Verified" : "Unverified"}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900 dark:text-gray-100 text-sm">
                                        {formatDate(profile.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900 dark:text-gray-100 text-sm">
                                        {formatDate(profile.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Account Status</CardTitle>
                        <CardDescription>Your account verification and security status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${profile.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Email Verification</span>
                                </div>
                                <Badge variant={profile.emailVerified ? "default" : "secondary"}>
                                    {profile.emailVerified ? "Verified" : "Pending"}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Account Status</span>
                                </div>
                                <Badge variant="default">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
