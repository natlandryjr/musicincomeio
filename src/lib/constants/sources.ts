/**
 * Income source types and metadata
 * Central registry for all revenue stream types
 */

export const SOURCE_TYPES = {
  STREAMING: {
    id: "streaming",
    label: "Streaming",
    description: "Spotify, Apple Music, etc.",
    color: "bg-green-500",
    icon: "🎵",
    category: "digital",
  },
  SOUNDEXCHANGE: {
    id: "soundexchange",
    label: "SoundExchange",
    description: "Digital radio royalties",
    color: "bg-blue-500",
    icon: "📻",
    category: "performance",
  },
  PRO: {
    id: "pro",
    label: "PRO",
    description: "ASCAP, BMI, SESAC",
    color: "bg-purple-500",
    icon: "🎼",
    category: "performance",
  },
  MLC: {
    id: "mlc",
    label: "MLC",
    description: "Mechanical Licensing Collective",
    color: "bg-orange-500",
    icon: "⚙️",
    category: "mechanical",
  },
  YOUTUBE: {
    id: "youtube",
    label: "YouTube",
    description: "Content ID & Partner Program",
    color: "bg-red-500",
    icon: "▶️",
    category: "digital",
  },
  NEIGHBOURING: {
    id: "neighbouring",
    label: "Neighbouring Rights",
    description: "PPL, SoundExchange intl",
    color: "bg-teal-500",
    icon: "🌍",
    category: "performance",
  },
  SYNC: {
    id: "sync",
    label: "Sync Licensing",
    description: "TV, film, ads",
    color: "bg-pink-500",
    icon: "🎬",
    category: "sync",
  },
} as const;

export type SourceTypeId = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES]["id"];

/**
 * Get source metadata by ID
 */
export function getSourceMetadata(sourceId: string) {
  return Object.values(SOURCE_TYPES).find((s) => s.id === sourceId) || SOURCE_TYPES.STREAMING;
}

/**
 * Get all source types as array
 */
export function getAllSources() {
  return Object.values(SOURCE_TYPES);
}

/**
 * Get sources by category
 */
export function getSourcesByCategory(category: string) {
  return Object.values(SOURCE_TYPES).filter((s) => s.category === category);
}
