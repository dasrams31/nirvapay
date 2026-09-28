import QRCode from "qrcode";

export const DEFAULT_STATIC_QRIS =
  "00020101021126610014COM.GO-JEK.WWW01189360091433293320900210G3293320900303UMI51440014ID.CO.QRIS.WWW0215ID10265450816590303UMI5204899953033605802ID5925Aeternum Kreasikan Bersam6006SLEMAN61055558462140703A0111036216304D2F5";

/**
 * Calculates CRC16-CCITT (Polynomial 0x1021, Initial 0xFFFF) for EMVCo standard.
 */
export function crc16Ccitt(str: string): string {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Converts Static EMVCo QRIS to Dynamic QRIS by injecting:
 * Tag 01 -> 12 (Dynamic)
 * Tag 54 -> Transaction Amount
 * Tag 63 -> Recomputed CRC16 Checksum
 */
export function makeDynamicQris(amount: number, staticQris?: string): string {
  let raw = (staticQris || DEFAULT_STATIC_QRIS).trim();

  // Strip old Tag 63 if present
  if (raw.length > 8 && raw.slice(-8, -4) === "6304") {
    raw = raw.slice(0, -8);
  }

  // Tag 01: Change from 11 (Static) to 12 (Dynamic)
  if (raw.startsWith("000201010211")) {
    raw = "000201010212" + raw.slice(12);
  }

  // Tag 54: Amount injection
  const amtStr = Math.round(amount).toString();
  const tag54 = `54${amtStr.length.toString().padStart(2, "0")}${amtStr}`;

  const pos58 = raw.indexOf("5802");
  let payload = "";
  if (pos58 !== -1) {
    payload = raw.slice(0, pos58) + tag54 + raw.slice(pos58);
  } else {
    payload = raw + tag54;
  }

  const payloadToSign = payload + "6304";
  const checksum = crc16Ccitt(payloadToSign);
  return payloadToSign + checksum;
}

export async function generateQrPngDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export async function generateQrPngBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
  });
}
