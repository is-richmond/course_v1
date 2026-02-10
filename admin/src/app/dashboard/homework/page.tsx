'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Photo, PhotosByDate, MediaListResponse } from '@/lib/types/types';
import { userApi, photosApi } from '@/lib/api/api';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Icons
import { 
  Search, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User as UserIcon,
  X
} from 'lucide-react';

// Types
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const UserPhotosPage:  React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosByDate, setPhotosByDate] = useState<PhotosByDate>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [loading, setLoading] = useState({
    users: false,
    photos: false,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit:  20,
  });

  // Toast management
  const addToast = useCallback((toast:  Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ... toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      // API принимает: skip (от 0), limit (от 1 до 1000)
      // getUsers(skip, limit) - skip должен быть >= 0
      const skip = 0;  // начинаем с первого пользователя
      const limit = 1000;  // максимальный лимит API
      const data = await userApi.getUsers(skip, limit);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users',
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [addToast]); // убираем pagination из зависимостей

  // Fetch user photos
  const fetchUserPhotos = useCallback(async (userId:  string) => {
    setLoading(prev => ({ ...prev, photos: true }));
    try {
      const response:  MediaListResponse = await photosApi.getUserPhotos(userId, 0, 1000);
      
      // Map API response to Photo array - API returns data in 'media' field
      const photosData:  Photo[] = (response.media || []).map(item => ({
        ... item,
        // Add aliases for backwards compatibility
        file_name: item.original_filename,
        file_path: item.download_url,
        upload_date: item.created_at,
        file_size: item.size,
        mime_type: item.content_type,
      }));

      setPhotos(photosData);

      // Group photos by date
      const grouped:  PhotosByDate = {};
      photosData.forEach(photo => {
        const date = new Date(photo.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(photo);
      });

      // Sort dates in descending order
      const sortedGrouped:  PhotosByDate = {};
      Object.keys(grouped)
        .sort((a, b) => new Date(grouped[b][0]. created_at).getTime() - new Date(grouped[a][0].created_at).getTime())
        .forEach(date => {
          sortedGrouped[date] = grouped[date]. sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

      setPhotosByDate(sortedGrouped);
    } catch (error) {
      console.error('Error fetching photos:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch user photos',
      });
      setPhotos([]);
      setPhotosByDate({});
    } finally {
      setLoading(prev => ({ ...prev, photos: false }));
    }
  }, [addToast]);

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery. toLowerCase()) ||
        (user.first_name?. toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open photos modal
  const openPhotosModal = async (user: User) => {
    setSelectedUser(user);
    setIsPhotosModalOpen(true);
    await fetchUserPhotos(user.id);
  };

  // Format file size
  const formatFileSize = (bytes?:  number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Photos</h1>
              <p className="text-gray-600">View and manage user uploaded photos</p>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Total Users</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-100">Users with Photos</p>
                    <p className="text-3xl font-bold">
                      {filteredUsers. length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-100">Active Users</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Users ({filteredUsers.length})</CardTitle>
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={loading.users}
              >
                {loading.users ?  'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Full Name</TableHead>
                      <TableHead className="font-semibold text-gray-900">Email</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Created</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.users ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-500">Loading users...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <UserIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-green-100 text-green-800" : ""}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month:  'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPhotosModal(user)}
                              className="flex items-center gap-2"
                            >
                              <ImageIcon className="w-4 h-4" />
                              View Photos
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, filteredUsers.length)} of{' '}
                  {filteredUsers.length} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination. page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= filteredUsers. length}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photos Modal */}
        <Dialog open={isPhotosModalOpen} onOpenChange={setIsPhotosModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photos for {selectedUser?. email}
              </DialogTitle>
              {selectedUser && (
                <p className="text-sm text-gray-500">
                  Total photos: {photos.length}
                </p>
              )}
            </DialogHeader>
            
            {loading.photos ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-500">Loading photos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No photos found for this user</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(photosByDate).map(([date, datePhotos]) => (
                  <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-lg text-gray-900">{date}</h3>
                      <Badge variant="outline" className="ml-2">
                        {datePhotos.length} {datePhotos.length === 1 ? 'photo' : 'photos'}
                      </Badge>
                    </div>

                    {/* Photos Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {datePhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all cursor-pointer bg-gray-100"
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setIsPhotoPreviewOpen(true);
                          }}
                        >
                          <img
                            src={photo.download_url}
                            alt={photo.original_filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
                            <span className="text-white text-xs font-medium">
                              {formatDateTime(photo.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setIsPhotosModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Photo Preview Modal */}
        <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
          <DialogContent className="sm: max-w-3xl">
            <DialogHeader>
              <DialogTitle>Photo Details</DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedPhoto.download_url}
                    alt={selectedPhoto.original_filename}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">File Name</p>
                    <p className="font-medium">{selectedPhoto.original_filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upload Date</p>
                    <p className="font-medium">
                      {new Date(selectedPhoto.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Size</p>
                    <p className="font-medium">{formatFileSize(selectedPhoto.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{selectedPhoto.content_type || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsPhotoPreviewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

export default UserPhotosPage;