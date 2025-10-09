import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

type UseTripleSliderOptions = {
  minSwipeDistance?: number;
  maxDragDistance?: number;
  animationMs?: number;
};

type UseTripleSliderReturn = {
  containerRef: RefObject<HTMLDivElement | null>;
  isDragging: React.MutableRefObject<boolean>;
  slideIndex: number;
  setSlideIndex: (i: number) => void;
  trackStyle: CSSProperties;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  handleTransitionEnd: (onSettled: (direction: -1 | 0 | 1) => void) => void;
  goPrev: () => void;
  goNext: () => void;
};

export function useTripleSlider(
  options?: UseTripleSliderOptions
): UseTripleSliderReturn {
  const {
    minSwipeDistance = 80,
    maxDragDistance = 120,
    animationMs = 250,
  } = options || {};

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [slideIndex, setSlideIndex] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isDragging = useRef(false);
  const touchStartX = useRef(0);

  // measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const goPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragOffset(0);
    setSlideIndex(0);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragOffset(0);
    setSlideIndex(2);
  }, [isAnimating]);

  // touch/mouse handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      touchStartX.current = e.targetTouches[0].clientX;
      isDragging.current = true;
      setDragOffset(0);
    },
    [isAnimating]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || isAnimating) return;
      const currentX = e.targetTouches[0].clientX;
      const deltaX = currentX - touchStartX.current;
      const clamped = Math.max(
        -maxDragDistance,
        Math.min(maxDragDistance, deltaX)
      );
      setDragOffset(clamped);
    },
    [isAnimating, maxDragDistance]
  );

  const settleBack = useCallback(() => {
    setIsAnimating(true);
    setDragOffset(0);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || isAnimating) return;
    isDragging.current = false;
    const distance = dragOffset;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    } else {
      settleBack();
    }
  }, [dragOffset, minSwipeDistance, goNext, goPrev, isAnimating, settleBack]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isAnimating) return;
      touchStartX.current = e.clientX;
      isDragging.current = true;
      setDragOffset(0);
    },
    [isAnimating]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || isAnimating) return;
      const deltaX = e.clientX - touchStartX.current;
      const clamped = Math.max(
        -maxDragDistance,
        Math.min(maxDragDistance, deltaX)
      );
      setDragOffset(clamped);
    },
    [isAnimating, maxDragDistance]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || isAnimating) return;
    isDragging.current = false;
    handleTouchEnd();
  }, [handleTouchEnd, isAnimating]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const leave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        settleBack();
      }
    };
    el.addEventListener("mouseleave", leave);
    return () => el.removeEventListener("mouseleave", leave);
  }, [settleBack]);

  const trackStyle: React.CSSProperties = {
    transform: `translateX(${-(slideIndex * containerWidth) + dragOffset}px)`,
    transition: isAnimating ? `transform ${animationMs}ms ease-in-out` : "none",
  };

  const handleTransitionEnd = useCallback(
    (onSettled: (direction: -1 | 0 | 1) => void) => {
      if (slideIndex === 2) {
        onSettled(1);
      } else if (slideIndex === 0) {
        onSettled(-1);
      } else {
        onSettled(0);
      }
      // reset to center immediately
      if (slideIndex !== 1) {
        setIsAnimating(false);
        setDragOffset(0);
        setSlideIndex(1);
      } else {
        setIsAnimating(false);
      }
    },
    [slideIndex]
  );

  return {
    containerRef,
    isDragging,
    slideIndex,
    setSlideIndex,
    trackStyle,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTransitionEnd,
    goPrev,
    goNext,
  };
}

export default useTripleSlider;
