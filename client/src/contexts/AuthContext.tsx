import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "@/constants/api";

interface User {
  id: string;
  email: string;
  name?: string;
  industry?: string;
  specialization?: string;
  checklist?: string;
  profile_pic_url?: string;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, callback?: () => void) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Helper function to set cookie
  const setCookie = (name: string, value: string, days: number = 30) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
  };

  // Helper function to delete cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  useEffect(() => {
    // Check for stored authentication data in cookies
    const storedUserData = getCookie("userData");
    const storedToken = getCookie("accessToken");

    console.log("Checking stored auth data in cookies...");
    console.log("Stored userData:", storedUserData);
    console.log("Stored token:", storedToken ? "Present" : "Missing");

    if (storedUserData && storedToken) {
      try {
        const userData = JSON.parse(decodeURIComponent(storedUserData));
        console.log("Parsed userData:", userData);
        setUser(userData);
        setAccessToken(storedToken);
        console.log("Authentication restored from cookies");
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        deleteCookie("userData");
        deleteCookie("accessToken");
      }
    } else {
      console.log("No stored authentication data found in cookies");
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User, callback?: () => void) => {
    console.log("Login called with userData:", userData);
    console.log("Access token in userData:", userData.access_token);
    
    setUser(userData);
    setAccessToken(userData.access_token);
    
    // Store in cookies instead of localStorage
    setCookie("userData", encodeURIComponent(JSON.stringify(userData)), 30);
    setCookie("accessToken", userData.access_token, 30);
    
    console.log("Stored access token in cookies:", userData.access_token);
    
    // Execute callback after state update
    if (callback) {
      setTimeout(callback, 0);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    deleteCookie("userData");
    deleteCookie("accessToken");
    console.log("User logged out, cookies cleared");
  };

  const setToken = (token: string) => {
    setAccessToken(token);
    setCookie("accessToken", token, 30);
    console.log("Access token updated in cookies");
  };

  const isAuthenticated = Boolean(user && accessToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}