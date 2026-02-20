"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { tokenService } from "@/lib/tokenService";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  updateAccessToken: (accessToken: string) => void;
  getRefreshToken: () => string | null;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    const token = tokenService.getAccessToken();
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse user data", e);
        tokenService.clearTokens();
        localStorage.removeItem("user");
      }
    }
    return null;
  });
  const [isInitialized] = useState(true);
  const client = useApolloClient();
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "accessToken" && event.newValue === null) {
        setUser(null);
        client.clearStore();
        router.push("/");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [client, router]);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    tokenService.setAccessToken(accessToken);
    tokenService.setRefreshToken(refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    tokenService.clearTokens();
    localStorage.removeItem("user");
    setUser(null);
    await client.clearStore();
    router.push("/");
  };

  const updateAccessToken = (accessToken: string) => {
    tokenService.setAccessToken(accessToken);
  };

  const getRefreshToken = () => {
    return tokenService.getRefreshToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateAccessToken,
        getRefreshToken,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
