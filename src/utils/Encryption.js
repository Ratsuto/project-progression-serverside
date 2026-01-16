import crypto from 'crypto';
import {writeLog} from "./Logger.js";
import CryptoJS from 'crypto-js';

const AES_PASSWORD = Buffer.from(process.env.AES_PASSWORD || "0A2B2C809EBC3A05D90231CA07B8AAC1", "utf8");
const SECRET_KEY = process.env.API_SECRET;

export function protectData(strData) {
    writeLog('[PROCESS] protectData processing...');

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
        writeLog('[PROCESS] protectData process completed');
        return encrypted.toString("hex").toUpperCase(); // Java hex is usually uppercase
    } catch (err) {
        writeLog(`[ERROR] ❌ ProtectData error: ${err}`);
        writeLog('[PROCESS] protectData process failed');
        writeLog('[RESULT] Returning null');
        return null;
    } finally {
        writeLog('[PROCESS] protectData End');
    }
}

export function unprotectData(hexData) {
    writeLog('[PROCESS] unprotectData processing...');

    try {
        if (!hexData) return null;

        const key = AES_PASSWORD.slice(0, 16);
        const decipher = crypto.createDecipheriv("aes-128-ecb", key, null);
        decipher.setAutoPadding(true);

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(hexData, "hex")),
            decipher.final(),
        ]);

        writeLog('[PROCESS] unprotectData process completed');
        return decrypted.toString("utf8");
    } catch (err) {
        writeLog(`[ERROR] ❌ unprotectData error: ${err}`);
        writeLog('[PROCESS] unprotectData process failed');
        writeLog('[RESULT] Returning null');
        return null;
    } finally {
        writeLog('[END] unprotectData');
    }
}

export function decryptPayload(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}