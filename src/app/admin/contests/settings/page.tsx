"use client";

import { useState } from "react";
import { Save, Calendar, Users, Lock, Globe, Settings as SettingsIcon } from "lucide-react";

export default function ContestSettings() {
    const [formData, setFormData] = useState({
        name: "Code Clash 2024",
        description: "Annual programming contest for competitive programmers",
        startDate: "2024-12-15T10:00",
        endDate: "2024-12-20T18:00",
        isPublic: true,
        maxParticipants: 100,
        allowRegistration: true,
        showStandings: true,
        allowPractice: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form data:', formData);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Contest Settings</h1>
                <p className="text-muted-foreground">
                    Configure contest parameters and preferences
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <SettingsIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Contest Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter contest name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max Participants</label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="1000"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter contest description"
                        />
                    </div>
                </div>

                {/* Schedule */}
                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-lg">Schedule</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">End Date & Time</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Visibility & Access */}
                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-lg">Visibility & Access</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isPublic"
                                name="isPublic"
                                checked={formData.isPublic}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isPublic" className="text-sm font-medium">
                                Make contest public (visible to all users)
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="allowRegistration"
                                name="allowRegistration"
                                checked={formData.allowRegistration}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="allowRegistration" className="text-sm font-medium">
                                Allow participants to register themselves
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="showStandings"
                                name="showStandings"
                                checked={formData.showStandings}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showStandings" className="text-sm font-medium">
                                Show real-time standings to participants
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="allowPractice"
                                name="allowPractice"
                                checked={formData.allowPractice}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="allowPractice" className="text-sm font-medium">
                                Allow practice submissions after contest ends
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
