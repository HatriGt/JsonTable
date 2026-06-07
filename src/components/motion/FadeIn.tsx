import { m, useReducedMotion } from "@/lib/motion/framer";
import type { ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { fadeUp, motionTransition, viewportOnce } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
};

export function FadeIn({ children, className, delay = 0, inView = false }: Props) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();

  if (reduced || !mounted) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = inView
    ? {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: viewportOnce,
      }
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  return (
    <m.div
      variants={fadeUp}
      transition={{ ...motionTransition.normal, delay }}
      className={cn(className)}
      {...motionProps}
    >
      {children}
    </m.div>
  );
}
