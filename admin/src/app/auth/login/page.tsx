"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "../services/api"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
    email: z.string().includes("@").min(2, {
        message: "Email must be at least 2 characters.",
    }),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters."
    })
})

const LoginPage = () => {
    const router = useRouter()
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ''
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const ans = await login(values);
            if (ans === "success") {
                router.push('/dashboard/users');
            } else if (ans && ans.message) {
                setErrorMessage(ans.message);
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setErrorMessage("Login failed. Please try again.");
        }
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#CCD4DB] via-[#FFFFFF] to-[#1A2330] relative">
            {/* Top branding/title */}
            <div className="absolute top-10 left-0 w-full flex justify-center pointer-events-none select-none z-10">
                <div className="flex flex-col items-center">
                    <span className="bg-gradient-to-r from-[#D1F414] to-[#1A2330] bg-clip-text text-transparent">
                        Admin Panel
                    </span>
                    <span className="text-muted-foreground mt-1 text-lg font-light opacity-70">Back Office</span>
                </div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-none rounded-2xl bg-[#FFFFFF]/90 backdrop-blur-lg backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center text-primary">
                        Log In
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="admin@example.com"
                                                autoComplete="username"
                                                className="py-3 px-5 rounded-xl border border-[#CCD4DB] focus:border-[#D1F414] focus:ring-2 focus:ring-[#D1F414]/50 transition"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                className="py-3 px-5 rounded-xl border border-[#CCD4DB] focus:border-[#D1F414] focus:ring-2 focus:ring-[#D1F414]/50 transition"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full mt-2 py-3 text-base rounded-xl font-semibold 
                                        bg-gradient-to-r from-[#D1F414] to-[#1A2330] 
                                        hover:from-[#CCD4DB] hover:to-[#1A2330] 
                                        text-white shadow-md transition-all"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Loading..." : "Sign In"}
                            </Button>
                        </form>
                    </Form>
                    {errorMessage && (
                        <div className="mt-4 text-center">
                            <p className="text-red-500 text-sm">{errorMessage}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Background illustration */}
            <svg className="absolute left-0 bottom-0 w-full pointer-events-none opacity-30" height="160" viewBox="0 0 1440 320">
                <defs>
                    <linearGradient id="wave" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#D1F414" />
                        <stop offset="1" stopColor="#1A2330" />
                    </linearGradient>
                </defs>
                <path fill="url(#wave)" fillOpacity="1" d="M0,64L48,106.7C96,149,192,235,288,250.7C384,267,480,213,576,181.3C672,149,768,139,864,165.3C960,192,1056,256,1152,266.7C1248,277,1344,235,1392,213.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
        </div>
    )
}

export default LoginPage