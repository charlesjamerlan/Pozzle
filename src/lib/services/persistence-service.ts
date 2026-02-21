/**
 * Persistence layer for saving/loading extractions via Supabase.
 * All functions are no-ops if Supabase is not configured.
 */

import { config } from "@/lib/config";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

export interface SavedExtraction {
  id: string;
  user_id: string;
  url: string;
  result: ExtractionResult;
  report: ConsistencyReport;
  created_at: string;
}

/** Save an extraction result for a user. Returns the saved row id or null. */
export async function saveExtraction(
  userId: string,
  url: string,
  result: ExtractionResult,
  report: ConsistencyReport,
): Promise<string | null> {
  if (!config.supabase.enabled) return null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("extractions")
      .insert({
        user_id: userId,
        url,
        result: result as unknown as Record<string, unknown>,
        report: report as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Persistence] Save failed:", error.message);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error("[Persistence] Save error:", err);
    return null;
  }
}

/** Get all extractions for a user, most recent first. */
export async function getUserExtractions(
  userId: string,
): Promise<SavedExtraction[]> {
  if (!config.supabase.enabled) return [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("extractions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Persistence] List failed:", error.message);
      return [];
    }

    return (data ?? []) as unknown as SavedExtraction[];
  } catch (err) {
    console.error("[Persistence] List error:", err);
    return [];
  }
}

/** Get a single extraction by id (respects RLS — user must own it). */
export async function getExtractionById(
  id: string,
): Promise<SavedExtraction | null> {
  if (!config.supabase.enabled) return null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("extractions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[Persistence] Get failed:", error.message);
      return null;
    }

    return data as unknown as SavedExtraction;
  } catch (err) {
    console.error("[Persistence] Get error:", err);
    return null;
  }
}
