import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { useQueryClient } from '@tanstack/react-query';
import { useIncomeStore } from '../stores/incomeStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';

const SESSION_KEY = 'incometrack_session';
type LocalSession = { userId: string; token: string };

function readSession(): LocalSession | null {
    try {
        const value = localStorage.getItem(SESSION_KEY);
        const parsed = value ? JSON.parse(value) as Partial<LocalSession> : null;
        return parsed?.userId && parsed.token ? { userId: parsed.userId, token: parsed.token } : null;
    } catch {
        return null;
    }
}

function writeSession(userId: string | null): void {
    if (userId) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, token: crypto.randomUUID() }));
    else localStorage.removeItem(SESSION_KEY);
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkUserExists: (email: string) => Promise<boolean>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Restore a cached user synchronously from localStorage.
 * This avoids a flash of the unauthenticated state on page reload.
 */
function readCachedUser(): User | null {
    try {
        const cached = localStorage.getItem('incometrack_cached_user');
        return cached ? (JSON.parse(cached) as User) : null;
    } catch {
        return null;
    }
}

function cacheUser(user: User | null): void {
    try {
        if (user) {
            const { password: _, ...safe } = user;
            localStorage.setItem('incometrack_cached_user', JSON.stringify(safe));
        } else {
            localStorage.removeItem('incometrack_cached_user');
        }
    } catch {
        // Ignore
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(readCachedUser);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();
    const clearProfileData = useCallback(() => {
        queryClient.clear();
        useIncomeStore.getState().clear();
        useExpenseStore.getState().clear();
        useSubscriptionStore.getState().clear();
    }, [queryClient]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                clearProfileData();
                const session = readSession();
                localStorage.removeItem('current_user_id');
                if (session) {
                    const localUser = await storage.auth.getUserById(session.userId);
                    if (localUser) {
                        const restoredUser: User = {
                            id: localUser.id,
                            email: localUser.email,
                            name: localUser.name,
                            createdAt: localUser.createdAt,
                            avatar: localUser.avatar,
                            bio: localUser.bio,
                            firstName: localUser.firstName,
                            lastName: localUser.lastName,
                        };
                        setUser(restoredUser);
                        cacheUser(restoredUser);
                        storage.setUserId(localUser.id);
                    } else {
                        setUser(null);
                        cacheUser(null);
                        writeSession(null);
                        storage.setUserId(null);
                    }
                } else {
                    setUser(null);
                    cacheUser(null);
                    storage.setUserId(null);
                }
            } catch (error) {
                console.error('Session restore failed', error);
                setUser(null);
                cacheUser(null);
                storage.setUserId(null);
            }
            setIsLoading(false);
        };

        checkSession();
    }, [clearProfileData]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const localUser = await storage.auth.getUserByEmail(email);
            if (!localUser || !localUser.password) {
                setIsLoading(false);
                return false;
            }

            const hashMatches = await verifyPassword(password, localUser.password);
            let authenticated = hashMatches;

            if (!authenticated && localUser.password === password) {
                authenticated = true;
                const upgraded = { ...localUser, password: await hashPassword(password) };
                await storage.auth.updateUser(upgraded);
            }

            if (!authenticated) {
                setIsLoading(false);
                return false;
            }

            const restoredUser: User = {
                id: localUser.id,
                email: localUser.email,
                name: localUser.name,
                createdAt: localUser.createdAt,
                avatar: localUser.avatar,
                bio: localUser.bio,
                firstName: localUser.firstName,
                lastName: localUser.lastName,
            };
            setUser(restoredUser);
            cacheUser(restoredUser);
            clearProfileData();
            writeSession(localUser.id);
            storage.setUserId(localUser.id);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Login error', error);
            setIsLoading(false);
            return false;
        }
    }, [clearProfileData]);

    const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const existingUser = await storage.auth.getUserByEmail(email);
            if (existingUser) {
                alert('A user with this email already exists.');
                setIsLoading(false);
                return false;
            }

            const hashedPassword = await hashPassword(password);
            const newUser: User = {
                id: crypto.randomUUID(),
                email,
                name,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
            };

            await storage.auth.createUser(newUser);
            const publicUser: User = {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                createdAt: newUser.createdAt,
            };
            setUser(publicUser);
            cacheUser(publicUser);
            clearProfileData();
            writeSession(newUser.id);
            storage.setUserId(newUser.id);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Registration failed', error);
            setIsLoading(false);
            return false;
        }
    }, [clearProfileData]);

    const logout = useCallback(async () => {
        writeSession(null);
        cacheUser(null);
        clearProfileData();
        storage.setUserId(null);
        setUser(null);
    }, [clearProfileData]);

    const checkUserExists = useCallback(async (email: string): Promise<boolean> => {
        const existingUser = await storage.auth.getUserByEmail(email);
        return !!existingUser;
    }, []);

    const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
        if (!user) return false;
        try {
            const localUser = await storage.auth.getUserById(user.id);
            if (!localUser) return false;

            const email = data.email?.trim().toLowerCase();
            if ('email' in data && (!email || !/^\S+@\S+\.\S+$/.test(email))) return false;
            if (email && email !== localUser.email.toLowerCase()) {
                const existingUser = await storage.auth.getUserByEmail(email);
                if (existingUser && existingUser.id !== localUser.id) return false;
            }

            const updatedUser = { ...localUser, ...data, ...(email ? { email } : {}) };
            await storage.auth.updateUser(updatedUser);
            const publicUser: User = {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                createdAt: updatedUser.createdAt,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            };
            setUser(publicUser);
            cacheUser(publicUser);
            return true;
        } catch (error) {
            console.error('Update profile failed', error);
            return false;
        }
    }, [user]);

    const value = useMemo<AuthContextType>(() => ({
        user,
        isLoading,
        login,
        register,
        logout,
        checkUserExists,
        updateProfile,
    }), [user, isLoading, login, register, logout, checkUserExists, updateProfile]);

    return (
        <AuthContext.Provider value={value}>
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
