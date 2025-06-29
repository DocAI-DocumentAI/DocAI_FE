"use client";

import type React from "react";

import { useState, useRef } from "react";
import { AuthContainer } from "../../components/auth-container";
import { Link } from "react-router-dom";

export default function AuthCode() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if current one is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <AuthContainer>
      <h2 className="mb-2 text-2xl font-bold">Enter authentication code</h2>
      <p className="mb-6 text-gray-600">
        We&apos;ve sent an email to becc@gmail.com, please enter the code below.
      </p>
      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="block font-medium">
            Enter code
          </label>
          <div className="flex justify-between gap-2">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="text-xl text-center border border-gray-300 rounded-md h-14 w-14"
                />
              ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900"
        >
          Continue
        </button>
      </form>
      <p className="mt-6 text-sm text-center">
        Don&apos;t see your email?{" "}
        <Link to="#" className="text-blue-600 hover:underline">
          Resend
        </Link>
      </p>
    </AuthContainer>
  );
}
