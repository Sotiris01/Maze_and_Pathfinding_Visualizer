import { useState, useEffect, useCallback } from "react";
import { RunRecord } from "../types";

const STORAGE_KEY = "pathfinder_run_history";
const MAX_HISTORY_ITEMS = 50; // Limit history to prevent localStorage bloat

/**
 * useHistory Hook
 * Manages Run History with localStorage persistence
 */
export const useHistory = () => {
  const [history, setHistory] = useState<RunRecord[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RunRecord[];
        // Sort by timestamp descending (newest first)
        const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sorted);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  }, [history]);

  /**
   * Add a new record to history
   * Generates UUID and timestamp automatically
   */
  const addRecord = useCallback(
    (record: Omit<RunRecord, "id" | "timestamp" | "date">): void => {
      const newRecord: RunRecord = {
        ...record,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };

      setHistory((prev) => {
        // Add new record at the beginning
        const updated = [newRecord, ...prev];
        // Trim to max items
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    },
    []
  );

  /**
   * Clear all history
   */
  const clearHistory = useCallback((): void => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Delete a single record by ID
   */
  const deleteRecord = useCallback((id: string): void => {
    setHistory((prev) => prev.filter((record) => record.id !== id));
  }, []);

  /**
   * Get history sorted by timestamp (newest first)
   */
  const getHistory = useCallback((): RunRecord[] => {
    return [...history].sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  return {
    history,
    addRecord,
    clearHistory,
    deleteRecord,
    getHistory,
  };
};

export default useHistory;
