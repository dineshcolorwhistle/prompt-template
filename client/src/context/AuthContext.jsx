
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                    });

                    if (response.ok) {
                        const updatedUser = await response.json();
                        // Merge updated profile with existing token
                        const newUserData = { ...user, ...updatedUser };
                        localStorage.setItem('userInfo', JSON.stringify(newUserData));
                        setUserInfo(newUserData);
                    } else if (response.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem('userInfo');
                        setUserInfo(null);
                    }
                } catch (error) {
                    console.error("Failed to refresh user profile", error);
                }
            }
            setLoading(false);
        };

        checkUserStatus();
    }, []);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    };

    const value = {
        userInfo,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
