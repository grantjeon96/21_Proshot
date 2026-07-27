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

    // Map style to an English prompt – natural matte skin, soft diffused studio lighting, zero oily shine
    const sharpCore =
      "authentic studio passport photograph, natural matte skin, zero oily shine, soft diffused softbox lighting, realistic skin pores, even natural illumination across face, crisp eye detail, 8k resolution portrait";

    let prompt = "";
    if (style === "corporate") {
      prompt = `A realistic Korean passport ID photograph of a person, ${sharpCore}, solid pure white background, front-facing neutral expression, wearing dark professional business suit with tie, shoulders visible and level`;
    } else if (style === "studio") {
      prompt = `A realistic Korean passport ID photograph of a person, ${sharpCore}, solid pure white background, front-facing neutral expression, soft studio lighting, shoulders visible and level`;
    } else if (style === "outdoor") {
      prompt = `A realistic portrait photograph of a person, ${sharpCore}, natural soft daylight, front-facing, professional smart casual attire, shoulders visible and level`;
    } else {
      prompt = `A realistic Korean passport ID photograph of a person, ${sharpCore}, solid pure white background, front-facing neutral expression, soft studio lighting, shoulders visible and level`;
    }

    // Call fal.subscribe for fal-ai/flux-pulid
    // - guidance_scale 2.5: eliminates artificial 3D plastic look & specular glare
    // - true_cfg 1.2: natural shadow gradients on skin
    // - id_weight 0.80: balanced identity match with authentic skin texture
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
        prompt,
        reference_image_url,
        image_size: "portrait_4_3",
        num_inference_steps: 35,
        guidance_scale: 2.5,
        true_cfg: 1.2,
        id_weight: 0.80,
        negative_prompt: "oily skin, shiny skin, specular glare, forehead shine, oily forehead, plastic skin, cgi, 3d render, artificial lighting, harsh reflections, glossy skin, oversaturated, blurry, out of focus, unfocused, soft focus, bokeh, depth of field, gaussian blur, distortion, watermark, text, bad anatomy, deformed"
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
