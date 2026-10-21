import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { campusOptions } from "@/lib/use-campus";
import {
  loadAllComplaints,
  loadAssessments,
  loadDrives,
  loadLms,
  loadMockInterviews,
  loadMyComplaints,
  loadMyRatings,
  loadNotifications,
  loadOpportunities,
} from "@/lib/platform.functions";

// One place for the keys, so every save can refresh exactly what it changed.
export const KEYS = {
  notifications: ["notifications"],
  lms: ["lms"],
  drives: ["drives"],
  opportunities: ["opportunities"],
  complaints: ["complaints"],
  ratings: ["ratings"],
  assessments: ["assessments"],
  mocks: ["mock-interviews"],
};

export const useNotifications = () =>
  useQuery({
    queryKey: KEYS.notifications,
    queryFn: () => loadNotifications(),
    refetchInterval: 60_000,
    staleTime: 20_000,
  });
export const useLms = () => useQuery({ queryKey: KEYS.lms, queryFn: () => loadLms() });
export const useDrives = () => useQuery({ queryKey: KEYS.drives, queryFn: () => loadDrives() });
export const useOpportunities = () =>
  useQuery({ queryKey: KEYS.opportunities, queryFn: () => loadOpportunities() });
export const useMyComplaints = () =>
  useQuery({ queryKey: [...KEYS.complaints, "mine"], queryFn: () => loadMyComplaints() });
export const useAllComplaints = (enabled = true) =>
  useQuery({ queryKey: [...KEYS.complaints, "all"], queryFn: () => loadAllComplaints(), enabled });
export const useMyRatings = (enabled = true) =>
  useQuery({ queryKey: KEYS.ratings, queryFn: () => loadMyRatings(), enabled });
export const useAssessments = (studentId) =>
  useQuery({
    queryKey: [...KEYS.assessments, studentId ?? "me"],
    queryFn: () => loadAssessments({ data: studentId ? { studentId } : {} }),
  });
export const useMockInterviews = (studentId) =>
  useQuery({
    queryKey: [...KEYS.mocks, studentId ?? "me"],
    queryFn: () => loadMockInterviews({ data: studentId ? { studentId } : {} }),
  });

/** After a save, reload the campus data (scores change) and everything that may have moved. */
export function useRefreshAll() {
  const qc = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: campusOptions.queryKey }),
      ...Object.values(KEYS).map((queryKey) => qc.invalidateQueries({ queryKey })),
    ]);
  }, [qc]);
}
