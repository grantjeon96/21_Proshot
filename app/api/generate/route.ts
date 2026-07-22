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

    // Try uploading via fal.storage.upload(), fallback to base64 Data URL if upload times out
    let reference_image_url = imageBase64;
    try {
      reference_image_url = await fal.storage.upload(blob);
    } catch (uploadError: any) {
      console.warn("Fal storage upload failed/timed out, falling back to data URL:", uploadError?.message || uploadError);
      // Keep reference_image_url as imageBase64 data URL
    }

    // Map style to an English prompt (corporate/studio/outdoor professional headshot)
    let prompt = "";
    if (style === "corporate") {
      prompt = "A razor-sharp, ultra-realistic professional corporate business passport headshot of a person, sharp focus on face, crisp eye detail, clean solid white background, even studio lighting, looking directly at the camera, wearing dark professional business suit attire, 8k resolution, photorealistic, highly detailed skin texture";
    } else if (style === "studio") {
      prompt = "A razor-sharp, ultra-detailed clean professional studio portrait passport photo of a person, sharp focus on face, clear eyes, solid neutral light gray background, balanced studio portrait lighting, looking directly at the camera, professional presentation, 8k resolution, photorealistic";
    } else if (style === "outdoor") {
      prompt = "A sharp focus, highly detailed professional portrait headshot of a person in natural lighting, clear crisp facial features, looking directly at the camera, professional smart casual attire, 8k resolution, photorealistic, sharp portrait";
    } else {
      prompt = "A razor-sharp, ultra-realistic professional passport headshot of a person, sharp focus on face, clean solid white background, even studio lighting, looking directly at the camera, 8k resolution, photorealistic";
    }

    // Call fal.subscribe for fal-ai/flux-pulid with optimized parameters for maximum sharpness
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
        prompt,
        reference_image_url,
        image_size: "portrait_4_3",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        id_weight: 0.92,
        negative_prompt: "blurry, out of focus, soft focus, bokeh, depth of field blur, fuzzy, low resolution, noise, distortion, watermark, text, bad anatomy, deformed eyes, double chin"
      }
    }) as { data?: { images?: Array<{ url: string }> } };

    if (!result?.data?.images?.[0]?.url) {
      throw new Error("No image URL returned from Fal subscription");
    }

    return NextResponse.json({ imageUrl: result.data.images[0].url });
  } catch (error: any) {
    console.error("Generation route error:", error);
    const detail = error?.body?.detail || error?.message || "";
    if (error?.status === 403 || detail.includes("Exhausted balance")) {
      return NextResponse.json(
        { error: "fal.ai API 계정의 잔액(크레딧)이 소진되었습니다. fal.ai/dashboard/billing 에서 잔액을 충전해 주세요." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "AI 사진 생성 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
