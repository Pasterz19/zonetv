"use client";

import { useEffect, useCallback, useRef, useState } from "react";

/**
 * TV Navigation Hook - Handles keyboard navigation for Smart TV interface
 * Supports arrow keys, Enter, Escape, Page Up/Down, and other TV remote keys
 */

export interface UseTvNavigationOptions {
  /** Total number of focusable items */
  itemCount: number;
  /** Number of columns in the grid */
  columns?: number;
  /** Callback when an item is selected (Enter/Space) */
  onSelect?: (index: number) => void;
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void;
  /** Callback for Escape key */
  onEscape?: () => void;
  /** Callback for fullscreen toggle (F key) */
  onFullscreen?: () => void;
  /** Callback for mute toggle (M key) */
  onMute?: () => void;
  /** Callback for EPG toggle (G key) */
  onGuide?: () => void;
  /** Callback for channel up (Page Up) */
  onChannelUp?: () => void;
  /** Callback for channel down (Page Down) */
  onChannelDown?: () => void;
  /** Initial focused index */
  initialIndex?: number;
  /** Is navigation enabled */
  enabled?: boolean;
  /** Enable loop navigation (wrap around) */
  loop?: boolean;
}

export interface UseTvNavigationReturn {
  /** Currently focused index */
  focusedIndex: number;
  /** Set focused index manually */
  setFocusedIndex: (index: number) => void;
  /** Is using keyboard navigation (for focus styles) */
  isKeyboardMode: boolean;
  /** Reset to initial state */
  reset: () => void;
  /** Get focus props for an item */
  getItemProps: (index: number) => {
    tabIndex: number;
    "data-focused": boolean;
    onFocus: () => void;
    onClick: () => void;
    className: string;
  };
}

export function useTvNavigation({
  itemCount,
  columns = 4,
  onSelect,
  onFocusChange,
  onEscape,
  onFullscreen,
  onMute,
  onGuide,
  onChannelUp,
  onChannelDown,
  initialIndex = 0,
  enabled = true,
  loop = true,
}: UseTvNavigationOptions): UseTvNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const lastInteractionRef = useRef<"keyboard" | "mouse">("mouse");

  // Clamp focused index to valid range
  const clampIndex = useCallback(
    (index: number) => {
      if (itemCount === 0) return 0;
      if (loop) {
        return ((index % itemCount) + itemCount) % itemCount;
      }
      return Math.max(0, Math.min(index, itemCount - 1));
    },
    [itemCount, loop]
  );

  // Move focus in a direction
  const moveFocus = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (itemCount === 0) return;

      const currentRow = Math.floor(focusedIndex / columns);
      const currentCol = focusedIndex % columns;
      const totalRows = Math.ceil(itemCount / columns);

      let newIndex: number;

      switch (direction) {
        case "up":
          if (currentRow > 0) {
            newIndex = focusedIndex - columns;
          } else if (loop) {
            // Move to last row, same column (or last valid column)
            const lastRowStart = (totalRows - 1) * columns;
            const lastRowEnd = Math.min(lastRowStart + columns - 1, itemCount - 1);
            newIndex = Math.min(lastRowStart + currentCol, lastRowEnd);
          } else {
            newIndex = focusedIndex;
          }
          break;

        case "down":
          if (currentRow < totalRows - 1) {
            newIndex = focusedIndex + columns;
            // Don't go past the last item
            newIndex = Math.min(newIndex, itemCount - 1);
          } else if (loop) {
            // Move to first row
            newIndex = currentCol;
          } else {
            newIndex = focusedIndex;
          }
          break;

        case "left":
          if (currentCol > 0) {
            newIndex = focusedIndex - 1;
          } else if (loop) {
            // Move to end of row
            const rowStart = currentRow * columns;
            const rowEnd = Math.min(rowStart + columns - 1, itemCount - 1);
            newIndex = rowEnd;
          } else {
            newIndex = focusedIndex;
          }
          break;

        case "right":
          if (currentCol < columns - 1 && focusedIndex < itemCount - 1) {
            newIndex = focusedIndex + 1;
          } else if (loop) {
            // Move to start of row
            newIndex = currentRow * columns;
          } else {
            newIndex = focusedIndex;
          }
          break;

        default:
          newIndex = focusedIndex;
      }

      setFocusedIndex(clampIndex(newIndex));
      setIsKeyboardMode(true);
      lastInteractionRef.current = "keyboard";
    },
    [focusedIndex, columns, itemCount, loop, clampIndex]
  );

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Mark as keyboard mode on any key press
      lastInteractionRef.current = "keyboard";
      setIsKeyboardMode(true);

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          moveFocus("up");
          break;

        case "ArrowDown":
          event.preventDefault();
          moveFocus("down");
          break;

        case "ArrowLeft":
          event.preventDefault();
          moveFocus("left");
          break;

        case "ArrowRight":
          event.preventDefault();
          moveFocus("right");
          break;

        case "Enter":
        case " ":
          event.preventDefault();
          onSelect?.(focusedIndex);
          break;

        case "Escape":
          event.preventDefault();
          onEscape?.();
          break;

        case "f":
        case "F":
          event.preventDefault();
          onFullscreen?.();
          break;

        case "m":
        case "M":
          event.preventDefault();
          onMute?.();
          break;

        case "g":
        case "G":
          event.preventDefault();
          onGuide?.();
          break;

        case "PageUp":
          event.preventDefault();
          onChannelUp?.();
          break;

        case "PageDown":
          event.preventDefault();
          onChannelDown?.();
          break;

        // TV Remote specific keys
        case "MediaPlay":
        case "MediaPause":
          event.preventDefault();
          onSelect?.(focusedIndex);
          break;

        case "MediaTrackPrevious":
          event.preventDefault();
          onChannelUp?.();
          break;

        case "MediaTrackNext":
          event.preventDefault();
          onChannelDown?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    focusedIndex,
    moveFocus,
    onSelect,
    onEscape,
    onFullscreen,
    onMute,
    onGuide,
    onChannelUp,
    onChannelDown,
  ]);

  // Call onFocusChange when focus changes
  useEffect(() => {
    onFocusChange?.(focusedIndex);
  }, [focusedIndex, onFocusChange]);

  // Detect mouse interaction to disable keyboard focus styles
  useEffect(() => {
    const handleMouseMove = () => {
      if (lastInteractionRef.current === "keyboard") {
        lastInteractionRef.current = "mouse";
        setIsKeyboardMode(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setFocusedIndex(initialIndex);
    setIsKeyboardMode(false);
    lastInteractionRef.current = "mouse";
  }, [initialIndex]);

  // Get item props for accessibility and events
  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      "data-focused": index === focusedIndex,
      onFocus: () => {
        setFocusedIndex(index);
        setIsKeyboardMode(false);
      },
      onClick: () => {
        setFocusedIndex(index);
        onSelect?.(index);
        setIsKeyboardMode(false);
        lastInteractionRef.current = "mouse";
      },
      className:
        index === focusedIndex && isKeyboardMode
          ? "tv-focus-visible"
          : "",
    }),
    [focusedIndex, isKeyboardMode, onSelect]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    isKeyboardMode,
    reset,
    getItemProps,
  };
}
