# Auth Group Documentation

This directory contains all authentication-related pages and components using Next.js route groups.

## Structure

```
(auth)/
├── components/         # Reusable auth UI components
│   ├── AuthForm.tsx   # Main form wrapper for all auth pages
│   ├── AuthHeader.tsx # Header with logo, title, and subtitle
│   ├── AuthSwitch.tsx # Toggle between signin/signup
│   ├── Input.tsx      # Form input with icon and error support
│   └── Dropdown.tsx   # Dropdown/select component
├── signin/
│   ├── page.tsx       # Sign in page
│   └── schema.ts      # Zod validation schema
├── signup/
│   ├── page.tsx       # Sign up page
│   └── schema.ts      # Zod validation schema
└── forgot-password/
    └── page.tsx       # Static contact-support page (no API call)

```

## Components

### AuthForm

A reusable form wrapper that provides:
- Consistent layout across all auth pages
- Error handling with alerts
- Submit button with loading state
- Optional switch between signin/signup
- RTL (right-to-left) support

**Usage:**

```tsx
<AuthForm
  title="أهلاً بك من جديد!"
  subtitle="سجّل دخولك للمتابعة مع Orderaa"
  onSubmit={handleSubmit(onSubmit)}
  error={error}
  isSubmitting={isSubmitting}
  submitButtonText="تسجيل الدخول"
  submitButtonLoadingText="جاري تسجيل الدخول..."
  switchGoTo="signup"
>
  {/* Form fields go here */}
</AuthForm>
```

### Input

A form input component with:
- Label support
- Icon support (right-aligned for RTL)
- Error message display
- React Hook Form integration

### AuthSwitch

A link component that switches between signin and signup pages.

## Pages

### forgot-password

Self-service password reset is disabled. The page shows a static Arabic
message that tells the user to contact support, plus a link back to
`/signin`. The page makes no API call.
