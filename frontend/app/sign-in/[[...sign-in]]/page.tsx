import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-gray-300",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold",
              formFieldInput: "bg-white/5 border border-white/20 text-white placeholder:text-gray-400",
              formFieldLabel: "text-white",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              dividerLine: "bg-white/20",
              dividerText: "text-gray-300",
              socialButtonsBlockButton: "bg-white/5 border border-white/20 text-white hover:bg-white/10",
              formFieldLabelRow: "text-white",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
              formResendCodeLink: "text-purple-400 hover:text-purple-300",
              formFieldAction: "text-purple-400 hover:text-purple-300",
              footerAction: "text-gray-300",
              footerActionText: "text-gray-300",
              formFieldErrorText: "text-red-400",
              alertText: "text-white",
              alert: "bg-red-900/20 border border-red-500/30",
              alertIcon: "text-red-400",
            }
          }}
        />
      </div>
    </div>
  )
} 