"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Responsive container with padding for mobile
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 py-8 sm:py-12">
      {/* Card with responsive width and padding */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 sm:space-y-2 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl">Вход</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Введите ваши учетные данные для входа
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex gap-2 sm:gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">{error}</div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="min-h-[44px] sm:min-h-[40px] text-base sm:text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="min-h-[44px] sm:min-h-[40px] text-base sm:text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                "Вход"
              )}
            </Button>

            <div className="text-center text-sm sm:text-base py-1">
              <span className="text-gray-600">Нет аккаунта? </span>
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Регистрация
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
