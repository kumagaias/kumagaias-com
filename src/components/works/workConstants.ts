import type React from "react";
import type { Work } from "../../data/works";
import { AndroidIcon, CLIIcon, GlobeIcon, IOSIcon } from "./icons";

type WorkType = Work["types"][number];

export const TYPE_META: Record<WorkType, { label: string; color: string; Icon: (p: { size?: number }) => React.ReactElement }> = {
  web: { label: "Web", color: "#214e57", Icon: GlobeIcon },
  iOS: { label: "iOS", color: "#59616b", Icon: IOSIcon },
  Android: { label: "Android", color: "#2f6f59", Icon: AndroidIcon },
  CLI: { label: "CLI", color: "#836328", Icon: CLIIcon },
};

export const TECH_COLORS: Record<string, string> = {
  "React Native": "#9a4d2f",
  AWS: "#8c6424",
  "Claude Code": "#7b6b1f",
  Kiro: "#2f6f59",
  Go: "#25708a",
  React: "#246b79",
  RSS: "#a34f25",
  CLI: "#836328",
  Homebrew: "#8c6424",
};
