"use client";

import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Co-locate the Zod schema with the form so validation rules live
// right next to the UI and stay easy to evolve over time.
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .nonempty("Name is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .nonempty("Subject is required"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(500, "Message must be at most 500 characters")
    .nonempty("Message is required"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit: SubmitHandler<ContactFormValues> = async () => {
    // Simulate a network round-trip so the user sees a realistic
    // loading state without wiring up a real backend yet.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitted(true);
  };

  const messageValue = watch("message") ?? "";
  const messageLength = messageValue.length;

  const getFieldClasses = (fieldName: keyof ContactFormValues) => {
    const hasError = Boolean(errors[fieldName]);
    const isTouched = Boolean(touchedFields[fieldName]);
    if (hasError) {
      return "border-red-500 focus-visible:ring-red-500";
    }
    if (isTouched) {
      return "border-emerald-500 focus-visible:ring-emerald-500";
    }
    return "border-slate-700 focus-visible:ring-sky-500";
  };

  const handleReset = () => {
    reset();
    setIsSubmitted(false);
  };

  return (
    <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Get in Touch 👋
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Whether you want to chat about projects, AI-assisted workflows, or
            ideas for collaborations, drop a message below and I&apos;ll get
            back to you.
          </p>
        </header>

        {isSubmitted ? (
          <div className="space-y-4 rounded-2xl border border-emerald-600/60 bg-emerald-900/20 p-6 text-sm text-emerald-100 shadow-sm shadow-emerald-900/50">
            <p className="text-base font-semibold">
              Message sent! 🎉 I&apos;ll get back to you soon.
            </p>
            <p className="text-sm text-emerald-100/90">
              In the meantime, feel free to explore more of the blog or
              projects — I appreciate you reaching out.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 ring-1 ring-slate-600 hover:bg-slate-800 sm:w-auto"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm shadow-slate-950/40"
            noValidate
          >
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-slate-200"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className={`w-full rounded-md border bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none focus-visible:ring-1 ${getFieldClasses(
                  "name",
                )}`}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`w-full rounded-md border bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none focus-visible:ring-1 ${getFieldClasses(
                  "email",
                )}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="subject"
                className="text-xs font-medium text-slate-200"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                {...register("subject")}
                className={`w-full rounded-md border bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none focus-visible:ring-1 ${getFieldClasses(
                  "subject",
                )}`}
                placeholder="What would you like to talk about?"
              />
              {errors.subject && (
                <p className="text-xs text-red-400">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-xs font-medium text-slate-200"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                {...register("message")}
                className={`w-full resize-none rounded-md border bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none focus-visible:ring-1 ${getFieldClasses(
                  "message",
                )}`}
                placeholder="Share a bit of context so I can respond thoughtfully."
              />
              <div className="flex items-center justify-between">
                {errors.message ? (
                  <p className="text-xs text-red-400">
                    {errors.message.message}
                  </p>
                ) : (
                  <span className="text-xs text-slate-400">
                    Please include enough detail for a meaningful reply.
                  </span>
                )}
                <span
                  className={`text-xs ${
                    messageLength > 500 ? "text-red-400" : "text-slate-400"
                  }`}
                >
                  {messageLength} / 500
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Sending...
                </span>
              ) : (
                "Send message"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

