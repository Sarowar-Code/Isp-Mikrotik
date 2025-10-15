"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Edit,
  Eye,
  Filter,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Mock data for notices
const mockNotices = [
  {
    id: "1",
    title: "Scheduled Maintenance Notice",
    description:
      "We will be performing scheduled maintenance on our network infrastructure on Sunday, October 20th, 2024, from 2:00 AM to 6:00 AM. During this time, you may experience temporary service interruptions. We apologize for any inconvenience and appreciate your patience.",
    noticeFor: "global",
    createdBy: "Super Admin",
    createdAt: "2024-10-15T10:30:00Z",
    updatedAt: "2024-10-15T10:30:00Z",
  },
  {
    id: "2",
    title: "New Pricing Plans Available",
    description:
      "We are excited to announce new competitive pricing plans for our internet services. Check out our updated packages with better speeds and value for money. Contact your admin for more details.",
    noticeFor: "Reseller",
    createdBy: "Super Admin",
    createdAt: "2024-10-14T14:20:00Z",
    updatedAt: "2024-10-14T14:20:00Z",
  },
  {
    id: "3",
    title: "Admin Portal Update",
    description:
      "The admin portal has been updated with new features including enhanced reporting, better user management, and improved dashboard analytics. Please log out and log back in to see the changes.",
    noticeFor: "Admin",
    createdBy: "Super Admin",
    createdAt: "2024-10-13T09:15:00Z",
    updatedAt: "2024-10-13T09:15:00Z",
  },
  {
    id: "4",
    title: "Payment Gateway Maintenance",
    description:
      "Our payment gateway will undergo maintenance on October 18th from 12:00 AM to 4:00 AM. Online payments will be temporarily unavailable during this period. Please plan accordingly.",
    noticeFor: "global",
    createdBy: "Super Admin",
    createdAt: "2024-10-12T16:45:00Z",
    updatedAt: "2024-10-12T16:45:00Z",
  },
  {
    id: "5",
    title: "New Reseller Commission Structure",
    description:
      "We are implementing a new commission structure for resellers starting November 1st, 2024. The new structure offers better incentives and bonuses. Detailed information has been sent to your registered email.",
    noticeFor: "Reseller",
    createdBy: "Super Admin",
    createdAt: "2024-10-11T11:30:00Z",
    updatedAt: "2024-10-11T11:30:00Z",
  },
];

export default function NoticeListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");

  // Filter and search logic
  const filteredNotices = useMemo(() => {
    return mockNotices.filter((notice) => {
      const matchesSearch =
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAudience =
        audienceFilter === "all" || notice.noticeFor === audienceFilter;

      return matchesSearch && matchesAudience;
    });
  }, [searchTerm, audienceFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = mockNotices.length;
    const global = mockNotices.filter(
      (notice) => notice.noticeFor === "global"
    ).length;
    const admin = mockNotices.filter(
      (notice) => notice.noticeFor === "Admin"
    ).length;
    const reseller = mockNotices.filter(
      (notice) => notice.noticeFor === "Reseller"
    ).length;

    return { total, global, admin, reseller };
  }, []);

  const getAudienceBadge = (noticeFor: string) => {
    switch (noticeFor) {
      case "global":
        return (
          <Badge variant="default" className="bg-blue-500">
            <Globe className="w-3 h-3 mr-1" />
            Global
          </Badge>
        );
      case "Admin":
        return (
          <Badge variant="default" className="bg-green-500">
            <Users className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "Reseller":
        return (
          <Badge variant="default" className="bg-purple-500">
            <UserCheck className="w-3 h-3 mr-1" />
            Reseller
          </Badge>
        );
      default:
        return <Badge variant="secondary">{noticeFor}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getNoticeHeadline = (description: string) => {
    // Get first sentence or first 60 characters, whichever is shorter
    const firstSentence = description.split(".")[0];
    const maxLength = 60;

    if (firstSentence.length <= maxLength) {
      return firstSentence + (description.includes(".") ? "." : "");
    }
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notice Management</CardTitle>
            </div>
            <Button onClick={() => router.push("/superadmin/notices/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Notice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Audience:{" "}
                    {audienceFilter === "all" ? "All" : audienceFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Audience</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAudienceFilter("all")}>
                    All Audiences
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAudienceFilter("global")}>
                    Global
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAudienceFilter("Admin")}>
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setAudienceFilter("Reseller")}
                  >
                    Reseller
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No notices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>
                        <div className="font-medium">{notice.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getNoticeHeadline(notice.description)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAudienceBadge(notice.noticeFor)}
                      </TableCell>
                      <TableCell>{notice.createdBy}</TableCell>
                      <TableCell>{formatDate(notice.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/superadmin/notices/${notice.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/superadmin/notices/edit/${notice.id}`
                                )
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Notice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Notice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredNotices.length} of {mockNotices.length} notice(s)
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
