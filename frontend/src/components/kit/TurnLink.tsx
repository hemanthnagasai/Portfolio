import { useContext } from "react";
import { Link, LinkProps } from "react-router-dom";
import { TransitionContext } from "@/context/TransitionContext";

interface TurnLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  /** Colour of the band that sweeps across: the destination scene. */
  sheet?: string;
}

// A real link (middle-click, open in new tab and copy-address all still
// work) that cuts to the next route behind a sweeping colour band instead
// of jumping straight there.
export default function TurnLink({ to, sheet = "var(--cream)", onClick, ...rest }: TurnLinkProps) {
  const { trigger } = useContext(TransitionContext);
  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        trigger({ color: sheet, to });
      }}
      {...rest}
    />
  );
}
