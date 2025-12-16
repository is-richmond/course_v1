'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Icons
import { 
  Users, 
  BookOpen, 
  UserCircle,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface QuickLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgGradient: string;
}

const HomePage: React.FC = () => {
  const router = useRouter();

  const quickLinks: QuickLink[] = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <Users className="w-8 h-8" />,
      href: '/dashboard/users',
      color: 'text-blue-600',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Course Management',
      description: 'Create and manage courses and content',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/dashboard/course',
      color: 'text-green-600',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'My Profile',
      description: 'Update your personal information',
      icon: <UserCircle className="w-8 h-8" />,
      href: '/dashboard/admin',
      color: 'text-purple-600',
      bgGradient: 'from-purple-500 to-purple-600'
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure',
      description: 'Enterprise-grade security'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Modern',
      description: 'Intuitive user interface'
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Powerful',
      description: 'Advanced management tools'
    }
  ];

  return (
    <div className="w-full min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full h-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="px-6 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                  Admin Dashboard
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Welcome to Plexus
                <br />
                <span className="text-blue-200">Admin Panel</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Manage your platform with powerful tools and intuitive controls
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-blue-100">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Access</h2>
              <p className="text-gray-600">Navigate to key sections of the admin panel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <Card 
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 overflow-hidden"
                  onClick={() => router.push(link.href)}
                >
                  <div className={`h-2 bg-gradient-to-r ${link.bgGradient}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${link.bgGradient} text-white`}>
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {link.description}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                          Go to {link.title}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  Explore all features and manage your platform efficiently with our comprehensive admin tools
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                    onClick={() => router.push('/admin/users')}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Manage Users
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold"
                    onClick={() => router.push('/admin/courses')}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    View Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-white border-t px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">Secure</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">Fast</div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">Easy</div>
                <div className="text-sm text-gray-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;