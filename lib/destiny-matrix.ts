/**
 * Destiny Matrix calculation engine.
 * Converts birth date into archetypal numbers 1-22 (Major Arcana).
 * Numbers above 22 are reduced by summing digits; 0 maps to 22 (The Fool).
 */

export const ARCANA_MEANINGS: Record<
  number,
  { name: string; positive: string; negative: string; themes: string[] }
> = {
  1: {
    name: "The Magician",
    positive: "Initiative, manifestation, leadership, skill",
    negative: "Manipulation, trickery, superficial charm",
    themes: ["creation", "willpower", "resourcefulness"],
  },
  2: {
    name: "The High Priestess",
    positive: "Intuition, hidden knowledge, mystery, wisdom",
    negative: "Secrecy, withdrawal, confusion",
    themes: ["intuition", "subconscious", "mystery"],
  },
  3: {
    name: "The Empress",
    positive: "Nurturance, creativity, abundance, beauty",
    negative: "Smothering, dependency, creative block",
    themes: ["fertility", "nature", "nurturing"],
  },
  4: {
    name: "The Emperor",
    positive: "Authority, structure, strength, stability",
    negative: "Rigidity, domination, coldness",
    themes: ["order", "father", "foundation"],
  },
  5: {
    name: "The Hierophant",
    positive: "Tradition, spiritual teaching, wisdom, conformity",
    negative: "Dogma, inflexibility, superficial faith",
    themes: ["belief", "tradition", "mentorship"],
  },
  6: {
    name: "The Lovers",
    positive: "Love, choice, harmony, partnership",
    negative: "Indecision, imbalance, dependency",
    themes: ["union", "values", "choice"],
  },
  7: {
    name: "The Chariot",
    positive: "Willpower, action, victory, determination",
    negative: "Aggression, recklessness, force",
    themes: ["control", "direction", "triumph"],
  },
  8: {
    name: "Justice",
    positive: "Balance, karma, fairness, truth",
    negative: "Unfairness, legal issues, imbalance",
    themes: ["cause and effect", "truth", "integrity"],
  },
  9: {
    name: "The Hermit",
    positive: "Solitude, introspection, inner light, wisdom",
    negative: "Isolation, loneliness, withdrawal",
    themes: ["search", "guidance", "inner voice"],
  },
  10: {
    name: "Wheel of Fortune",
    positive: "Change, cycles, fate, opportunity",
    negative: "Instability, bad luck, resistance to change",
    themes: ["cycles", "destiny", "turning points"],
  },
  11: {
    name: "Strength",
    positive: "Courage, resilience, inner power, compassion",
    negative: "Self-doubt, weakness, misuse of power",
    themes: ["courage", "patience", "taming"],
  },
  12: {
    name: "The Hanged Man",
    positive: "Surrender, perspective shift, sacrifice, pause",
    negative: "Stagnation, martyrdom, delay",
    themes: ["release", "new perspective", "surrender"],
  },
  13: {
    name: "Death",
    positive: "Transformation, endings, rebirth, release",
    negative: "Resistance to change, fear, endings",
    themes: ["transformation", "endings", "rebirth"],
  },
  14: {
    name: "Temperance",
    positive: "Balance, alchemy, harmony, moderation",
    negative: "Imbalance, excess, impatience",
    themes: ["blending", "patience", "middle path"],
  },
  15: {
    name: "The Devil",
    positive: "Shadow work, materialism, binding, desire",
    negative: "Temptation, bondage, addiction",
    themes: ["attachment", "material world", "shadow"],
  },
  16: {
    name: "The Tower",
    positive: "Upheaval, liberation, awakening, revelation",
    negative: "Disaster, shock, sudden loss",
    themes: ["sudden change", "revelation", "breakdown"],
  },
  17: {
    name: "The Star",
    positive: "Hope, healing, inspiration, faith",
    negative: "Disappointment, despair, false hope",
    themes: ["hope", "renewal", "guidance"],
  },
  18: {
    name: "The Moon",
    positive: "Intuition, dreams, subconscious, imagination",
    negative: "Illusion, fear, confusion",
    themes: ["illusion", "dreams", "unconscious"],
  },
  19: {
    name: "The Sun",
    positive: "Joy, clarity, vitality, success",
    negative: "Arrogance, burnout, superficial happiness",
    themes: ["vitality", "success", "clarity"],
  },
  20: {
    name: "Judgment",
    positive: "Rebirth, spiritual awakening, absolution",
    negative: "Self-criticism, inability to forgive",
    themes: ["awakening", "renewal", "calling"],
  },
  21: {
    name: "The World",
    positive: "Completion, unity, integration, wholeness",
    negative: "Incompletion, lack of closure",
    themes: ["completion", "achievement", "cycles"],
  },
  22: {
    name: "The Fool",
    positive: "Freedom, potential, new beginnings, spontaneity",
    negative: "Naivety, recklessness, lack of direction",
    themes: ["beginnings", "innocence", "leap of faith"],
  },
};

