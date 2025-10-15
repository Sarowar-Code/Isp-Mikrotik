"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Globe,
  Plus,
  Users,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NoticeData {
  title: string;
  description: string;
  noticeFor: "Admin" | "Reseller" | "global";
}

export default function CreateNoticePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NoticeData>({
    title: "",
    description: "",
    noticeFor: "global",
  });

  const handleInputChange = (field: keyof NoticeData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Here you would call your API to create the notice
      console.log("Creating notice:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Notice created successfully!");
      router.push("/superadmin/notices/noticelist");
    } catch (error) {
      console.error("Failed to create notice:", error);
      alert("Failed to create notice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getNoticeForIcon = (noticeFor: string) => {
    switch (noticeFor) {
      case "Admin":
        return <Users className="h-4 w-4" />;
      case "Reseller":
        return <UserCheck className="h-4 w-4" />;
      case "global":
        return <Globe className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNoticeForDescription = (noticeFor: string) => {
    switch (noticeFor) {
      case "Admin":
        return "This notice will be visible to all Admins (Bandwidth Sellers)";
      case "Reseller":
        return "This notice will be visible to all Resellers";
      case "global":
        return "This notice will be visible to all users (Admins, Resellers, and Clients)";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notice Information
            </CardTitle>
            <CardDescription>
              Create a new notice for your ISP platform users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Scheduled Maintenance Notice"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Notice Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the notice..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Provide clear and detailed information about the notice
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </CardTitle>
            <CardDescription>
              Select who should see this notice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noticeFor">Notice For *</Label>
                <Select
                  value={formData.noticeFor}
                  onValueChange={(value) =>
                    handleInputChange("noticeFor", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Global (All Users)
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Admins Only
                      </div>
                    </SelectItem>
                    <SelectItem value="Reseller">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Resellers Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notice For Preview */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {getNoticeForIcon(formData.noticeFor)}
                  <span className="font-medium">
                    {formData.noticeFor === "global" 
                      ? "Global Notice" 
                      : `${formData.noticeFor} Notice`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getNoticeForDescription(formData.noticeFor)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notice Preview */}
        {(formData.title || formData.description) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notice Preview
              </CardTitle>
              <CardDescription>
                Preview how the notice will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">
                      {formData.title || "Notice Title"}
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {formData.description || "Notice description will appear here..."}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-blue-600">
                      {getNoticeForIcon(formData.noticeFor)}
                      <span>
                        For: {formData.noticeFor === "global" ? "All Users" : formData.noticeFor}
                      </span>
                      <span>•</span>
                      <span>Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/superadmin/notices/noticelist")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[150px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Notice...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Notice
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
