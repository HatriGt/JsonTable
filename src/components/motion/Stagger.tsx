import { m, useReducedMotion } from "@/lib/motion/framer";
import type { ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  inView?: boolean;
};

export function Stagger({ children, className, itemClassName, inView = true }: Props) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();

  if (reduced || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: viewportOnce }
        : { animate: "visible" })}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <m.div key={i} variants={staggerItem} className={itemClassName}>
              {child}
            </m.div>
          ))
        : children}
    </m.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();

  if (reduced || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div variants={staggerItem} className={cn(className)}>
      {children}
    </m.div>
  );
}
