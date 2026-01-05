import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Trash2,
  Power,
  ExternalLink,
  Shield,
  Sparkles,
  LogOut,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useCurrentUser,
  useApiKeys,
  useCreateOrUpdateApiKey,
  useDeleteApiKey,
  useToggleApiKey,
} from "@/lib/api/hooks";
import { getErrorMessage, isAuthenticated } from "@/lib/api";
import { signOutUser } from "@/lib/firebase";
import type { ApiKey } from "@/lib/api/types";

const PROVIDER_CONFIG = {
  openai: {
    name: "OpenAI",
    color: "emerald",
    icon: Sparkles,
    placeholder: "sk-...",
    link: "https://platform.openai.com/api-keys",
  },
  gemini: {
    name: "Google Gemini",
    color: "blue",
    icon: Sparkles,
    placeholder: "AIza...",
    link: "https://aistudio.google.com/app/apikey",
  },
  grok: {
    name: "Grok (xAI)",
    color: "purple",
    icon: Sparkles,
    placeholder: "xai-...",
    link: "https://console.x.ai/",
  },
} as const;

type Provider = keyof typeof PROVIDER_CONFIG;

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface ApiKeyCardProps {
  provider: Provider;
  apiKey: ApiKey | undefined;
  value: string;
  show: boolean;
  onValueChange: (value: string) => void;
  onToggleShow: () => void;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}

function ApiKeyCard({
  provider,
  apiKey,
  value,
  show,
  onValueChange,
  onToggleShow,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}: ApiKeyCardProps) {
  const config = PROVIDER_CONFIG[provider];
  const Icon = config.icon;

  const colorClasses = {
    emerald: {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      iconBg: "bg-emerald-500/10 border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      link: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
    },
    blue: {
      border: "border-blue-200 dark:border-blue-800",
      bg: "bg-blue-50/50 dark:bg-blue-950/20",
      iconBg: "bg-blue-500/10 border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      link: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
    },
    purple: {
      border: "border-purple-200 dark:border-purple-800",
      bg: "bg-purple-50/50 dark:bg-purple-950/20",
      iconBg: "bg-purple-500/10 border-purple-200 dark:border-purple-800",
      icon: "text-purple-600 dark:text-purple-400",
      link: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
    },
  };

  const colors = colorClasses[config.color];

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{config.name}</h3>
                  {apiKey && (
                    <Badge
                      variant={apiKey.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {apiKey.is_active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {apiKey
                    ? `Updated ${formatDate(apiKey.updated_at)}`
                    : "Not configured"}
                </p>
              </div>
            </div>
            {apiKey && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  disabled={isToggling}
                  className="h-8 w-8"
                >
                  <Power
                    className={`w-4 h-4 ${apiKey.is_active ? colors.icon : "text-muted-foreground"
                      }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${provider}Key`} className="text-sm">
              API Key
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id={`${provider}Key`}
                type={show ? "text" : "password"}
                placeholder={
                  apiKey
                    ? "Enter new key to update"
                    : config.placeholder
                }
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={onToggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={config.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs ${colors.link} hover:underline`}
            >
              Get API key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [showKeys, setShowKeys] = useState<Record<Provider, boolean>>({
    openai: false,
    gemini: false,
    grok: false,
  });
  const [formData, setFormData] = useState({
    openai: "",
    gemini: "",
    grok: "",
  });

  const { data: user, isLoading, error } = useCurrentUser();
  const { data: apiKeys, refetch: refetchKeys } = useApiKeys();
  const createOrUpdateApiKey = useCreateOrUpdateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const toggleApiKey = useToggleApiKey();

  const apiKeyMap = useMemo(() => {
    const map = new Map<Provider, ApiKey>();
    apiKeys?.forEach((key) => {
      map.set(key.provider as Provider, key);
    });
    return map;
  }, [apiKeys]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      navigate("/auth");
    }
  }, [isLoading, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load profile",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }, [error]);

  const handleSave = async () => {
    const promises: Promise<unknown>[] = [];
    const errors: string[] = [];

    Object.entries(formData).forEach(([provider, value]) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      if (trimmed.length < 10) {
        errors.push(`${PROVIDER_CONFIG[provider as Provider].name} key is too short`);
        return;
      }

      promises.push(
        createOrUpdateApiKey.mutateAsync({
          provider: provider as Provider,
          api_key: trimmed,
        })
      );
    });

    if (errors.length > 0) {
      toast({
        title: "Validation error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (promises.length === 0) {
      toast({
        title: "No changes",
        description: "No API keys to save.",
      });
      return;
    }

    try {
      await Promise.all(promises);
      toast({
        title: "API keys saved",
        description: "Your API keys have been saved successfully.",
      });
      setFormData({ openai: "", gemini: "", grok: "" });
      await refetchKeys();
    } catch (error) {
      toast({
        title: "Failed to save",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (provider: Provider) => {
    const apiKey = apiKeyMap.get(provider);
    if (!apiKey) return;

    if (!confirm(`Delete ${PROVIDER_CONFIG[provider].name} API key?`)) {
      return;
    }

    try {
      await deleteApiKey.mutateAsync(apiKey.id);
      toast({
        title: "API key deleted",
        description: `${PROVIDER_CONFIG[provider].name} key has been deleted.`,
      });
      await refetchKeys();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (provider: Provider) => {
    const apiKey = apiKeyMap.get(provider);
    if (!apiKey) return;

    try {
      await toggleApiKey.mutateAsync(apiKey.id);
      await refetchKeys();
    } catch (error) {
      toast({
        title: "Toggle failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" description="Loading profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout title="Profile" description="Error loading profile">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error ? getErrorMessage(error) : "User not found"}
              </p>
              <Button onClick={() => navigate("/auth")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" description="Manage your account and API keys">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(user.first_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user.first_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.username && (
                  <p className="text-xs text-muted-foreground mt-1">@{user.username}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={user.first_name || ""}
                    readOnly
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    readOnly
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Configure AI provider API keys. Keys are encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(PROVIDER_CONFIG) as Provider[]).map((provider) => (
              <ApiKeyCard
                key={provider}
                provider={provider}
                apiKey={apiKeyMap.get(provider)}
                value={formData[provider]}
                show={showKeys[provider]}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, [provider]: value }))
                }
                onToggleShow={() =>
                  setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
                }
                onToggle={() => handleToggle(provider)}
                onDelete={() => handleDelete(provider)}
                isToggling={toggleApiKey.isPending}
                isDeleting={deleteApiKey.isPending}
              />
            ))}

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">Security</p>
                <p className="text-xs text-muted-foreground">
                  API keys are encrypted and stored securely. Only active keys are used by the system.
                  Each provider uses its own key independently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={handleSignOut} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={createOrUpdateApiKey.isPending}
            className="min-w-[140px]"
          >
            {createOrUpdateApiKey.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
