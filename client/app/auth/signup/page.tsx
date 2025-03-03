"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import GoogleAuthButton from "../../../components/forms/GoogleAuthButton";
import FormInput from "../../../components/forms/FormInput";
import { BiLogInCircle } from "react-icons/bi";
import Link from "next/link";

export default function SignupPage() {

    const [isLoading, setIsLoading] = useState(false); // ✅ Add loading state

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter(); // Initialize the useRouter hook
    const { setUser } = useUser(); // ✅ Ensure `useUser` is hydrated

    useEffect(() => {
        // Listen for changes to localStorage (when the token is set by the popup)
        const storageListener = () => {
            const userDataString = localStorage.getItem("googleAuthUser");

            if (userDataString) {

                const userData = JSON.parse(userDataString);

                console.log(userData)

                sessionStorage.setItem("authToken", JSON.stringify(userData.token));
                sessionStorage.setItem("user", JSON.stringify(userData.user));
                setUser(userData);

                // Redirect to the dashboard after successful sign-in
                router.push("/dashboard");
            }
        };

        // Add event listener to monitor localStorage changes
        window.addEventListener("storage", storageListener);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener("storage", storageListener);
        };
    }, [router, setUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true); // ✅ Show loading state

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false); // ✅ Reset loading state
        return;
        }

        try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
            }),
        });

        if (!response.ok) {
            throw new Error("Sign-up failed. Please try again.");
        }

        const data = await response.json();
        setSuccess("Sign-up successful! Redirecting...");

        console.log("Signup successful:", data);

        setTimeout(() => router.push("/auth/signin"), 1000); // ✅ Redirect after delay

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }finally {
            setIsLoading(false); // ✅ Reset loading state
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 flex flex-col items-center py-8">
            <div className="mt-24 w-full max-w-lg bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign Up</h2>

                    {/* Google Sign-Up Button */}
                    <GoogleAuthButton action="signup" />
                </div>

                <hr className="border-t border-gray-300 dark:border-gray-500 mb-6" />

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <FormInput
                        id="fullName"
                        label="Full Name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    <FormInput
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <FormInput
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />

                    <div className="flex items-center mt-4">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={formData.terms}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <label
                        htmlFor="terms"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                    >
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 font-medium">
                            Terms and Conditions
                        </a>
                    </label>
                    </div>

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            disabled={!formData.terms || isLoading} // Disable while loading
                            className={`w-full py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-md shadow-sm flex items-center gap-x-2 justify-center max-w-xs transition ${
                            (!formData.terms || isLoading) ? "opacity-50 cursor-not-allowed" : "hover:from-blue-600 hover:to-purple-600"
                            }`}
                        >
                            {isLoading ? (
                            <>
                                <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"></path>
                                </svg>
                                <span>Signing Up...</span>
                            </>
                            ) : (
                            <>
                                <BiLogInCircle />
                                <span>Sign Up</span>
                            </>
                            )}
                        </button>
                    </div>

                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-blue-600 font-medium hover:underline">
                        Sign In
                    </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
