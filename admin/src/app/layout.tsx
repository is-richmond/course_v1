"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Utility function to decode JWT and extract user info
function decodeJWT(token: string) {
  try {
    const payload = JSON. parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

export default function RootLayout({ children }: { children: React. ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        if (pathname && pathname.startsWith("/dashboard")) {
          router.push("/auth/login");
        }
        setIsChecking(false);
        return;
      }

      const decodedToken = decodeJWT(token);
      
      if (!decodedToken || ! decodedToken.user || ! decodedToken.user.role) {
        console.error('Invalid token structure');
        localStorage. removeItem("access_token");
        router.push("/auth/login");
        setIsChecking(false);
        return;
      }

      const userRole = decodedToken.user.role. name;
      const userRoleId = decodedToken.user.role.id;

      localStorage.setItem("user_role", userRole);
      localStorage.setItem("user_role_id", userRoleId);

      if (pathname && pathname.startsWith("/auth")) {
        if (userRole === "Администратор") {
          router. push("/dashboard/admin");
        } else if (userRole === "Мерчант") {
          router.push("/dashboard/merchant");
        } else {
          router.push("/dashboard/home");
        }
        setIsChecking(false);
        return;
      }

      if (pathname && pathname.startsWith("/dashboard")) {
        if (userRole === "Администратор" && !pathname.startsWith("/dashboard")) {
          router.push("/dashboard/admin");
          setIsChecking(false);
          return;
        }
        
        if (userRole === "Мерчант" && !pathname.startsWith("/dashboard/merchant")) {
          router.push("/merchant/about");
          setIsChecking(false);
          return;
        }

        if (userRole !== "Администратор" && pathname.startsWith("/dashboard")) {
          router. push("/dashboard/home");
          setIsChecking(false);
          return;
        }

        if (userRole !== "Мерчант" && pathname.startsWith("/dashboard/merchant")) {
          router.push("/dashboard/home");
          setIsChecking(false);
          return;
        }
      }

      setIsChecking(false);
    };
    
    checkAuth();
  }, [pathname, router]);

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

  let content;

  if (pathname && (pathname.startsWith("/auth") || pathname.startsWith("/api"))) {
    content = <main className="w-full">{children}</main>;
  } else {
    content = (
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-screen flex-col">
            <SidebarTrigger />
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  return (
    <html lang="en">
      <body className="vsc-initialized h-screen overflow-hidden">
        {content}
      </body>
    </html>
  );
}