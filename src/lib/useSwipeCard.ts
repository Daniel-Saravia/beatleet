"use client";

import { animate, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type SwipeDirection = "know" | "dont";

type Options = {
  onResult: (result: SwipeDirection) => void;
  onDragChange?: (active: boolean) => void;
  onDragMove?: (distance: number) => void;
  threshold?: number;
  velocityThreshold?: number;
};

type Handlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function useSwipeCard(options: Options) {
  const {
    onResult,
    onDragChange,
    onDragMove,
    threshold = 140,
    velocityThreshold = 900,
  } = options;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-10, 0, 10]);

  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const startXRef = useRef(0);
  const originXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);

  const settleTo = useCallback(
    (target: number, opts?: { velocity?: number; onComplete?: () => void }) => {
      const controls = animate(x, target, {
        type: "spring",
        stiffness: 280,
        damping: 32,
        velocity: opts?.velocity,
      });
      if (opts?.onComplete) controls.then(opts.onComplete).catch(() => {});
    },
    [x],
  );

  const finishDrag = useCallback(() => {
    isDraggingRef.current = false;
    onDragChange?.(false);
  }, [onDragChange]);

  const handlePointerDown = useCallback<Handlers["onPointerDown"]>(
    (event) => {
      if (isAnimatingRef.current) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.currentTarget.setPointerCapture?.(event.pointerId);
      isDraggingRef.current = true;
      onDragChange?.(true);
      startXRef.current = event.clientX;
      originXRef.current = x.get();
      lastXRef.current = event.clientX;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
    },
    [onDragChange, x],
  );

  const handlePointerMove = useCallback<Handlers["onPointerMove"]>(
    (event) => {
      if (!isDraggingRef.current) return;

      const now = performance.now();
      const deltaFromStart = event.clientX - startXRef.current;
      const nextX = originXRef.current + deltaFromStart;
      x.set(nextX);

      const deltaSinceLast = event.clientX - lastXRef.current;
      const timeDelta = now - lastTimeRef.current;
      if (timeDelta > 0) {
        velocityRef.current = (deltaSinceLast / timeDelta) * 1000;
      }
      lastXRef.current = event.clientX;
      lastTimeRef.current = now;

      onDragMove?.(nextX);
    },
    [onDragMove, x],
  );

  const handleRelease = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      finishDrag();

      const finalX = x.get();
      const velocity = velocityRef.current;

      const decideKnow = finalX > threshold || velocity > velocityThreshold;
      const decideDont = finalX < -threshold || velocity < -velocityThreshold;

      if (!decideKnow && !decideDont) {
        settleTo(0, { velocity });
        return;
      }

      isAnimatingRef.current = true;
      const direction: SwipeDirection = decideKnow ? "know" : "dont";
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
      const elementWidth = event.currentTarget.offsetWidth || 320;
      const travel = viewportWidth + elementWidth;
      const target = direction === "know" ? travel : -travel;

      settleTo(target, {
        velocity,
        onComplete: () => {
          isAnimatingRef.current = false;
          onResult(direction);
          x.set(0);
        },
      });
    },
    [finishDrag, onResult, settleTo, threshold, velocityThreshold, x],
  );

  const handlePointerUp = useCallback<Handlers["onPointerUp"]>(
    (event) => {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      handleRelease(event);
    },
    [handleRelease],
  );

  const handlePointerCancel = useCallback<Handlers["onPointerCancel"]>(
    (event) => {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      if (!isDraggingRef.current) return;
      finishDrag();
      settleTo(0);
    },
    [finishDrag, settleTo],
  );

  return {
    x,
    rotate,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    } satisfies Handlers,
  };
}
