import { useEffect } from "react";

export function useAuthRedirect() {
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('access_token') !== null; // Check if the user is logged in
        if (!isLoggedIn) {
            window.location.href = '/auth/login';
        }
    }, []);
}