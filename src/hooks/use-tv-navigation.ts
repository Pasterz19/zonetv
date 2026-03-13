'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export interface TVNavigationConfig {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onBackspace?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onKeyF?: () => void;
  onKeyM?: () => void;
  onKeyG?: () => void;
  onSpace?: () => void;
}

export function useTVNavigation(config: TVNavigationConfig) {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const lastInputTime = useRef<number>(0);
  const lastInputType = useRef<'keyboard' | 'mouse'>('mouse');

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const now = Date.now();
    
    // Detect if this is keyboard navigation
    if (lastInputType.current !== 'keyboard') {
      setIsKeyboardNavigation(true);
      lastInputType.current = 'keyboard';
    }
    lastInputTime.current = now;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        config.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        config.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        config.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        config.onArrowRight?.();
        break;
      case 'Enter':
        event.preventDefault();
        config.onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        config.onEscape?.();
        break;
      case 'Backspace':
        event.preventDefault();
        config.onBackspace?.();
        break;
      case 'PageUp':
        event.preventDefault();
        config.onPageUp?.();
        break;
      case 'PageDown':
        event.preventDefault();
        config.onPageDown?.();
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        config.onKeyF?.();
        break;
      case 'm':
      case 'M':
        event.preventDefault();
        config.onKeyM?.();
        break;
      case 'g':
      case 'G':
        event.preventDefault();
        config.onKeyG?.();
        break;
      case ' ':
        event.preventDefault();
        config.onSpace?.();
        break;
    }
  }, [config]);

  const handleMouseMove = useCallback(() => {
    const now = Date.now();
    
    // Only switch to mouse mode after a brief delay since last keyboard input
    if (now - lastInputTime.current > 100 && lastInputType.current !== 'mouse') {
      setIsKeyboardNavigation(false);
      lastInputType.current = 'mouse';
    }
    lastInputTime.current = now;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleKeyDown, handleMouseMove]);

  return { isKeyboardNavigation };
}

// Hook for managing focus position in a grid
export function useGridNavigation(
  columns: number,
  totalItems: number,
  onSelect?: (index: number) => void
) {
  const [focusIndex, setFocusIndex] = useState(0);

  const moveUp = useCallback(() => {
    setFocusIndex(prev => Math.max(0, prev - columns));
  }, [columns]);

  const moveDown = useCallback(() => {
    setFocusIndex(prev => Math.min(totalItems - 1, prev + columns));
  }, [columns, totalItems]);

  const moveLeft = useCallback(() => {
    setFocusIndex(prev => Math.max(0, prev - 1));
  }, []);

  const moveRight = useCallback(() => {
    setFocusIndex(prev => Math.min(totalItems - 1, prev + 1));
  }, [totalItems]);

  const select = useCallback(() => {
    onSelect?.(focusIndex);
  }, [focusIndex, onSelect]);

  const goToIndex = useCallback((index: number) => {
    setFocusIndex(Math.max(0, Math.min(totalItems - 1, index)));
  }, [totalItems]);

  return {
    focusIndex,
    setFocusIndex,
    goToIndex,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    select,
  };
}
