import sharp from "sharp";

export const OUTPUT_PRESETS = [
  { kind: "story" as const, width: 1080, height: 1920 },
  { kind: "post" as const, width: 1080, height: 1080 },
];

export const processWithOverlay = async (
  baseInput: Buffer,
  overlayInput: Buffer,
  width: number,
  height: number,
  quality: number,
) => {
  const resizedBase = await sharp(baseInput)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .toBuffer();

  const resizedOverlay = await sharp(overlayInput)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  return sharp(resizedBase)
    .composite([{ input: resizedOverlay, blend: "over" }])
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
};
