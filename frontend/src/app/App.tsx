import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { Toaster } from "sonner";
import { LoadingScreen } from "@/app/components/LoadingScreen";
import { NotificationPrompt } from "@/app/components/NotificationPrompt";

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-right" richColors />
      <NotificationPrompt />
    </>
  );
}
