export type Login = {
    username: string;
    password: string;
}
export type Register = {
    username: string;
    password: string;
    iin: string;
    role: string;
}
export type User = {
    token_type: string
    access_token: string
    refresh_token: string
}
