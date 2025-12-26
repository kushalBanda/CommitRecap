"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllRecapData } from "@/lib/api";
import { useRecapStore } from "@/stores/recap-store";
import { useEffect } from "react";

export function useGitHubData(username: string) {
  const { setRecapData, setLoading, setError } = useRecapStore();

  const query = useQuery({
    queryKey: ["recapData", username],
    queryFn: () => fetchAllRecapData(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : "An error occurred");
    } else {
      setError(null);
    }
  }, [query.error, setError]);

  useEffect(() => {
    if (query.data) {
      setRecapData(username, query.data);
    }
  }, [query.data, username, setRecapData]);

  return query;
}
