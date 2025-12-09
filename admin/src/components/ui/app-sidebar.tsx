import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import * as React from 'react';
import { 
    ChevronRight, 
    LogOut,
    Newspaper,
    Shield,
    Wallet,
    Building2,
    User,
    HeadphonesIcon,
    Settings,
    Bell,
    Home,
    Package,
    Book, 
    ShoppingCart,
    CreditCard,
    BarChart3,
    Users
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';

// Menu configuration for Admin
const adminNavigation = {
    navMain: [
        {
            title: 'News',
            url: '#',
            icon: Newspaper,
            items: [
                {
                    title: 'Articles',
                    url: '/dashboard/news/articles',
                },
                {
                    title: 'Categories',
                    url: '/dashboard/news/categories',
                },
                {
                    title: 'Tags',
                    url: '/dashboard/news/tags',
                },
            ],
        },
        {
            title: 'Auth',
            url: '#',
            icon: Shield,
            items: [
                {
                    title: 'Users',
                    url: '/dashboard/auth/users',
                },
                {
                    title: 'Roles',
                    url: '/dashboard/auth/roles',
                },
                {
                    title: 'Permissions',
                    url: '/dashboard/auth/permissions',
                },
                {
                    title: 'Clients',
                    url: '/dashboard/auth/clients',
                },
                {
                    title: 'Agents',
                    url: '/dashboard/auth/agent',
                },
            ],
        },
        {
            title: 'Wallet',
            url: '#',
            icon: Wallet,
            items: [
                {
                    title: 'Wallets',
                    url: '/dashboard/wallet/wallets',
                },
                {
                    title: 'Deposits',
                    url: '/dashboard/wallet/deposits',
                },
                {
                    title: 'Withdraws',
                    url: '/dashboard/wallet/withdraw',
                },
                {
                    title: 'Transfers',
                    url: '/dashboard/wallet/transfers',
                },
                
            ],
        },
        {
            title: 'Provider',
            url: '#',
            icon: Building2,
            items: [
                {
                    title: 'Providers',
                    url: '/dashboard/provider',
                },
                {
                    title: 'Services',
                    url: '/dashboard/provider/services',
                },
            ],
        },
    ],
    singleItems: [
        {
            title: 'Support',
            url: '/dashboard/support/tickets',
            icon: HeadphonesIcon,
        },
        {
            title: 'Configs',
            url: '/dashboard/config',
            icon: Settings,
        },
        {
            title: 'Reports',
            url: '/dashboard/report',
            icon: Book,
        },
        {
            title: 'Notification',
            url: '/dashboard/notification',
            icon: Bell,
        }
    ]
};

// Menu configuration for Merchant
const merchantNavigation = {
    navMain: [
        {
            title: 'About',
            url: '/merchant/about',
            icon: Home,
            items: [],
        },
        {
            title: 'Clients',
            url: '#',
            icon: Package,
            items: [
                {
                    title: 'Wallets',
                    url: '/merchant/clients/clients_page',
                },
                {
                    title: 'Transactions',
                    url: '/merchant/clients/clients_transactions',
                },

            ],
        },
        {
            title: 'Orders',
            url: '#',
            icon: ShoppingCart,
            items: [
                {
                    title: 'All Orders',
                    url: '/dashboard/merchant/orders',
                },
                {
                    title: 'Pending',
                    url: '/dashboard/merchant/orders/pending',
                },
                {
                    title: 'Completed',
                    url: '/dashboard/merchant/orders/completed',
                },
            ],
        },
        {
            title: 'Payments',
            url: '#',
            icon: CreditCard,
            items: [
                {
                    title: 'Transactions',
                    url: '/dashboard/merchant/payments/transactions',
                },
                {
                    title: 'Payouts',
                    url: '/dashboard/merchant/payments/payouts',
                },
            ],
        },
        {
            title: 'Analytics',
            url: '#',
            icon: BarChart3,
            items: [
                {
                    title: 'Sales Report',
                    url: '/dashboard/merchant/analytics/sales',
                },
                {
                    title: 'Customer Insights',
                    url: '/dashboard/merchant/analytics/customers',
                },
            ],
        },
    ],
    singleItems: [
        {
            title: 'Customers',
            url: '/dashboard/merchant/customers',
            icon: Users,
        },
        {
            title: 'Settings',
            url: '/dashboard/merchant/settings',
            icon: Settings,
        },
    ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [userRole, setUserRole] = React.useState<string>('');
    const [userName, setUserName] = React.useState<string>('User');

    React.useEffect(() => {
        // Get user role from localStorage or decode JWT
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const role = payload.user?.role?.name || 'User';
                setUserRole(role);
                setUserName(payload.user?.username || 'User');
            } catch (e) {
                console.error('Failed to decode token:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_role_id');
        window.location.href = '/auth/login';
    };

    // Select navigation based on role
    const navigation = userRole === 'Мерчант' ? merchantNavigation : adminNavigation;
    const panelTitle = userRole === 'Мерчант' ? 'Merchant Panel' : 'Admin Panel';
    const panelSubtitle = userRole === 'Мерчант' ? 'Store Management' : 'Management';

    return (
        <Sidebar {...props} className="border-r border-border/40">
            <SidebarContent className="gap-0 bg-gradient-to-b from-card to-card/80">
                {/* Compact Header */}
                <div className="p-4 border-b border-border/30">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm text-foreground">{panelTitle}</h2>
                            <p className="text-[10px] text-muted-foreground">{panelSubtitle}</p>
                        </div>
                    </div>
                </div>

                <SidebarGroup className="px-3 py-3">
                    <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-0.5">
                            {/* Empty for now, can add home link if needed */}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Dynamic navigation based on role */}
                {navigation.navMain.map((item) => {
                    const Icon = item.icon;
                    
                    // If no items, render as single link
                    if (item.items.length === 0) {
                        return (
                            <SidebarGroup key={item.title} className="px-3 py-1">
                                <SidebarGroupContent>
                                    <SidebarMenu className="space-y-0.5">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                className="relative h-9 rounded-md transition-all duration-200 hover:bg-muted/60 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                <Link
                                                    href={item.url}
                                                    className="flex items-center gap-2.5 px-2.5 py-2 font-medium"
                                                >
                                                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        );
                    }

                    // Render collapsible menu
                    return (
                        <Collapsible
                            key={item.title}
                            title={item.title}
                            className="group/collapsible px-3"
                        >
                            <SidebarGroup className="py-1">
                                <SidebarGroupLabel
                                    asChild
                                    className="group/label text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-all duration-200 h-9 flex items-center justify-between px-2.5 font-medium"
                                >
                                    <CollapsibleTrigger>
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent className="mt-0.5">
                                    <SidebarGroupContent>
                                        <SidebarMenu className="space-y-0.5">
                                            {item.items.map((subItem) => (
                                                <SidebarMenuItem key={subItem.title}>
                                                    <SidebarMenuButton 
                                                        asChild
                                                        className="h-8 ml-6 rounded-sm transition-all duration-200 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                                    >
                                                        <a href={subItem.url} className="flex items-center gap-2.5 px-2 py-1.5 font-medium">
                                                            {subItem.title}
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    );
                })}

                {navigation.singleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <SidebarGroup key={item.title} className="px-3 py-1">
                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-0.5">
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className="relative h-9 rounded-md transition-all duration-200 hover:bg-muted/60 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <Link
                                                href={item.url}
                                                className="flex items-center gap-2.5 px-2.5 py-2 font-medium"
                                            >
                                                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}

                {/* Compact User Info */}
                <div className="mt-auto p-3 border-t border-border/30">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-muted/30">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{userName}</p>
                            <p className="text-[10px] text-muted-foreground">{userRole}</p>
                        </div>
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-border/30">
                <SidebarMenuButton
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 h-9 rounded-md bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 font-medium text-xs"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}