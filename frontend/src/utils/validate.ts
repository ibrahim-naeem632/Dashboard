export interface FieldError { [key: string]: string; }

export const validators = {
  required: (v: string, label = "This field") =>
    v.trim() ? "" : `${label} is required`,

  email: (v: string) => {
    if (!v.trim()) return "Email is required";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "" : "Enter a valid email address";
  },

  minLen: (v: string, n: number, label = "This field") =>
    v.length >= n ? "" : `${label} must be at least ${n} characters`,

  maxLen: (v: string, n: number, label = "This field") =>
    v.length <= n ? "" : `${label} must be under ${n} characters`,

  positiveNum: (v: string, label = "Value") => {
    const n = Number(v);
    if (!v.trim()) return `${label} is required`;
    return n > 0 ? "" : `${label} must be greater than 0`;
  },

  nonNegativeNum: (v: string, label = "Value") => {
    const n = Number(v);
    if (v.trim() === "") return `${label} is required`;
    return n >= 0 ? "" : `${label} cannot be negative`;
  },

  phone: (v: string) => {
    if (!v.trim()) return "";           // optional
    return /^\+?[\d\s\-()]{7,20}$/.test(v)
      ? "" : "Enter a valid phone number";
  },
};

export function hasErrors(errors: FieldError): boolean {
  return Object.values(errors).some(v => v !== "");
}
