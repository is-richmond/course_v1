'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, UserProfileUpdate, ToastMessage } from '@/lib/types/types';
import { userApi } from '@/lib/api/api';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Icons
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  Save,
  Shield,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProfileLoadingState {
  fetch: boolean;
  update: boolean;
}

const AdminProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<ProfileLoadingState>({
    fetch: false,
    update: false,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
  });

  // Toast management
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const user = await userApi.getCurrentUser();
      setCurrentUser(user);
      setProfileForm({
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        password: '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch user data',
      });
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [addToast]);

  // Load user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, update: true }));
    try {
      // Prepare update data - only send fields that have values
      const updateData: UserProfileUpdate = {
        email: profileForm.email,
        first_name: profileForm.first_name || undefined,
        last_name: profileForm.last_name || undefined,
        phone_number: profileForm.phone_number || undefined,
      };

      // Only include password if it's not empty
      if (profileForm.password && profileForm.password.trim() !== '') {
        updateData.password = profileForm.password;
      }

      await userApi.updateMyProfile(currentUser.id, updateData);
      
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      });
      
      // Refresh user data
      fetchCurrentUser();
      
      // Clear password field
      setProfileForm(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile',
      });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading.fetch) {
    return (
      <div className="w-full min-h-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="w-full min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Failed to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your personal information and settings</p>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Email</p>
                    <p className="text-lg font-bold truncate">{currentUser.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-100">Status</p>
                    <p className="text-lg font-bold">
                      {currentUser.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-100">Role</p>
                    <p className="text-lg font-bold">
                      {currentUser.is_superuser ? 'Admin' : 'User'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-100">Courses</p>
                    <p className="text-lg font-bold">
                      {currentUser.enrolled_courses.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-500 text-sm">User ID</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                    {currentUser.id}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Status</Label>
                  <div className="mt-2">
                    <Badge 
                      variant={currentUser.is_active ? "default" : "secondary"}
                      className={currentUser.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {currentUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Role</Label>
                  <div className="mt-2">
                    <Badge 
                      variant={currentUser.is_superuser ? "destructive" : "outline"}
                      className={currentUser.is_superuser ? "bg-red-100 text-red-800" : ""}
                    >
                      {currentUser.is_superuser ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Verified</Label>
                  <div className="mt-2 flex items-center">
                    {currentUser.is_verified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-sm">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Member Since</Label>
                  <p className="text-sm mt-1">{formatDate(currentUser.created_at)}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Last Updated</Label>
                  <p className="text-sm mt-1">{formatDate(currentUser.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        First Name
                      </Label>
                      <Input
                        id="first_name"
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Enter your first name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name">
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        Last Name
                      </Label>
                      <Input
                        id="last_name"
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Enter your last name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={profileForm.phone_number}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Enter your phone number (min 10 characters)"
                      minLength={10}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">
                      <Lock className="w-4 h-4 inline mr-2" />
                      New Password (Optional)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={profileForm.password}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave blank to keep current password"
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchCurrentUser}
                      disabled={loading.update}
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading.update}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading.update ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 
                toast.type === 'error' ? 'bg-red-500 text-white' : 
                toast.type === 'warning' ? 'bg-yellow-500 text-white' : 
                'bg-blue-500 text-white'
              }`}
            >
              <div className="font-semibold">{toast.title}</div>
              <div className="text-sm opacity-90">{toast.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;