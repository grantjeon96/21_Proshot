import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const clientFalKey = req.headers.get("x-fal-key");
    
    // Configure dynamically per request using client's key or env key
    fal.config({
      credentials: clientFalKey || process.env.FAL_KEY,
    });

    const body = await req.json();
    const { imageBase64, style } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "이미지 데이터가 누락되었습니다. 사진을 다시 업로드해 주세요." },
        { status: 400 }
      );
    }

    // Strip the data-URL prefix (e.g. "data:image/jpeg;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // Wrap the buffer in a Blob with mime type image/jpeg
    const blob = new Blob([buffer], { type: "image/jpeg" });

    // Upload via fal.storage.upload() to get a reference URL
    let reference_image_url: string;
    try {
      reference_image_url = await fal.storage.upload(blob);
    } catch (uploadError) {
      console.error("Fal storage upload error:", uploadError);
      return NextResponse.json(
        { error: "AI 클라우드에 이미지 업로드를 실패했습니다. 인터넷 연결을 확인해 주세요." },
        { status: 500 }
      );
    }

    // Map style to an English prompt (corporate/studio/outdoor professional headshot)
    let prompt = "";
    if (style === "corporate") {
      prompt = "A high-quality, professional corporate business headshot of a person, clean white background, even studio lighting, looking directly at the camera, wearing professional business suit attire, 8k resolution, crisp detail";
    } else if (style === "studio") {
      prompt = "A classic clean professional studio portrait headshot of a person, solid neutral light background, soft flattering studio lighting, looking directly at the camera, professional presentation, highly detailed, 8k resolution";
    } else if (style === "outdoor") {
      prompt = "A professional headshot of a person in outdoor natural lighting, soft daylight, slightly blurred natural park background, shallow depth of field, looking directly at the camera, professional clothing, highly detailed";
    } else {
      prompt = "A high-quality, professional corporate business headshot of a person, clean white background, even studio lighting, looking directly at the camera, 8k resolution";
    }

    // Call fal.subscribe for fal-ai/flux-pulid
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
        prompt,
        reference_image_url,
        image_size: "portrait_4_3",
        num_inference_steps: 20,
        guidance_scale: 4,
        id_weight: 1,
        negative_prompt: "blurry, low quality, distorted face, watermark, text"
      }
    }) as { data?: { images?: Array<{ url: string }> } };

    if (!result?.data?.images?.[0]?.url) {
      throw new Error("No image URL returned from Fal subscription");
    }

    return NextResponse.json({ imageUrl: result.data.images[0].url });
  } catch (error: unknown) {
    console.error("Generation route error:", error);
    // Wrap in try/catch; ALL error messages to the client must be in Korean; never leak the key or raw errors
    return NextResponse.json(
      { error: "AI 사진 생성 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
