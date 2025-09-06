import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL, API_ENDPOINTS } from "@/constants/api";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleRequestOTP = async (data: EmailFormData) => {
    setLoading(true);
    setEmail(data.email);

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.requestOtp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const responseData = await response.json();
      
      toast({
        title: "OTP Sent Successfully",
        description: responseData.message || "OTP has been sent to your email",
      });
      
      setOtpSent(true);
    } catch (error) {
      console.error("OTP request error:", error);
      toast({
        title: "OTP Request Failed",
        description: "Failed to send OTP. Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (data: OtpFormData) => {
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("username", email);
      formData.append("password", data.otp);
      formData.append("scope", "");
      formData.append("client_id", "string");
      formData.append("client_secret", "string");

      const response = await fetch(`${API_URL}${API_ENDPOINTS.signin}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OTP");
        } else {
          throw new Error("Server connection failed");
        }
      }

      const responseData = await response.json();
      console.log("Sign in response data:", responseData);
      
      toast({
        title: "Login Successful",
        description: "Welcome! Redirecting to your messenger...",
      });
      
      // Use the login function from AuthContext with callback to ensure redirect happens after state update
      login(responseData, () => {
        setLocation("/");
      });
      
    } catch (error) {
      console.error("Sign in error:", error);
      if (error instanceof Error && error.message === "Invalid OTP") {
        toast({
          title: "Sign In Failed",
          description: "Invalid OTP. Please try again or request a new OTP.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: "Unable to connect. Please contact the Disa Team.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setOtpSent(false);
    setEmail("");
    emailForm.reset();
    otpForm.reset();
  };

  const openDisaLink = () => {
    window.open("https://dizio.in/disa", "_blank");
  };

  const isEmailValid = emailForm.watch("email")?.trim() !== "" && emailForm.watch("email")?.includes("@");
  const isOTPValid = otpForm.watch("otp")?.trim() !== "" && otpForm.watch("otp")?.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-22 h-18  flex justify-center">
           
            <img
              src="https://raw.githubusercontent.com/dizio-in/cdn/refs/heads/main/images/disa_logo.png"
              alt="Disa logo"
              
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {otpSent ? "Enter OTP" : "Sign In with Disa"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {otpSent
                ? "Enter the OTP sent to your email"
                : "Please enter your email to receive OTP"}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!otpSent ? (
            <form onSubmit={emailForm.handleSubmit(handleRequestOTP)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12"
                    data-testid="input-email"
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={loading || !isEmailValid}
                data-testid="button-request-otp"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Request OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-display">Email</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={email}
                  className="bg-gray-50 text-gray-600 h-12"
                  disabled
                  data-testid="input-email-display"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="text-center text-lg tracking-wider h-12"
                  data-testid="input-otp"
                  {...otpForm.register("otp")}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={loading || !isOTPValid}
                data-testid="button-sign-in"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={handleUseDifferentEmail}
                className="w-full text-blue-600 hover:text-blue-700"
                data-testid="button-different-email"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Use different email?
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-gray-600">
            Learn how{" "}
            <button
              onClick={openDisaLink}
              className="text-blue-600 hover:text-blue-700 underline"
              data-testid="link-disa-works"
            >
              Disa works
            </button>
            .
          </div>

       
        </CardContent>
      </Card>
    </div>
  );
}