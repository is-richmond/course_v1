'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UserFilters, 
  PaginationState, 
  UserFormData, 
  LoadingState,
  ToastMessage,
  UserTableColumn 
} from './types';
import { userApi, enrollmentApi } from './api';

// Import UI components (adjust paths based on your UI structure)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons (adjust based on your icon library)
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [loading, setLoading] = useState<LoadingState>({
    users: false,
    create: false,
    update: false,
    delete: false,
    grantAdmin: false,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const tableColumns: UserTableColumn[] = [
    { key: 'email', label: 'Email', sortable: true },
    { key:  'is_active', label: 'Status', sortable: true, width: '120px' },
    { key:  'is_superuser', label: 'Role', sortable: true, width:  '120px' },
    { key: 'is_verified', label: 'Verified', sortable: true, width: '100px' },
    { key:  'created_at', label:  'Created', sortable: true, width: '140px' },
    { key:  'actions', label: 'Actions', width: '180px' },
  ];

  // Toast management
  const addToast = useCallback((toast:  Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ... toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const data = await userApi.getUsers(pagination. page, pagination.limit);
      setUsers(data);
      setPagination(prev => ({ ...prev, total: data.length }));
      addToast({
        type: 'success',
        title: 'Success',
        message: `Loaded ${data.length} users`,
      });
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
  }, [pagination.page, pagination.limit, addToast]);

  // Apply filters
  useEffect(() => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter(user => user.is_active === filters. is_active);
    }

    if (filters.is_superuser !== undefined) {
      filtered = filtered.filter(user => user.is_superuser === filters. is_superuser);
    }

    if (filters.is_verified !== undefined) {
      filtered = filtered.filter(user => user.is_verified === filters.is_verified);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  // Load users on mount and pagination change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create user
  const handleCreateUser = async (userData: UserFormData) => {
    setLoading(prev => ({ ...prev, create: true }));
    try {
      await userApi.createUser({
        email: userData.email,
        password: userData.password! ,
      });
      addToast({
        type: 'success',
        title: 'User Created',
        message: `User ${userData.email} created successfully`,
      });
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create user',
      });
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Update user
  const handleUpdateUser = async (userId: string, userData:  Partial<UserFormData>) => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      await userApi.updateUser(userId, userData);
      addToast({
        type: 'success',
        title: 'User Updated',
        message: 'User updated successfully',
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user',
      });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await userApi.deleteUser(userId);
      addToast({
        type: 'success',
        title: 'User Deleted',
        message: 'User deleted successfully',
      });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user',
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Grant admin role
  const handleGrantAdmin = async (userId: string) => {
    setLoading(prev => ({ ...prev, grantAdmin: true }));
    try {
      await userApi.grantAdmin({ user_id: userId });
      addToast({
        type: 'success',
        title: 'Admin Role Granted',
        message: 'Admin role granted successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error granting admin role:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to grant admin role',
      });
    } finally {
      setLoading(prev => ({ ...prev, grantAdmin: false }));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full h-full">
        {/* Header с полной шириной */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage users, roles, and permissions</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Content area с полной шириной */}
        <div className="p-6 space-y-6">
          {/* Stats Cards - используем всю ширину */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-100">Total Users</p>
                    <p className="text-3xl font-bold">{users.length}</p>
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
                    <p className="text-sm font-medium text-green-100">Active Users</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.is_active).length}
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
                    <p className="text-sm font-medium text-purple-100">Admins</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.is_superuser).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-100">Verified</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.is_verified).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search - растягиваем на всю ширину */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users by email..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select 
                  value={filters.is_active?. toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      is_active: value === 'all' ? undefined : value === 'true' 
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.is_superuser?. toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      is_superuser: value === 'all' ? undefined : value === 'true' 
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="true">Admin</SelectItem>
                    <SelectItem value="false">User</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ search: '' });
                  }}
                  className="px-4"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table - полная ширина */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Users ({filteredUsers.length})</CardTitle>
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={loading. users}
              >
                {loading.users ? 'Loading.. .' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      {tableColumns.map((column) => (
                        <TableHead 
                          key={column.key} 
                          style={{ width: column.width }}
                          className="font-semibold text-gray-900"
                        >
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.users ? (
                      <TableRow>
                        <TableCell colSpan={tableColumns. length} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-500">Loading users...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={tableColumns.length} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <UserPlus className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user. is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-green-100 text-green-800" : ""}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_superuser ? "destructive" : "outline"}
                              className={user. is_superuser ? "bg-red-100 text-red-800" : ""}
                            >
                              {user.is_superuser ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.is_verified ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsViewModalOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditModalOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
                    disabled={pagination.page === 1}
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

export default UsersPage;