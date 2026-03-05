import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// This route uses the filesystem, so we ensure it runs in the Node.js runtime.
export const runtime = "nodejs";

const VISITS_FILE = path.join(process.cwd(), "visits.json");

async function readVisitCount(): Promise<number> {
  try {
    const content = await fs.readFile(VISITS_FILE, "utf8");
    const parsed = JSON.parse(content) as { count?: unknown };
    const count =
      typeof parsed.count === "number" && Number.isFinite(parsed.count)
        ? parsed.count
        : 0;
    return count;
  } catch (error) {
    // If the file doesn't exist or is invalid JSON, treat it as zero.
    return 0;
  }
}

async function writeVisitCount(count: number): Promise<void> {
  const payload = JSON.stringify({ count }, null, 2);
  await fs.writeFile(VISITS_FILE, payload, "utf8");
}

export async function GET() {
  // Read, increment, and persist the visit count on each request so we get a
  // simple, file-backed counter without needing a database.
  const currentCount = await readVisitCount();
  const nextCount = currentCount + 1;
  await writeVisitCount(nextCount);

  return NextResponse.json({ count: nextCount });
}

