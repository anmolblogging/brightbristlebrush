"use client";

import { useState } from "react";
import { EMAIL } from "@/lib/site";

const input = "w-full border bg-background px-4 py-3 text-base outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand";
const label = "mb-2 block text-xs font-semibold tracking-wider uppercase";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

// Posts the enquiry to /api/contact/, which emails it to the sales inbox.
export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      form.reset();
      setStatus({ state: "sent" });
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  };

  const sending = status.state === "sending";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label htmlFor="name" className={label}>Full Name</label><input id="name" name="name" required maxLength={120} autoComplete="name" className={input} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="company" className={label}>Company</label><input id="company" name="company" maxLength={160} autoComplete="organization" className={input} /></div>
        <div><label htmlFor="phone" className={label}>Phone</label><input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={input} /></div>
      </div>
      <div><label htmlFor="email" className={label}>Email Address</label><input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={input} /></div>
      <div><label htmlFor="message" className={label}>Message</label><textarea id="message" name="message" rows={4} required maxLength={5000} className={`${input} resize-none`} /></div>
      {/* Spam trap: hidden from people, filled in by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" disabled={sending} className="group relative inline-flex w-full items-center justify-center overflow-hidden bg-brand py-3.5 text-sm font-semibold text-brand-foreground disabled:cursor-wait disabled:opacity-70">
        <span className="absolute inset-0 origin-left scale-x-0 bg-bronze transition-transform duration-500 ease-out group-hover:scale-x-100" /><span className="relative">{sending ? "Sending…" : "Send Enquiry"}</span>
      </button>
      <p className={`text-sm ${status.state === "error" ? "text-red-700" : status.state === "sent" ? "text-green-800" : "text-muted-foreground"}`} aria-live="polite">
        {status.state === "sent" && "Thank you! Your enquiry has been sent. We'll get back to you shortly."}
        {status.state === "error" && <>{status.message} Please try again, or write to <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>.</>}
        {status.state === "sending" && "Sending your enquiry…"}
        {status.state === "idle" && "We usually reply within one working day."}
      </p>
    </form>
  );
}
