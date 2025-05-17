"use client"

import type React from "react"

import { useState, useRef } from "react" 
import { AuthContainer } from "../../components/auth-container"
import { Link } from "react-router-dom"
import LayoutAuth from "../../components/layout/layoutAuth"

export default function VerifyEmail() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Move to next input if current one is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
   <LayoutAuth>
     <AuthContainer>
       <h2 className="mb-2 text-2xl font-bold">Please verify your email address</h2>
       <p className="mb-6 text-gray-600">We&apos;ve sent an email to becca@gmail.com, please enter the code below.</p>
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
                   ref={(el) => { inputRefs.current[index] = el }}
                   type="text"
                   maxLength={1}
                   value={code[index]}
                   onChange={(e) => handleChange(index, e.target.value)}
                   onKeyDown={(e) => handleKeyDown(index, e)}
                   className="h-14 w-14 rounded-md border border-gray-300 text-center text-xl"
                 />
               ))}
           </div>
         </div>
         <button type="submit" className="w-full rounded-md bg-blue-800 py-3 font-medium text-white hover:bg-blue-900">
           Verify
         </button>
       </form>
       <p className="mt-6 text-center text-sm">
         Don&apos;t see your email?{" "}
         <Link to="#" className="text-blue-600 hover:underline">
           Resend
         </Link>
       </p>
     </AuthContainer>
   </LayoutAuth>
  )
}
