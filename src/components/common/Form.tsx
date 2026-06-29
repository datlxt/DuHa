import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm outline-none focus:border-burgundy" />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm outline-none focus:border-burgundy" />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm outline-none focus:border-burgundy" />;
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white transition hover:bg-cherry disabled:opacity-60 ${props.className ?? ""}`} />;
}
