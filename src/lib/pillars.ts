import type { Pillar } from "@prisma/client";

export const PILLAR_LABELS: Record<Pillar, string> = {
  COMPASSION: "Compassion",
  COMMUNITY: "Community",
  CONTRIBUTION: "Contribution",
  COURAGE: "Courage",
};

export const PILLARS: Pillar[] = ["COMPASSION", "COMMUNITY", "CONTRIBUTION", "COURAGE"];
