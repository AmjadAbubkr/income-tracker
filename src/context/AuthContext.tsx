import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string) => Promise<boolean>;
    register: (user: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
    logout: () => void;
    checkUserExists: (email: string) => Promise<boolean>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for persisted session
        const checkSession = async () => {
            const savedEmail = localStorage.getItem('user_email_session');
            if (savedEmail) {
                try {
                    const userData = await storage.auth.getUserByEmail(savedEmail);
                    if (userData) {
                        setUser(userData);
                        storage.setUserId(userData.id);
                    } else {
                        // Session invalid
                        localStorage.removeItem('user_email_session');
                    }
                } catch (error) {
                    console.error("Session restore failed", error);
                }
            }
            setIsLoading(false);
        };

        checkSession();
    }, []);

    const login = async (email: string): Promise<boolean> => {
        setIsLoading(true); // fast loads, but show spinner if needed
        try {
            const userData = await storage.auth.getUserByEmail(email);
            if (userData) {
                setUser(userData);
                storage.setUserId(userData.id);
                localStorage.setItem('user_email_session', email); // Simple persistence
                setIsLoading(false);
                return true;
            }
        } catch (error) {
            console.error("Login error", error);
        }
        setIsLoading(false);
        return false;
    };

    const register = async (newUser: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Check if user exists first
            const existing = await storage.auth.getUserByEmail(newUser.email);
            if (existing) {
                setIsLoading(false);
                return false; // Email taken
            }

            const user: User = {
                ...newUser,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };

            await storage.auth.createUser(user);

            // Auto login after register
            setUser(user);
            storage.setUserId(user.id);
            localStorage.setItem('user_email_session', user.email);

            setIsLoading(false);
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        storage.setUserId(null);
        localStorage.removeItem('user_email_session');
        // window.location.reload(); // Hard reload to clear app state if needed, or just let React handle it
    };

    const checkUserExists = async (email: string): Promise<boolean> => {
        const user = await storage.auth.getUserByEmail(email);
        return !!user;
    };

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        if (!user) return false;
        try {
            const updatedUser = { ...user, ...data };
            await storage.auth.updateUser(updatedUser);
            setUser(updatedUser);
            return true;
        } catch (error) {
            console.error("Update profile failed", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkUserExists, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
