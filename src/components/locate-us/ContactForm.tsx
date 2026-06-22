"use client";

import { useState, FormEvent } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-dark">Message Sent!</h3>
        <p className="mt-2 text-muted">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <div className="w-full">
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-dark"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="How can we help you?"
          value={formData.message}
          onChange={handleChange}
          required
          className="flex w-full rounded-lg border border-border bg-warm-white px-3 py-2.5 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 resize-y min-h-[120px] transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-accent font-medium" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
