"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Media } from "@/types/media";
import { Check, BookmarkPlus, X } from "lucide-react";

interface MyListContextType {
  items: Media[];
  count: number;
  isLoaded: boolean;
  isInList: (id: string) => boolean;
  addItem: (item: Media) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: Media) => boolean;
  clearList: () => void;
  showToast: (message: string) => void;
}

const STORAGE_KEY = "cinemate_my_list_v1";

const MyListContext = createContext<MyListContextType | undefined>(undefined);

export function MyListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Media[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "add" | "remove" | "info" } | null>(null);

  // Initialize from localStorage on mount (hydration-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read My List from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  const persistItems = useCallback((newItems: Media[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to persist My List to localStorage", e);
    }
  }, []);

  const triggerToast = useCallback((message: string, type: "add" | "remove" | "info" = "info") => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const isInList = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id);
    },
    [items]
  );

  const addItem = useCallback(
    (item: Media) => {
      setItems((prev) => {
        if (prev.some((x) => x.id === item.id)) return prev;
        const updated = [item, ...prev];
        persistItems(updated);
        return updated;
      });
      triggerToast(`Added "${item.title}" to My List`, "add");
    },
    [persistItems, triggerToast]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const found = prev.find((x) => x.id === id);
        const updated = prev.filter((x) => x.id !== id);
        persistItems(updated);
        if (found) {
          triggerToast(`Removed "${found.title}" from My List`, "remove");
        }
        return updated;
      });
    },
    [persistItems, triggerToast]
  );

  const toggleItem = useCallback(
    (item: Media) => {
      const exists = items.some((x) => x.id === item.id);
      if (exists) {
        removeItem(item.id);
        return false;
      } else {
        addItem(item);
        return true;
      }
    },
    [items, addItem, removeItem]
  );

  const clearList = useCallback(() => {
    setItems([]);
    persistItems([]);
    triggerToast("Cleared all items from My List", "info");
  }, [persistItems, triggerToast]);

  const showToast = useCallback((message: string) => {
    triggerToast(message, "info");
  }, [triggerToast]);

  return (
    <MyListContext.Provider
      value={{
        items,
        count: items.length,
        isLoaded,
        isInList,
        addItem,
        removeItem,
        toggleItem,
        clearList,
        showToast,
      }}
    >
      {children}
      {/* Sleek Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-5 z-[150] flex animate-fade-in items-center gap-3 rounded-2xl border border-white/15 bg-[#181818]/95 px-4 py-3 shadow-2xl backdrop-blur-xl md:top-24">
          <div
            className={`flex h-8 w-8 flex-none items-center justify-center rounded-xl ${
              toast.type === "add"
                ? "bg-cinema/20 text-cinema"
                : toast.type === "remove"
                ? "bg-white/10 text-white/70"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {toast.type === "add" ? (
              <Check size={18} strokeWidth={2.5} />
            ) : (
              <BookmarkPlus size={18} />
            )}
          </div>
          <span className="text-sm font-medium text-white">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss toast"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) {
    throw new Error("useMyList must be used within a MyListProvider");
  }
  return context;
}
