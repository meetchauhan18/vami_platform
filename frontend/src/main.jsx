// libs import
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// local imports
import "./styles/index.css";
import { queryClient } from "@/app/query/queryClient.js";
import { store } from "@/app/store";
import { router } from "@/app/router";
import { AuthInitializer } from "@/app/AuthInitializer.jsx";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary.jsx";
import { ThemeInitializer } from "@/app/ThemeInitializer";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeInitializer>
            <AuthInitializer>
              <RouterProvider router={router} />
            </AuthInitializer>
          </ThemeInitializer>
          <Toaster position="bottom-right" reverseOrder={false} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
