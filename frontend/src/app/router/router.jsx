// libs imports
import { createBrowserRouter } from "react-router-dom";
import {
  FiPlus,
  FiArrowRight,
  FiTrash2,
  FiMenu,
  FiLoader,
} from "react-icons/fi";

// local imports
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { GuestRoute } from "./GuestRoute.jsx";
import { Button } from "@/shared/components/ui/atoms/Button/index.js";
import { Input } from "@/shared/components/ui/atoms/Input/index.js";
import { FormField } from "../../shared/components/ui/molecules/FormField/FormField.jsx";
import { PasswordField } from "../../shared/components/ui/molecules/PasswordField/PasswordField.jsx";
import { AuthForm } from "../../shared/components/ui/organisms/AuthForm/AuthForm.jsx";
import { LoginPage } from "../../features/auth/components/LoginPage.jsx";
import { SignupPage } from "../../features/auth/components/SignupPage.jsx";

export const router = createBrowserRouter([
  // Public routes (guest only)
  {
    element: <GuestRoute />,
    children: [],
  },

  // Protected routes (authenticated only)
  {
    element: <ProtectedRoute />,
    children: [
      // {
      //   path: "/dashboard",
      //   element: <Dashboard />,
      // },
    ],
  },

  // Public routes (accessible to all)
  {
    path: "/",
    element: (
      <div className="flex flex-col gap-12 p-8 bg-[var(--bg-app)]">
        {/* ======================================================
      BUTTON
  ====================================================== */}

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Button
          </h1>

          {/* Primary */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Primary
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button>Primary</Button>
              <Button startIcon={<FiPlus />}>Add item</Button>
              <Button endIcon={<FiArrowRight />}>Continue</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          {/* Secondary */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Secondary
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary">Cancel</Button>
              <Button variant="secondary" startIcon={<FiTrash2 />}>
                Delete
              </Button>
              <Button variant="secondary" loading>
                Processing
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>
          </section>

          {/* Ghost */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Ghost
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="ghost">Learn more</Button>
              <Button variant="ghost" startIcon={<FiArrowRight />}>
                View details
              </Button>
              <Button variant="ghost" disabled>
                Disabled
              </Button>
            </div>
          </section>

          {/* Sizes */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Sizes
            </h2>
            <div className="flex items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          {/* Icon only */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Icon only
            </h2>
            <div className="flex gap-4">
              <Button iconOnly ariaLabel="Open menu" startIcon={<FiMenu />} />
              <Button
                iconOnly
                variant="secondary"
                ariaLabel="Delete item"
                startIcon={<FiTrash2 />}
              />
              <Button
                iconOnly
                variant="ghost"
                ariaLabel="Loading"
                loading
                startIcon={<FiLoader />}
              />
            </div>
          </section>

          {/* Full width */}
          <section className="flex flex-col gap-4 max-w-sm">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Full width
            </h2>
            <Button fullWidth endIcon={<FiArrowRight />}>
              Continue
            </Button>
          </section>
        </section>

        {/* ======================================================
      INPUT
  ====================================================== */}

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Input
          </h1>

          {/* Default */}
          <section className="flex flex-col gap-4 max-w-sm">
            <Input placeholder="Email address" />
            <Input type="password" placeholder="Password" />
          </section>

          {/* States */}
          <section className="flex flex-col gap-4 max-w-sm">
            <Input placeholder="Default state" />
            <Input
              variant="error"
              placeholder="Error state"
              aria-invalid="true"
            />
            <Input variant="success" placeholder="Success state" />
          </section>

          {/* Sizes */}
          <section className="flex flex-col gap-4 max-w-sm">
            <Input size="sm" placeholder="Small input" />
            <Input size="md" placeholder="Medium input" />
            <Input size="lg" placeholder="Large input" />
          </section>

          {/* Disabled & Read-only */}
          <section className="flex flex-col gap-4 max-w-sm">
            <Input disabled placeholder="Disabled input" />
            <Input value="Read-only value" readOnly />
          </section>
        </section>

        {/* ======================================================
      FORM FIELD
  ====================================================== */}

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            FormField
          </h1>

          <section className="flex flex-col gap-4 max-w-sm">
            <FormField
              label="Email"
              helperText="We’ll never share your email."
              inputProps={{
                type: "email",
                placeholder: "you@example.com",
              }}
            />
          </section>

          <section className="flex flex-col gap-4 max-w-sm">
            <FormField
              label="Username"
              success="Username is available"
              inputProps={{
                placeholder: "meet_chauhan",
              }}
            />
          </section>

          <section className="flex flex-col gap-4 max-w-sm">
            <FormField
              label="Email"
              disabled
              inputProps={{
                value: "user@example.com",
              }}
            />
          </section>
        </section>

        {/* ======================================================
      PASSWORD FIELD
  ====================================================== */}

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            PasswordField
          </h1>

          <section className="flex flex-col gap-6 max-w-sm">
            <PasswordField
              label="Password"
              required
              helperText="Must be at least 8 characters"
              inputProps={{
                autoComplete: "current-password",
                placeholder: "••••••••",
              }}
            />

            <PasswordField
              label="Create password"
              error="Password is too weak"
              inputProps={{
                autoComplete: "new-password",
                placeholder: "••••••••",
              }}
            />
          </section>
        </section>

        {/* ======================================================
      AUTH EXAMPLE
  ====================================================== */}

        <section className="flex flex-col gap-6 max-w-sm">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Auth · Sign in
          </h1>

          <FormField
            label="Email"
            required
            inputProps={{
              type: "email",
              autoComplete: "email",
              placeholder: "you@example.com",
            }}
          />

          <PasswordField
            label="Password"
            required
            inputProps={{
              autoComplete: "current-password",
              placeholder: "HELLLOOO",
            }}
          />

          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </section>

        {/* ======================================================
  AUTH FORM (ORGANISM)
====================================================== */}

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            AuthForm
          </h1>

          <AuthForm
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);

              console.log({
                email: data.get("email"),
                password: data.get("password"),
              });
            }}
          />
        </section>

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Login Page
          </h1>

          <LoginPage />
        </section>

        <section className="flex flex-col gap-8">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Signup Page
          </h1>

          <SignupPage />
        </section>
      </div>
    ),
  },

  // 404 fallback
  {
    path: "*",
    element: <div>404 - Page Not Found</div>,
  },
]);
