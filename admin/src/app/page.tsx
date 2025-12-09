"use client"
import { useAuthRedirect } from '@/hooks/use-loggedIn'
import React from 'react'

const HomePage = () => {
    useAuthRedirect()
    return (
        <div>page</div>
    )
}

export default HomePage