import React from 'react';

const CustomLogin = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form style={{ width: '300px', padding: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
                <h2>Login</h2>
                <input type="email" placeholder="Email" required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input type="password" placeholder="Password" required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <button type="submit" style={{ width: '100%', padding: '10px', background: 'blue', color: '#fff' }}>Login</button>
            </form>
        </div>
    );
};

export default CustomLogin;
