"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Import the API client
import { userApi } from "@/lib/api/api";
// Improved JWT decoding function with error handling
function decodeJWT(token: string) {
  try {
    // Check if token has proper JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format: token must have 3 parts');
      return null;
    }

    // Get the payload (middle part)
    let payload = parts[1];
    
    // Add padding if needed (JWT base64 might not be properly padded)
    switch (payload.length % 4) {
      case 2: 
        payload += '==';
        break;
      case 3:
        payload += '=';
        break;
    }

    // Try to decode
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

// Function to validate token format before decoding
function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Basic check for each part (should be base64-like)
  return parts.every(part => 
    /^[A-Za-z0-9_-]+$/.test(part) && part.length > 0
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for non-protected routes
      if (pathname && (pathname.startsWith("/auth") || pathname.startsWith("/api"))) {
        setIsChecking(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      
      if (!token) {
        if (pathname && pathname.startsWith("/dashboard")) {
          router.push("/auth/login");
        }
        setIsChecking(false);
        return;
      }

      // Validate token format before attempting to decode
      if (!isValidJWTFormat(token)) {
        console.error('Invalid JWT format');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        router.push("/auth/login");
        setIsChecking(false);
        return;
      }

      // Decode token to check if it's valid
      const decodedToken = decodeJWT(token);
      
      if (!decodedToken || !decodedToken.sub) {
        console.error('Invalid token structure');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        router.push("/auth/login");
        setIsChecking(false);
        return;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.error('Token expired');
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        router.push("/auth/login");
        setIsChecking(false);
        return;
      }

      // Get user info from API using the centralized API client
      try {
        // Get user info
        const userInfo = await userApi.getCurrentUser();
        
        if (!userInfo) {
          throw new Error('No user info returned');
        }

        // Store user info for later use
        localStorage.setItem("user_info", JSON.stringify(userInfo));

        // Determine user role
        const userRole = userInfo.is_superuser ? "Администратор" : "Пользователь";
        localStorage.setItem("user_role", userRole);

        // Redirect logic for auth pages
        if (pathname && pathname.startsWith("/auth")) {
          if (userInfo.is_superuser) {
            router.push("/dashboard/admin");
          } else {
            router.push("/dashboard/home");
          }
          setIsChecking(false);
          return;
        }

        // Access control for dashboard routes
        if (pathname && pathname.startsWith("/dashboard")) {
          if (pathname.startsWith("/dashboard/admin") && !userInfo.is_superuser) {
            router.push("/dashboard/home");
            setIsChecking(false);
            return;
          }
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Failed to get user info:', error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        router.push("/auth/login");
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  // Show loading screen while checking auth
  if (isChecking) {
    return (
      <html lang="en">
        <body className="vsc-initialized">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Get user info safely
  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem("user_info");
      return userInfo ? JSON.parse(userInfo) : {};
    } catch {
      return {};
    }
  };

  return (
    <html lang="en">
      <body className="vsc-initialized">
        <SidebarProvider defaultOpen={true}>
          {pathname && (pathname.startsWith("/auth") || pathname.startsWith("/api")) ? (
            <main className="w-full h-full">{children}</main>
          ) : (
            <div className="flex min-h-screen w-screen">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0 w-full">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="ml-auto">
                    <span className="text-sm text-gray-600">
                      Welcome, {getUserInfo().email || "User"}
                    </span>
                  </div>
                </header>
                <main className="flex-1 w-full overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          )}
        </SidebarProvider>
      </body>
    </html>
  );
}