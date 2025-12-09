import axios from "@/config/axiosConfig";
import { Login, User, Register } from "@/app/auth/types/index";
// const URL = `http://localhost:${process.env.authPort}/v1`



export async function login({ username, password }: Login): Promise<'success' | { message: string, error: unknown }> {
    try {
        const res = await axios.post<User>(`/auth/login`, { finger_print: 'bearer', username, password });
        localStorage.setItem('access_token', res.data.access_token);
        return "success";

    } catch (error) {
        return { message: 'Invalid username or password', error: error };
    }
}
export async function register(values: Register): Promise<'success' | { message: string, error: unknown }> {
    try {
        const res = await axios.post<User>(`/auth/register`, { username: values.username, iin: values.iin, role: values.role });
        localStorage.setItem('access_token', res.data.access_token);
        await axios.post(`${URL}/auth/change-password`, { password: values.password, confirm_password: values.password }, { headers: { Authorization: `Bearer ${res.data.access_token}` } });
        return "success";

    } catch (error) {
        return { message: 'Invalid username or password', error: error };
    }
}