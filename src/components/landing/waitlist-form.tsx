"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track-event";

interface WaitlistFormProps {
  /** Where the form is mounted — included in the analytics + waitlist record. */
  source?: string;
  /** Optional class to override the wrapper layout. */
  className?: string;
}

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; alreadyOnList: boolean; position: number }
  | { status: "error"; message: string };

interface WaitlistResponse {
  ok: boolean;
  alreadyOnList: boolean;
  position: number;
}

interface WaitlistError {
  error?: string;
  details?: string;
}

export function WaitlistForm({
  source = "landing",
  className = "",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "submitting") return;

    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as WaitlistError;
        const message =
          data.error ?? (response.status === 429
            ? "Slow down a moment and try again."
            : "Something went wrong. Try again.");
        setState({ status: "error", message });
        return;
      }

      const data = (await response.json()) as WaitlistResponse;
      if (!data.alreadyOnList) {
        trackEvent({
          name: "waitlist_join",
          payload: { source, position: data.position },
        });
      }
      setState({
        status: "success",
        alreadyOnList: data.alreadyOnList,
        position: data.position,
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div
        className={`flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left ${className}`}
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {state.alreadyOnList ? "You're already on the list." : "You're in."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re #{state.position} in the queue. We&apos;ll email{" "}
            <span className="font-mono text-foreground">{email}</span> the
            moment your invite is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`w-full ${className}`} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@work.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state.status === "error") setState({ status: "idle" });
          }}
          disabled={state.status === "submitting"}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.status === "submitting" || email.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {state.status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs text-rose-500"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          {state.message}
        </p>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        We&apos;ll only email you about your invite. No newsletter, no
        marketing list.
      </p>
    </form>
  );
}
