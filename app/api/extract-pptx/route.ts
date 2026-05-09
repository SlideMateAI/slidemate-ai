import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs";

function collectText(value: unknown): string[] {
  const results: string[] = [];

  if (typeof value === "string") {
    if (value.trim()) results.push(value.trim());
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      results.push(...collectText(item));
    }
    return results;
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    for (const [key, childValue] of Object.entries(objectValue)) {
      if (key === "a:t") {
        results.push(...collectText(childValue));
      } else {
        results.push(...collectText(childValue));
      }
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No PowerPoint file was uploaded." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pptx")) {
      return NextResponse.json(
        { error: "Only .pptx files are supported right now." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const parser = new XMLParser({
      ignoreAttributes: false,
      textNodeName: "#text",
    });

    const slideFiles = Object.keys(zip.files)
      .filter((fileName) =>
        /^ppt\/slides\/slide\d+\.xml$/.test(fileName)
      )
      .sort((a, b) => {
        const aNumber = Number(a.match(/slide(\d+)\.xml/)?.[1] || 0);
        const bNumber = Number(b.match(/slide(\d+)\.xml/)?.[1] || 0);
        return aNumber - bNumber;
      });

    const slides = [];

    for (const slideFile of slideFiles) {
      const xml = await zip.files[slideFile].async("text");
      const parsed = parser.parse(xml);
      const textItems = collectText(parsed);

      const slideNumber = Number(slideFile.match(/slide(\d+)\.xml/)?.[1] || 0);

      slides.push({
        slideNumber,
        text: textItems.join("\n"),
      });
    }

    const extractedText = slides
      .map((slide) => `Slide ${slide.slideNumber}:\n${slide.text}`)
      .join("\n\n");

    return NextResponse.json({
      slides,
      extractedText,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to extract PowerPoint text.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
