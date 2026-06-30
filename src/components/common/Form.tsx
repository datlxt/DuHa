import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm outline-none focus:border-burgundy", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm outline-none focus:border-burgundy", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm outline-none focus:border-burgundy", props.className)} />;
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={cn("rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white transition hover:bg-cherry disabled:opacity-60", props.className)} />;
}
