"use client";

import { useEffect, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import type { User } from "@/store/authSlice";
import { jwtDecode } from "jwt-decode";

// 1. We move the logic into a sub-component
function LoginSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        const user = jwtDecode<User>(token);
        dispatch(setCredentials({ user, token }));
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
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Logging you in...</h2>
    </div>
  );
}

// 2. The Main Page wraps it in Suspense
export default function LoginSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginSuccessContent />
      </Suspense>
    </div>
  );
}