import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { signIn, signUp, getSession, signOut } from '../api/auth';

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await getSession();
                if (session.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.name,
                        createdAt: session.user.createdAt,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Session restore failed', error);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkSession();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const apiUser = await signIn(email, password);
            setUser({
                id: apiUser.id,
                email: apiUser.email,
                name: apiUser.name,
                createdAt: apiUser.createdAt,
            });
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Login error', error);
            setIsLoading(false);
            return false;
        }
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const apiUser = await signUp(email, name, password);
            setUser({
                id: apiUser.id,
                email: apiUser.email,
                name: apiUser.name,
                createdAt: apiUser.createdAt,
            });
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Registration failed', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error', error);
        }
        setUser(null);
    };

    const checkUserExists = async (_email: string): Promise<boolean> => {
        // Server handles duplicate detection during registration
        return false;
    };

    const updateProfile = async (_data: Partial<User>): Promise<boolean> => {
        // Stub for Phase 8
        return false;
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
