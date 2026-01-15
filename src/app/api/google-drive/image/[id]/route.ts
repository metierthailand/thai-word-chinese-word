import { NextRequest } from "next/server";
import { getDriveClient } from "@/lib/google-drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;
  const drive = getDriveClient();

  // 1) ดึง metadata เพื่อรู้ mimeType
  const meta = await drive.files.get({
    fileId,
    fields: "mimeType, name",
    supportsAllDrives: true,
  });

  const mimeType = meta.data.mimeType || "application/octet-stream";

  // 2) ดึงไฟล์จริง (bytes) ด้วย alt=media
  const media = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );

  return new Response(media.data as ArrayBuffer, {
    headers: {
      "Content-Type": mimeType,
      // แคชตามเหมาะสม (ปรับได้)
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
