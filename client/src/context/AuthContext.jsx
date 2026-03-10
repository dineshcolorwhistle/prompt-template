
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const checkUserStatus = async () => {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                const user = JSON.parse(storedUserInfo);
                setUserInfo(user);

                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                        signal: controller.signal
                    });

                    if (response.ok) {
                        const freshProfile = await response.json();
                        const updatedUserInfo = { ...user, ...freshProfile, token: user.token };
                        setUserInfo(updatedUserInfo);
                        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                    } else if (response.status === 401) {
                        // Token expired
                        localStorage.removeItem('userInfo');
                        setUserInfo(null);
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error("Failed to refresh user profile", error);
                    }
                }
            }
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        };
        checkUserStatus();
        return () => controller.abort();
    }, []);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    };

    const loginWithGoogle = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/google-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                setUserInfo(data);
                return data;
            } else {
                throw new Error(data.message || 'Error logging in with Google');
            }
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const value = {
        userInfo,
        login,
        logout,
        loginWithGoogle,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
