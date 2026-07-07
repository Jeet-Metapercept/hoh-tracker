// atlantis-season.ts — shared Firestore/season helpers used by the Atlantis
// composables (useEnergyBoard, useBattleLog). Extracted to avoid duplication.

import { collection, getDocs, type Firestore } from "firebase/firestore";

/** Season window doc (atlantis/{season_id}). */
export interface SeasonDoc {
  season_id: string;
  conflict_start_iso: string;
  conflict_end_iso: string;
  last_posted_at?: string | null;
}

/** Coerce a Firestore value (Timestamp | Date | string) to an ISO string. */
export function toIso(v: unknown): string {
  if (v == null) return "";
  const anyV = v as { toDate?: () => Date; toISOString?: () => string };
  if (typeof anyV.toDate === "function") return anyV.toDate().toISOString();
  if (typeof anyV.toISOString === "function") return anyV.toISOString();
  return String(v);
}

/** True if `now` is inside [conflict_start, conflict_end). */
export function seasonContains(s: SeasonDoc, now: Date): boolean {
  const t = now.getTime();
  return (
    t >= new Date(s.conflict_start_iso).getTime() &&
    t < new Date(s.conflict_end_iso).getTime()
  );
}

/** Read the `atlantis` collection and pick the active season (containing `now`,
 *  else the most recent by start). Returns null if there are no seasons. */
export async function pickSeason(
  db: Firestore,
  now: Date,
): Promise<SeasonDoc | null> {
  const snap = await getDocs(collection(db, "atlantis"));
  const seasons: SeasonDoc[] = snap.docs.map((d) => {
    const x = d.data();
    return {
      season_id: String(x.season_id ?? d.id),
      conflict_start_iso: toIso(x.conflict_start_iso),
      conflict_end_iso: toIso(x.conflict_end_iso),
      last_posted_at: x.last_posted_at ? toIso(x.last_posted_at) : null,
    };
  });
  if (seasons.length === 0) return null;
  return (
    seasons.find((s) => seasonContains(s, now)) ??
    [...seasons].sort(
      (a, b) =>
        new Date(b.conflict_start_iso).getTime() -
        new Date(a.conflict_start_iso).getTime(),
    )[0]!
  );
}
