"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "../types";


export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const pathname = usePathname(); // ✅ Get the current route
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return; // ✅ Prevent SSR access

        // ✅ Mark hydration as complete
        setIsHydrated(true);

        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                const userData: User = JSON.parse(storedUser);
                setUser(userData);
            } catch (error) {
                console.error("Invalid user data in localStorage", error);
                localStorage.removeItem("user");
                setUser(null);
            }
        } else {
            // ✅ Exclude public pages from redirection
            const publicPaths = ["/", "/auth/signup", "/auth/signin", "/privacy-policy", "/terms-of-service"];

            if (pathname && !publicPaths.includes(pathname) && isHydrated) {
                console.warn("Redirecting to signin...");
                router.push("/auth/signin"); // ✅ Use Next.js routing instead of full reload
            }
        }
    }, [pathname, isHydrated, router]);

    // ✅ Function to refresh user session
    const refreshUser = async () => {
        try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.warn("No auth token found, cannot refresh user.");
            return;
        }

        const response = await fetch("http://localhost:5000/api/usrInfo", {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
            console.warn("Unauthorized, logging out...");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setUser(null);
            router.push("/auth/signin"); // Redirect to signin on auth failure
            }
            throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        // ✅ Update localStorage with refreshed user data
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        } catch (error) {
        console.error("Error refreshing user data:", error);
        localStorage.removeItem("user"); // Remove invalid session data
        setUser(null);
        }
    };

    return { user, setUser, refreshUser, isHydrated };
}
