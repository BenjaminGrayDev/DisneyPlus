import React, { useState } from "react";

const CustomLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            // Send login request to AdminJS authentication API
            const response = await fetch("/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                // Redirect to AdminJS dashboard after successful login
                window.location.href = "/admin";
            } else {
                const data = await response.json();
                setError(data.message || "Invalid email or password");
            }
        } catch (err) {
            setError("Login failed. Please try again.");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <form onSubmit={handleSubmit} style={{ width: "300px", padding: "20px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}>
                <h2>Login</h2>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
                />
                <button type="submit" style={{ width: "100%", padding: "10px", background: "blue", color: "#fff" }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default CustomLogin;
