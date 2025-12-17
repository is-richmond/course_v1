'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, Sparkles, CheckCircle } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    } else if (formData.email.length < 3) {
      newErrors.email = 'Email must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.access_token) {
        // Success - redirect to dashboard
        router.push('/admin/home');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure Login',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Modern Interface',
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Fast Access',
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                Admin Access
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
              Welcome to Plexus
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              Sign in to access your admin dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="font-medium">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="username"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: undefined });
                      setErrorMessage(null);
                    }}
                    className={`mt-2 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password" className="font-medium">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setErrors({ ...errors, password: undefined });
                        setErrorMessage(null);
                      }}
                      className={`pr-12 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Forgot Password */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 text-center shadow-sm border"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2 text-blue-600">
                  {feature.icon}
                </div>
                <p className="text-xs font-medium text-gray-700">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2024 Plexus Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;