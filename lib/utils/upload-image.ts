export async function uploadImageAsBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type;
  return `data:${mimeType};base64,${base64}`;
}
