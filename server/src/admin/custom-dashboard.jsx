import React from "react";

console.log("🔥 Custom Dashboard Component Loaded! 🔥");

const CustomDashboard = () => {
    return (
        <div style={styles.container}>
            {/* Dashboard Header with Welcome Greeting */}
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>🚀 Welcome to Disney Plus Admin Panel</h1>
                <p style={styles.subtitle}>Manage your system efficiently with ease.</p>
            </header>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to bottom, #f3f4f6, #e3e8ff, #e0d3ff)", // ✅ Soft background gradient
    },
    header: {
        textAlign: "center",
        background: "linear-gradient(to right, #1e3c72, #2a5298)", // ✅ Elegant header gradient
        padding: "30px",
        borderRadius: "12px",
        color: "white",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
    },
    headerTitle: {
        margin: "0",
        fontSize: "26px",
        fontWeight: "bold",
    },
    subtitle: {
        marginTop: "10px",
        fontSize: "18px",
        opacity: "0.9",
    },
};

export default CustomDashboard;
