import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { signInWithMicrosoft } from "@/lib/firebase";
import { useLogin } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignup = searchParams.get("mode") === "signup";

  const [isLoading, setIsLoading] = useState(false);
  const login = useLogin();

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);

    try {
      // Step 1: Sign in with Microsoft via Firebase
      const firebaseResult = await signInWithMicrosoft();

      if (!firebaseResult.success || !firebaseResult.idToken) {
        toast({
          title: "Authentication failed",
          description: firebaseResult.error || "Failed to authenticate with Microsoft",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Login to backend with Firebase token
      try {
        const loginResponse = await login.mutateAsync(firebaseResult.idToken);

        // Wait a moment for auth state to propagate
        await new Promise((resolve) => setTimeout(resolve, 500));

        toast({
          title: isSignup ? "Account created!" : "Welcome back!",
          description: isSignup
            ? `Welcome, ${loginResponse.first_name}! Your account has been created successfully.`
            : `Welcome back, ${loginResponse.first_name}!`,
        });

        // Navigate to dashboard on success
        navigate("/dashboard");
      } catch (apiError) {
        // Handle API login errors
        const errorMessage = getErrorMessage(apiError);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Handle Firebase authentication errors
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center subtle-gradient relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-orange">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSignup ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isSignup
                ? "Sign up with your Microsoft account to get started"
                : "Sign in with your Microsoft account to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Microsoft auth button */}
            <Button
              variant="outline"
              className="w-full h-12 gap-3 font-medium"
              onClick={handleMicrosoftSignIn}
              disabled={isLoading || login.isPending}
            >
              {isLoading || login.isPending ? (
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  Continue with Microsoft
                </>
              )}
            </Button>

            {/* Toggle */}
            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <Link
                to={isSignup ? "/auth" : "/auth?mode=signup"}
                className="text-primary hover:underline font-medium"
              >
                {isSignup ? "Sign in" : "Sign up"}
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by REVA University
        </p>
      </div>
    </div>
  );
}