import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { LoadingScreen } from "@/app/components/LoadingScreen";
import { NotificationPrompt } from "@/app/components/NotificationPrompt";
import { useAuthStore } from "@/app/stores/authStore";
import { supabase } from "@/app/config/supabaseClient";

function AuthHandler() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        checkSession().then(() => {
          if (event === 'SIGNED_IN') {
            const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'back';
            toast.success(`Welcome, ${name}!`);
          }
          if (window.location.pathname === '/login' || window.location.hash.includes('access_token')) {
            window.location.href = '/';
          }
        });
      } else if (event === 'SIGNED_OUT') {
        toast.info('You have been signed out.');
        window.location.href = '/login';
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSession]);

  return null;
}

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
      <AuthHandler />
      <Toaster position="top-right" richColors />
      <NotificationPrompt />
    </>
  );
}