/** Reduce a number to 1-22 (arcana range). Master numbers 11 and 22 are kept. */
export function reduceToArcana(n: number): number {
  if (n <= 0) return 22;
  if (n <= 22) return n;
  let x = n;
  while (x > 22) {
    x = String(x)
      .split("")
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
    if (x > 22 && x < 100) {
      x = Math.floor(x / 10) + (x % 10);
    }
  }
  if (x === 0) return 22;
  return x > 22 ? reduceToArcana(x) : x;
}

/** Sum digits of a number and reduce to 1-22 */
function sumDigitsAndReduce(n: number): number {
  const sum = String(n)
    .split("")
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceToArcana(sum);
}

export interface DestinyMatrixInput {
  day: number;
  month: number;
  year: number;
}

export interface DestinyMatrixResult {
  input: DestinyMatrixInput;
  points: {
    A: number; // Soul - day
    B: number; // Month
    C: number; // Year
    D: number; // Karma (A+B+C)
    E: number; // Center/Core (A+B+C+D)
    F: number; // A+B
    G: number; // B+C
    H: number; // C+D
    I: number; // D+A
  };
  arcana: Record<string, { number: number; name: string; positive: string; negative: string; themes: string[] }>;
  summary: string;
}

/**
 * Calculate the full Destiny Matrix from a date of birth.
 */
export function calculateDestinyMatrix(
  day: number,
  month: number,
  year: number
): DestinyMatrixResult {
  const A = sumDigitsAndReduce(day);
  const B = month <= 22 ? month : reduceToArcana(month);
  const C = sumDigitsAndReduce(year);
  const D = reduceToArcana(A + B + C);
  const E = reduceToArcana(A + B + C + D);
  const F = reduceToArcana(A + B);
  const G = reduceToArcana(B + C);
  const H = reduceToArcana(C + D);
  const I = reduceToArcana(D + A);

  const points = { A, B, C, D, E, F, G, H, I };

  const arcana: DestinyMatrixResult["arcana"] = {};
  const pointNames: Record<string, string> = {
    A: "Soul (Inner Driver)",
    B: "Month (Energetic Layer)",
    C: "Year (Karmic Layer)",
    D: "Karma (Growth Pressure)",
    E: "Core (Life Archetype)",
    F: "Talent/Body",
    G: "Spirit/Connection",
    H: "Purpose/Destiny",
    I: "Mind/Thinking",
  };
  for (const [key, value] of Object.entries(points)) {
    const arc = ARCANA_MEANINGS[value as keyof typeof ARCANA_MEANINGS];
    arcana[key] = {
      number: value,
      name: arc.name,
      positive: arc.positive,
      negative: arc.negative,
      themes: arc.themes,
    };
  }

  const core = ARCANA_MEANINGS[E];
  const soul = ARCANA_MEANINGS[A];
  const karma = ARCANA_MEANINGS[D];

  const summary = [
    `Core (Life Archetype): ${core.name} — ${core.positive}`,
    `Soul (Inner Driver): ${soul.name} — ${soul.positive}`,
    `Karma (Growth Pressure): ${karma.name} — ${karma.positive}`,
  ].join(". ");

  return {
    input: { day, month, year },
    points,
    arcana,
    summary,
  };
}

/**
 * Format the matrix result as a string for GPT context.
 */
export function formatMatrixForPrompt(matrix: DestinyMatrixResult): string {
  const lines: string[] = [
    "Destiny Matrix (from birth date):",
    `- Soul (A): ${matrix.arcana.A.name} (${matrix.arcana.A.positive})`,
    `- Month (B): ${matrix.arcana.B.name}`,
    `- Year (C): ${matrix.arcana.C.name}`,
    `- Karma (D): ${matrix.arcana.D.name} (${matrix.arcana.D.positive})`,
    `- Core/Center (E): ${matrix.arcana.E.name} (${matrix.arcana.E.positive})`,
    `- F (Talent): ${matrix.arcana.F.name}`,
    `- G (Spirit): ${matrix.arcana.G.name}`,
    `- H (Purpose): ${matrix.arcana.H.name}`,
    `- I (Mind): ${matrix.arcana.I.name}`,
    "",
    "Summary: " + matrix.summary,
  ];
  return lines.join("\n");
}
