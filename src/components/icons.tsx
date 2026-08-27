import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Marca de la app: un cuaderno de cuentas, no un emoji. */
export function IconLedger(props: Props) {
  return (
    <Svg {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="2.4" />
      <path d="M8 4.5v15" />
      <path d="M11.2 9.2h6.2M11.2 12.5h4.4" />
    </Svg>
  );
}

export function IconChart(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 19V10" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M3 19h18" />
    </Svg>
  );
}

export function IconCard(props: Props) {
  return (
    <Svg {...props}>
      <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.4" />
      <path d="M2.75 10h18.5" />
      <path d="M7 15.25h3.75" />
    </Svg>
  );
}

export function IconRepeat(props: Props) {
  return (
    <Svg {...props}>
      <path d="M17 4.5l3 3-3 3" />
      <path d="M20 7.5H9.2A5.2 5.2 0 0 0 4 12.7" />
      <path d="M7 19.5l-3-3 3-3" />
      <path d="M4 16.5h10.8A5.2 5.2 0 0 0 20 11.3" />
    </Svg>
  );
}

export function IconCalendar(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3.25" y="5" width="17.5" height="15" rx="2.4" />
      <path d="M8 3.5v3M16 3.5v3M3.25 9.5h17.5" />
    </Svg>
  );
}

export function IconSettings(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 4.2v1.7M12 18.1v1.7M5.4 6.7l1.2 1.2M17.4 16.1l1.2 1.2M4.2 12h1.7M18.1 12h1.7M5.4 17.3l1.2-1.2M17.4 7.9l1.2-1.2" />
    </Svg>
  );
}

export function IconEdit(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 20h16" />
      <path d="M14.6 5.2a1.85 1.85 0 0 1 2.6 2.62L8.4 16.6 4.8 17.5l.9-3.6L14.6 5.2z" />
    </Svg>
  );
}

export function IconTrash(props: Props) {
  return (
    <Svg {...props}>
      <path d="M5 7h14" />
      <path d="M9.5 7V5.4A1.4 1.4 0 0 1 10.9 4h2.2a1.4 1.4 0 0 1 1.4 1.4V7" />
      <path d="M7.4 7l.7 12.2A1.8 1.8 0 0 0 9.9 21h4.2a1.8 1.8 0 0 0 1.8-1.8L16.6 7" />
      <path d="M10.2 11.2v6M13.8 11.2v6" />
    </Svg>
  );
}

export function IconPlus(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 6v12M6 12h12" />
    </Svg>
  );
}

export function IconList(props: Props) {
  return (
    <Svg {...props}>
      <path d="M9 7h11M9 12h11M9 17h11" />
      <path d="M5 7h.01M5 12h.01M5 17h.01" />
    </Svg>
  );
}

export function IconGrid(props: Props) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.3" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.3" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.3" />
    </Svg>
  );
}

export function IconSort(props: Props) {
  return (
    <Svg {...props}>
      <path d="M8 5v14M5.2 8.2 8 5.4l2.8 2.8" />
      <path d="M16 19V5M13.2 15.8 16 18.6l2.8-2.8" />
    </Svg>
  );
}

export function IconBack(props: Props) {
  return (
    <Svg {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Svg>
  );
}

export function IconChevron(props: Props) {
  return (
    <Svg {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </Svg>
  );
}
