"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Users,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";
import type { UserRole } from "@/types/database";

interface AuthDialogProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function AuthDialog({ children, onOpenChange }: AuthDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "" as UserRole | "",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      setError("");
      setSignInData({ email: "", password: "" });
      setSignUpData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: "",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!signInData.email || !signInData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      await signInWithEmail(signInData.email, signInData.password);
      handleOpenChange(false);
      router.push("/dashboard");
      // Keep loading state active until navigation completes
  
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.message.includes("invalid-credential")) {
        setError("Invalid email or password");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !signUpData.firstName ||
        !signUpData.lastName ||
        !signUpData.email ||
        !signUpData.password ||
        !signUpData.confirmPassword ||
        !signUpData.role
      ) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (signUpData.password !== signUpData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (signUpData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      console.log("🔐 AuthDialog - Signing up with role:", signUpData.role);
      
      await signUpWithEmail(signUpData.email, signUpData.password, {
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        role: signUpData.role as UserRole,
        phoneNumber: signUpData.phoneNumber,
      });

      console.log("✅ AuthDialog - Signup successful, redirecting to onboarding");
      handleOpenChange(false);
      setTimeout(() => {
        router.push("/onboarding");
      }, 500);
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.message.includes("email-already-in-use")) {
        setError("An account with this email already exists");
      } else {
        setError("Failed to create account. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="max-h-[85vh] overflow-y-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10 bg-white dark:bg-gray-950">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Welcome back</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signInData.email}
                    onChange={(e) =>
                      setSignInData({ ...signInData, email: e.target.value })
                    }
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) =>
                      setSignInData({ ...signInData, password: e.target.value })
                    }
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Create account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get started with your account
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection - Show First */}
            {!signUpData.role ? (
              <div className="space-y-3">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className="p-4 cursor-pointer transition-all border-2 border-gray-200 hover:border-teal-300"
                    onClick={() =>
                      setSignUpData({ ...signUpData, role: "client" })
                    }
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Client</p>
                        <p className="text-xs text-gray-500">
                          Looking for therapy
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-4 cursor-pointer transition-all border-2 border-gray-200 hover:border-blue-300"
                    onClick={() =>
                      setSignUpData({ ...signUpData, role: "therapist" })
                    }
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Therapist</p>
                        <p className="text-xs text-gray-500">
                          Providing therapy
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Show selected role with option to change */}
                <div className={`p-3 rounded-lg border-2 ${
                  signUpData.role === 'client'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        signUpData.role === 'client' ? 'bg-teal-500' : 'bg-blue-500'
                      }`}>
                        {signUpData.role === 'client' ? (
                          <Users className="h-5 w-5 text-white" />
                        ) : (
                          <Stethoscope className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${
                          signUpData.role === 'client' ? 'text-teal-700 dark:text-teal-300' : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          {signUpData.role === 'client' ? 'Client' : 'Therapist'} Account
                        </p>
                        <p className={`text-xs ${
                          signUpData.role === 'client' ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {signUpData.role === 'client' ? 'Looking for therapy' : 'Providing therapy'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSignUpData({ ...signUpData, role: "" })}
                      className="text-xs"
                    >
                      Change
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={signUpData.firstName}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          firstName: e.target.value,
                        })
                      }
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={signUpData.lastName}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          lastName: e.target.value,
                        })
                      }
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, email: e.target.value })
                    }
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={signUpData.phoneNumber}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, password: e.target.value })
                    }
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

                <Button 
                  type="submit" 
                  className={`w-full ${
                    signUpData.role === 'client'
                      ? 'bg-teal-500 hover:bg-teal-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
