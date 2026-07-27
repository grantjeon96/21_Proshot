import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Configure fal credentials using server-side environment key
    fal.config({
      credentials: process.env.FAL_KEY,
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
    
    // Check FAL_KEY
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "서버에 FAL_KEY 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // Wrap in File object for fal.storage.upload compatibility in Node.js
    const file = new File([buffer], "upload.jpg", { type: "image/jpeg" });

    // Upload via fal.storage.upload() to get an HTTP URL
    let reference_image_url = "";
    try {
      reference_image_url = await fal.storage.upload(file);
    } catch (uploadError: unknown) {
      const err = uploadError as { status?: number; body?: { detail?: string }; message?: string };
      console.error("Fal storage upload error details:", uploadError);
      const detail = err?.body?.detail || err?.message || "";
      if (err?.status === 403 || detail.includes("Exhausted balance")) {
        return NextResponse.json(
          { error: "fal.ai API 계정의 잔액(크레딧)이 소진되었습니다. fal.ai/dashboard/billing 에서 잔액을 충전해 주세요." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `이미지 업로드 실패: ${detail || "AI 클라우드 이미지 업로드 통신 오류"}` },
        { status: 500 }
      );
    }

    // Map style to an English prompt – emphasise tack-sharp focus for passport use
    const sharpCore =
      "tack-sharp in-focus, 97% exact face preservation, crisp skin texture, sharp iris detail, sharp eyelash detail, high-frequency facial detail, studio strobe lighting, no post-processing blur, 8k UHD resolution, photorealistic";

    let prompt = "";
    if (style === "corporate") {
      prompt = `A professional Korean passport ID photo of a person, ${sharpCore}, solid pure white background, front-facing neutral expression, wearing dark professional business suit, shoulders visible and level`;
    } else if (style === "studio") {
      prompt = `A professional Korean passport ID photo of a person, ${sharpCore}, solid pure white background, front-facing neutral expression, even studio lighting, shoulders visible and level`;
    } else if (style === "outdoor") {
      prompt = `A professional portrait photo of a person, ${sharpCore}, natural soft lighting, front-facing, professional smart casual attire, shoulders visible and level`;
    } else {
      prompt = `A professional Korean passport ID photo of a person, ${sharpCore}, solid pure white background, front-facing neutral expression, even studio lighting, shoulders visible and level`;
    }

    // Call fal.subscribe for fal-ai/flux-pulid
    // - num_inference_steps 35: extra denoising passes for razor-sharp studio quality
    // - guidance_scale 3.5: strong prompt adherence
    // - true_cfg 2.0: classifier-free guidance for sharp edges
    // - id_weight 0.85: high identity preservation while eliminating camera lens blur from original selfie
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
        prompt,
        reference_image_url,
        image_size: "portrait_4_3",
        num_inference_steps: 35,
        guidance_scale: 3.5,
        true_cfg: 2.0,
        id_weight: 0.85,
        negative_prompt: "blurry, out of focus, unfocused, soft focus, bokeh, depth of field, gaussian blur, motion blur, lens blur, haze, foggy, fuzzy, low resolution, low quality, noise, grain, jpeg artifacts, compression artifacts, watermark, text, bad anatomy, deformed, disfigured, extra limbs"
      }
    }) as { data?: { images?: Array<{ url: string }> } };

    if (!result?.data?.images?.[0]?.url) {
      throw new Error("No image URL returned from Fal subscription");
    }

    return NextResponse.json({ imageUrl: result.data.images[0].url });
  } catch (error: unknown) {
    console.error("Generation route error:", error);
    const err = error as { status?: number; body?: { detail?: unknown }; message?: string };
    
    let detailStr = "";
    if (err?.body?.detail) {
      detailStr = typeof err.body.detail === "string" ? err.body.detail : JSON.stringify(err.body.detail);
    } else if (err?.message) {
      detailStr = err.message;
    }

    if (err?.status === 403 || detailStr.includes("Exhausted balance")) {
      return NextResponse.json(
        { error: "fal.ai API 계정의 잔액(크레딧)이 소진되었습니다. fal.ai/dashboard/billing 에서 잔액을 충전해 주세요." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: `사진 생성 실패: ${detailStr || "AI 엔진 처리 오류가 발생했습니다."}` },
      { status: 500 }
    );
  }
}
