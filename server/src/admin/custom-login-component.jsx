import React, { useState } from "react";

const CustomLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); 
        setLoading(true);

        try {
            const response = await fetch("/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                window.location.href = "/admin";
            } else {
                const data = await response.json();
                setError(data.message || "Invalid email or password");
            }
        } catch (err) {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2 style={styles.title}>
                    <span role="img" aria-label="lock">🔒</span>Disney Plus Admin Login
                </h2>

                {error && <p style={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button
                        type="submit"
                        style={{ ...styles.button, ...(loading ? styles.disabledButton : {}) }}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to top, #0c3483 0%, #a2b6df 100%, #6b8cce 100%, #a2b6df 100%)",
    },
    loginBox: {
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(15px)",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        width: "380px", // ✅ Wider container for better spacing
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        transition: "all 0.3s ease-in-out",
    },
    title: {
        marginBottom: "20px",
        fontSize: "22px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // ✅ Center everything
    },
    input: {
        width: "100%", // ✅ Ensures full width inside form
        maxWidth: "320px", // ✅ Makes sure it doesn't exceed container width
        padding: "12px",
        marginBottom: "12px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "rgba(255, 255, 255, 0.2)",
        color: "white",
        fontSize: "16px",
        outline: "none",
        transition: "all 0.3s ease-in-out",
    },
    button: {
        width: "100%", // ✅ Matches input width
        maxWidth: "350px", // ✅ Same as inputs
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        background: "linear-gradient(to right, #ff7b00, #ff5c00)",
        color: "white",
        transition: "transform 0.2s, background 0.3s",
    },
    disabledButton: {
        background: "#666",
        cursor: "not-allowed",
    },
    errorMessage: {
        color: "#ff4444",
        fontSize: "14px",
        marginBottom: "12px",
    },
};

export default CustomLogin;
