import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyAdmin } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Only logged-in admins can upload images
    const isAdmin = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 },
      );
    }

    // Accept images only
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Please upload an image file" },
        { status: 400 },
      );
    }

    // Limit image size to 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 5 MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "gobi-brands/products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("Cloudinary upload failed"));
            }
          },
        );

        uploadStream.end(buffer);
      },
    );

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      { success: false, message: "Image upload failed" },
      { status: 500 },
    );
  }
}
