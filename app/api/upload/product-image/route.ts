import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

function extForMime(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return "";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Belum masuk." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "Pilih file gambar terlebih dahulu." }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ message: "Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: "Ukuran file maksimal 4 MB." }, { status: 400 });
    }

    const ext = extForMime(file.type);
    if (!ext) {
      return NextResponse.json({ message: "Tipe file tidak valid." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${crypto.randomUUID()}${ext}`;
    const relativePublic = path.join("public", "uploads", "products");
    const dir = path.join(process.cwd(), relativePublic);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);

    const url = `/uploads/products/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengunggah gambar." }, { status: 500 });
  }
}
