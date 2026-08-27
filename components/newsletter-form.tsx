"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("Joining…");
    const response = await fetch("/api/newsletter", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({ email:form.get("email") }) });
    setStatus(response.ok ? "You’re on the list." : "Please check your email.");
    if (response.ok) event.currentTarget.reset();
  }
  return <form className="newsletter-form" onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" required maxLength={120} placeholder="Email address"/><button className="button button-primary" type="submit">Join</button><span className="newsletter-message" role="status">{status}</span></form>;
}
