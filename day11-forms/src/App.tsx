import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AccountSchema,
  ProfileSchema,
  PreferencesSchema,
  type AccountFormData,
  type ProfileFormData,
  type PreferencesFormData,
  type CombinedFormData,
} from "./schemas";

type Step = 1 | 2 | 3;

// --- Step indicator: circles + connecting lines ---
function StepIndicator({
  currentStep,
  progressPercent,
}: {
  currentStep: Step;
  progressPercent: number;
}) {
  const steps: Step[] = [1, 2, 3];
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line (background) */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-600 -z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-300 -z-0"
          style={{ width: `${progressPercent}%` }}
        />
        {steps.map((step) => {
          const isCurrent = step === currentStep;
          const isCompleted = step < currentStep;
          const isFuture = step > currentStep;
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-200
                  ${isCurrent ? "bg-blue-500 text-white ring-4 ring-blue-500/30" : ""}
                  ${isCompleted ? "bg-green-500 text-white" : ""}
                  ${isFuture ? "bg-gray-600 text-gray-400" : ""}
                `}
              >
                {isCompleted ? (
                  <span className="text-lg">✓</span>
                ) : (
                  step
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isCurrent ? "text-blue-400" : isCompleted ? "text-green-400" : "text-gray-500"
                }`}
              >
                {step === 1 ? "Account" : step === 2 ? "Profile" : "Preferences"}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div className="mt-6 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

// --- Reusable input wrapper: gray / blue focus / red error / green valid ---
function FieldWrapper({
  label,
  error,
  touched,
  valid,
  children,
  id,
}: {
  label: string;
  error?: string;
  touched?: boolean;
  valid?: boolean;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        {children}
        {touched && valid && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">
            ✓
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

// --- Step 1: Account ---
function Step1Account({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<AccountFormData>;
  onNext: (data: AccountFormData) => void;
  onBack?: () => void; // Optional: no back on first step
}) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<AccountFormData>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      email: defaultValues.email ?? "",
      password: defaultValues.password ?? "",
      confirmPassword: defaultValues.confirmPassword ?? "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: AccountFormData) => onNext(data);

  const handleNext = async () => {
    const valid = await trigger();
    if (valid) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <FieldWrapper
        id="email"
        label="Email"
        error={errors.email?.message}
        touched={!!touchedFields.email}
        valid={!errors.email && !!touchedFields.email}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border ${errors.email ? "border-red-500" : touchedFields.email && !errors.email ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="you@example.com"
          {...register("email")}
        />
      </FieldWrapper>
      <FieldWrapper
        id="password"
        label="Password"
        error={errors.password?.message}
        touched={!!touchedFields.password}
        valid={!errors.password && !!touchedFields.password}
      >
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border ${errors.password ? "border-red-500" : touchedFields.password && !errors.password ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="Min 8 chars, 1 number, 1 uppercase"
          {...register("password")}
        />
      </FieldWrapper>
      <FieldWrapper
        id="confirmPassword"
        label="Confirm password"
        error={errors.confirmPassword?.message}
        touched={!!touchedFields.confirmPassword}
        valid={!errors.confirmPassword && !!touchedFields.confirmPassword}
      >
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border pr-10 ${errors.confirmPassword ? "border-red-500" : touchedFields.confirmPassword && !errors.confirmPassword ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="Repeat password"
          {...register("confirmPassword")}
        />
      </FieldWrapper>
      <div className="flex gap-3 pt-4">
        {onBack != null && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
        >
          Next
        </button>
      </div>
    </form>
  );
}

// --- Step 2: Profile ---
function Step2Profile({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<ProfileFormData>;
  onNext: (data: ProfileFormData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName: defaultValues.fullName ?? "",
      username: defaultValues.username ?? "",
      bio: defaultValues.bio ?? "",
      avatarUrl: defaultValues.avatarUrl ?? "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: ProfileFormData) => onNext(data);

  const handleNext = async () => {
    const valid = await trigger();
    if (valid) handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <FieldWrapper
        id="fullName"
        label="Full name"
        error={errors.fullName?.message}
        touched={!!touchedFields.fullName}
        valid={!errors.fullName && !!touchedFields.fullName}
      >
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border pr-10 ${errors.fullName ? "border-red-500" : touchedFields.fullName && !errors.fullName ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="Jane Doe"
          {...register("fullName")}
        />
      </FieldWrapper>
      <FieldWrapper
        id="username"
        label="Username"
        error={errors.username?.message}
        touched={!!touchedFields.username}
        valid={!errors.username && !!touchedFields.username}
      >
        <input
          id="username"
          type="text"
          autoComplete="username"
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border pr-10 ${errors.username ? "border-red-500" : touchedFields.username && !errors.username ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="jane_doe"
          {...register("username")}
        />
      </FieldWrapper>
      <FieldWrapper
        id="bio"
        label="Bio (optional)"
        error={errors.bio?.message}
        touched={!!touchedFields.bio}
        valid={!errors.bio && !!touchedFields.bio}
      >
        <textarea
          id="bio"
          rows={3}
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border pr-10 resize-none ${errors.bio ? "border-red-500" : touchedFields.bio && !errors.bio ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="A short bio (max 160 chars)"
          {...register("bio")}
        />
      </FieldWrapper>
      <FieldWrapper
        id="avatarUrl"
        label="Avatar URL (optional)"
        error={errors.avatarUrl?.message}
        touched={!!touchedFields.avatarUrl}
        valid={!errors.avatarUrl && !!touchedFields.avatarUrl}
      >
        <input
          id="avatarUrl"
          type="url"
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border pr-10 ${errors.avatarUrl ? "border-red-500" : touchedFields.avatarUrl && !errors.avatarUrl ? "border-green-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          placeholder="https://..."
          {...register("avatarUrl")}
        />
      </FieldWrapper>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
        >
          Next
        </button>
      </div>
    </form>
  );
}

// --- Step 3: Preferences ---
function Step3Preferences({
  defaultValues,
  onSubmitForm,
  onBack,
}: {
  defaultValues: Partial<PreferencesFormData>;
  onSubmitForm: (data: PreferencesFormData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      role: defaultValues.role ?? "developer",
      experience: defaultValues.experience ?? "mid",
      newsletter: defaultValues.newsletter ?? false,
      terms: defaultValues.terms ?? false,
    },
    mode: "onTouched",
  });

  const handleSubmitClick = async () => {
    const valid = await trigger();
    if (valid) handleSubmit(onSubmitForm)();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
        <select
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border ${errors.role ? "border-red-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          {...register("role")}
        >
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="manager">Manager</option>
          <option value="other">Other</option>
        </select>
        {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Experience</label>
        <select
          className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border ${errors.experience ? "border-red-500" : "border-gray-600"} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
          {...register("experience")}
        >
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
        {errors.experience && <p className="mt-1 text-sm text-red-400">{errors.experience.message}</p>}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input
          id="newsletter"
          type="checkbox"
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500/30"
          {...register("newsletter")}
        />
        <label htmlFor="newsletter" className="text-sm text-gray-300">
          Subscribe to newsletter
        </label>
      </div>
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500/30"
            {...register("terms")}
          />
          <label htmlFor="terms" className="text-sm text-gray-300">
            I accept the terms and conditions
          </label>
        </div>
        {errors.terms && <p className="mt-1 text-sm text-red-400">{errors.terms.message}</p>}
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmitClick}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

// --- Success screen ---
function SuccessScreen({
  data,
  onStartOver,
}: {
  data: CombinedFormData;
  onStartOver: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">
        Welcome aboard, {data.fullName}! 🎉
      </h2>
      <p className="text-gray-400 mb-6">Your account has been created.</p>
      <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 text-left max-w-md mx-auto mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Summary
        </h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-white">{data.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Username</dt>
            <dd className="text-white">{data.username}</dd>
          </div>
          {data.bio && (
            <div>
              <dt className="text-gray-500">Bio</dt>
              <dd className="text-white">{data.bio}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="text-white capitalize">{data.role}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Experience</dt>
            <dd className="text-white capitalize">{data.experience}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Newsletter</dt>
            <dd className="text-white">{data.newsletter ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        onClick={onStartOver}
        className="px-6 py-2.5 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 border border-gray-600 transition-colors"
      >
        Start Over
      </button>
    </div>
  );
}

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<Partial<CombinedFormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Next = (data: AccountFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: ProfileFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: PreferencesFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setFormData({});
    setIsSubmitted(false);
  };

  if (isSubmitted && formData && "fullName" in formData && "email" in formData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <SuccessScreen
          data={formData as CombinedFormData}
          onStartOver={handleStartOver}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-white text-center mb-2">
          Sign up
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Step {currentStep} of 3
        </p>
        <StepIndicator
          currentStep={currentStep}
          progressPercent={isSubmitting ? 100 : (currentStep / 3) * 100}
        />
        {isSubmitting ? (
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Creating your account...</p>
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <Step1Account
                defaultValues={formData}
                onNext={handleStep1Next}
              />
            )}
            {currentStep === 2 && (
              <Step2Profile
                defaultValues={formData}
                onNext={handleStep2Next}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <Step3Preferences
                defaultValues={formData}
                onSubmitForm={handleStep3Submit}
                onBack={() => setCurrentStep(2)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
