"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import type { User } from "@/store/authSlice";
import { jwtDecode } from "jwt-decode";

export default function LoginSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        // Decode the token to get user info
        const user = jwtDecode<User>(token);
        
        // Save to Redux
        dispatch(setCredentials({ user, token }));
        
        // Redirect to Home
        router.push("/");
      } catch (error) {
        console.error("Invalid token", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Logging you in...</h2>
      </div>
    </div>
  );
}