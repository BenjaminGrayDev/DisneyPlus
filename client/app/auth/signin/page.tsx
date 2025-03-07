"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import Link from "next/link";
import FormInput from "../../../components/forms/FormInput";
import GoogleAuthButton from "../../../components/forms/GoogleAuthButton";
import { BiSearch } from "react-icons/bi";


export default function SigninPage() {

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // ✅ Add loading state
    const router = useRouter(); // For navigation
    const { setUser } = useUser(); // ✅ Ensure `useUser` is hydrated

    useEffect(() => {
        // ✅ Listen for Google login data in localStorage
        const checkGoogleLogin = () => {
        const userDataString = localStorage.getItem("googleAuthUser");

        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);

                // ✅ Move auth data to localStorage
                localStorage.setItem("authToken", userData.token);
                localStorage.setItem("user", JSON.stringify(userData.user));

                // ✅ Update user context
                setUser(userData.user);

                // ✅ Remove from localStorage after use (to prevent re-triggers)
                localStorage.removeItem("googleAuthUser");

                // ✅ Redirect to dashboard
                router.push("/dashboard");
            } catch (error) {
                console.error("❌ Error parsing user data:", error);
            }
        }
        };

        // ✅ Check on mount
        checkGoogleLogin();

        // ✅ Check when localStorage changes
        const storageListener = () => checkGoogleLogin();
        window.addEventListener("storage", storageListener);

        return () => window.removeEventListener("storage", storageListener);
    }, [router, setUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
        ...prevData,
        [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true); // ✅ Set loading state

        try {
            // Send request to Payload CMS login API
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Sign-in failed. Please try again.");
            }

            let data = await response.json();

            console.log("Original Response Data:", data);

            // ✅ Ensure `data.user` exists
            if (!data.user) {
                data = {
                    user: {
                        name: data.name,
                        email: data.email,
                        role: data.role,
                    },
                    token: data.token,
                };
            }

            console.log("Updated Response Data:", data);

            // ✅ Ensure `window` is available before using `localStorage` (avoids SSR issues)
            if (typeof window !== "undefined") {
                localStorage.setItem("authToken", data.token);

                localStorage.setItem("user", JSON.stringify(data.user));
            }

            // ✅ Wrap `setUser` in try/catch to handle errors
            try {
                setUser(data.user);
            } catch (err) {
                console.error("Error setting user in context:", err);
            }

            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false); // ✅ Reset loading state
        }
    };

    const goToSignUp = () => {
        router.push("/auth/signup"); // Redirect to the sign-up page
    };

    return (
        <main className="min-h-screen bg-gray-100 w-full flex items-center justify-center text-gray-800 dark:text-gray-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Sign In
                    </h2>
                </div>

                <hr className="border-t border-gray-300 dark:border-gray-500 mb-6" />

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <FormInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full"
                    />
                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full"
                    />

                    <div className="flex justify-center">
                    <button
                        type="submit"
                        className="w-full max-w-md py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-md shadow-sm flex items-center gap-x-2 justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading} // Disable button when loading
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 20l-6-6m0 0l6-6m-6 6h18"
                                    />
                                </svg>

                            </>
                        )}
                    </button>
                    </div>

                </form>

                <hr className="border-t border-gray-300 dark:border-gray-500 my-6" />

                <div className="flex justify-center">
                    <GoogleAuthButton action="signin" /> {/* Centered Google button */}
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{" "}
                        <button
                            onClick={goToSignUp}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Sign up here
                        </button>
                    </p>
                </div>
            </div>
    </main>
    );
}
