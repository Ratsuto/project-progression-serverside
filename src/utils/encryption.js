import crypto from "crypto";

// Equivalent to your Java aes_password (must be 16 bytes for AES-128)
const AES_PASSWORD = Buffer.from(process.env.AES_PASSWORD || "0A2B2C809EBC3A05D90231CA07B8AAC1", "utf8");

export function protectData(strData) {
    try {
        if (!strData) return null;

        // Derive AES key (assuming generateKeyAES just trims to 16 bytes)
        const key = AES_PASSWORD.slice(0, 16);

        // In your Java code, there’s no IV mentioned — so probably ECB mode
        // ⚠️ ECB mode is insecure, but we’ll replicate it for compatibility.
        const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
        cipher.setAutoPadding(true);

        const encrypted = Buffer.concat([
            cipher.update(Buffer.from(strData, "utf8")),
            cipher.final(),
        ]);

        // Return as hex (like HWSignature.asHex)
        return encrypted.toString("hex").toUpperCase(); // Java hex is usually uppercase
    } catch (err) {
        console.error("❌ ProtectData error:", err);
        return null;
    }
}

export function unprotectData(hexData) {
    try {
        if (!hexData) return null;

        const key = AES_PASSWORD.slice(0, 16);
        const decipher = crypto.createDecipheriv("aes-128-ecb", key, null);
        decipher.setAutoPadding(true);

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(hexData, "hex")),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    } catch (err) {
        console.error("❌ UnprotectData error:", err);
        return null;
    }
}