"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  editingUser?: UserFormData & { id: string };
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: "Recruiter" | "Client" | "Admin";
  status: "active" | "disabled";
  password: string;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
}: UserFormModalProps) {
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "Recruiter",
    status: "active",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 当editingUser变化或弹窗打开时，更新表单数据
  useEffect(() => {
    if (editingUser) {
      setForm(editingUser);
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "Recruiter",
        status: "active",
        password: "",
      });
    }
    setShowPassword(false);
    setErrors({});
  }, [editingUser, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Account name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!editingUser && !form.password.trim())
      newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(form);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Recruiter",
      status: "active",
      password: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Recruiter",
      status: "active",
      password: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 cursor-pointer hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Name */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
              Account name
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter account name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
              Role
              <span className="text-red-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as "Recruiter" | "Client" | "Admin",
                })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            >
              <option value="Recruiter">Recruiter</option>
              <option value="Client">Client</option>
              <option value="Admin">Admin</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Choose from 3 roles: Recruiter, Client, Admin
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
              Email
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 text-sm font-medium text-slate-700">
              Phone
              <span className="ml-1 text-slate-500">(Optional)</span>
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          {/* Status Toggle */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    status: form.status === "active" ? "disabled" : "active",
                  })
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  form.status === "active"
                    ? "bg-blue-500"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    form.status === "active" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-slate-600">
                Only 2 states: <span className="font-medium">active</span> and{" "}
                <span className="font-medium">disable</span>
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
              Password
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm outline-none transition ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-blue-600"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition cursor-pointer hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
