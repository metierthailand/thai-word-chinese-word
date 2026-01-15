import { google } from "googleapis";
import { Readable } from "stream";

const esc = (s: string) => s.replace(/'/g, "\\'");

/**
 * Initialize Google Drive API client
 */
export function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Find or create a folder in Google Drive
 * Note: Service Accounts need folders to be shared with them
 * If using a root folder ID, it will be used directly
 */
export async function findOrCreateFolder(
  drive: ReturnType<typeof getDriveClient>,
  folderName: string,
): Promise<string> {
  const cleanFolderName = folderName.split("?")[0].trim();

  // If folderName looks like an ID, validate it
  if (/^[a-zA-Z0-9_-]{20,}$/.test(cleanFolderName)) {
    const folder = await drive.files.get({
      fileId: cleanFolderName,
      fields: "id, name, mimeType",
      supportsAllDrives: true,
    });
    if (folder.data.mimeType === "application/vnd.google-apps.folder") {
      return cleanFolderName;
    }
    throw new Error(`"${cleanFolderName}" is not a folder`);
  }

  let rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootFolderId) {
    throw new Error(
      `Please set GOOGLE_DRIVE_ROOT_FOLDER_ID and share it with Service Account (${process.env.GOOGLE_DRIVE_CLIENT_EMAIL}).`,
    );
  }

  rootFolderId = rootFolderId.split("?")[0].trim();

  // verify root folder
  const rootFolder = await drive.files.get({
    fileId: rootFolderId,
    fields: "id, name, mimeType",
    supportsAllDrives: true,
  });
  if (rootFolder.data.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not a folder");
  }

  // if you want subfolders: treat folderName as path relative to root
  const pathParts = cleanFolderName
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  let currentFolderId = rootFolderId;

  for (const part of pathParts) {
    const list = await drive.files.list({
      q: `name='${esc(part)}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${currentFolderId}' in parents`,
      fields: "files(id, name)",
      spaces: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    const existing = list.data.files?.[0];
    if (existing?.id) {
      currentFolderId = existing.id;
      continue;
    }

    const created = await drive.files.create({
      requestBody: {
        name: part,
        mimeType: "application/vnd.google-apps.folder",
        parents: [currentFolderId],
      },
      fields: "id",
      supportsAllDrives: true,
    });

    if (!created.data.id) throw new Error("Failed to create folder");
    currentFolderId = created.data.id;
  }

  return currentFolderId;
}

/**
 * Upload file to Google Drive
 */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string,
): Promise<{ fileId: string; fileUrl: string }> {
  const drive = getDriveClient();
  const stream = Readable.from(fileBuffer);

  const created = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: "id",
    supportsAllDrives: true,
  });

  const fileId = created.data.id!;
  if (!fileId) throw new Error("Upload failed: no fileId returned");

  // Public permission (optional)
  // await drive.permissions.create({
  //   fileId,
  //   requestBody: { role: "reader", type: "anyone" },
  //   supportsAllDrives: true,
  //   fields: "id",
  // });
  // Note: File permissions are inherited from parent folder
  // If parent folder is set to "Anyone with the link", files will inherit that permission
  // No need to set individual file permissions to avoid inheritance conflicts

  // Return proxy API URL for reliable image display
  // The proxy endpoint handles authentication and serves the file directly
  const imageUrl = `/api/google-drive/image/${fileId}`;

  return {
    fileId,
    fileUrl: imageUrl,
  };
}
