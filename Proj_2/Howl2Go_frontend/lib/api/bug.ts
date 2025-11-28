import { apiFetch } from "../api";

export interface BugReport {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  severity: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
}

export interface Bug {
  _id: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo?: string;
  reportedBy?: string;
  reportedByEmail?: string;
  reportedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugReportsResponse {
  success: boolean;
  data: {
    bugs: Bug[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export async function submitBugReport(bugData: BugReport) {
  try {
    const response = await apiFetch("/api/bugs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(bugData),
    });

    if (!response.ok) {
      let errorMessage = `Failed to submit bug report: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to submit bug report");
    }

    return data.data;
  } catch (error) {
    console.error("Error submitting bug report:", error);
    throw error;
  }
}

export async function getBugReports(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    assignedTo?: string;
    severity?: string;
  }
): Promise<BugReportsResponse['data']> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.severity) params.append('severity', filters.severity);

    const response = await apiFetch(`/api/bugs?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch bug reports: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data: BugReportsResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch bug reports");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching bug reports:", error);
    throw error;
  }
}
