import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY_ID = "dee_class_video_encryption_key";

/**
 * Get or generate the encryption key for video files
 * Key is stored securely in device Keychain (iOS) / Keystore (Android)
 */
export const getEncryptionKey = async () => {
  try {
    // Try to get existing key
    let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);

    if (!key) {
      // Generate new key using secure random bytes
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      key = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Store key securely
      await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, key);
    }

    return key;
  } catch (error) {
    console.error("Error getting encryption key:", error);
    throw error;
  }
};

/**
 * Encrypt a file and overwrite it with encrypted content
 * @param {string} filePath - Path to the file to encrypt
 * @returns {Promise<boolean>} - Success status
 */
export const encryptFile = async (filePath) => {
  try {
    const key = await getEncryptionKey();

    // Read the file as base64
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Encrypt the content
    const encrypted = CryptoJS.AES.encrypt(fileContent, key).toString();

    // Write encrypted content back to file
    await FileSystem.writeAsStringAsync(filePath, encrypted, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return true;
  } catch (error) {
    console.error("Error encrypting file:", error);
    return false;
  }
};

/**
 * Decrypt a file to a temporary location for playback
 * @param {string} encryptedFilePath - Path to the encrypted file
 * @returns {Promise<string|null>} - Path to decrypted temp file or null on error
 */
export const decryptFileForPlayback = async (encryptedFilePath) => {
  try {
    const key = await getEncryptionKey();

    // Read the encrypted content
    const encryptedContent = await FileSystem.readAsStringAsync(
      encryptedFilePath,
      {
        encoding: FileSystem.EncodingType.UTF8,
      }
    );

    // Decrypt the content
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key);
    const decryptedBase64 = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedBase64) {
      console.error("Decryption failed - empty result");
      return null;
    }

    // Create temp file path
    const tempDir = `${FileSystem.cacheDirectory}temp_playback/`;
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

    const tempFileName = `temp_${Date.now()}.mp4`;
    const tempFilePath = `${tempDir}${tempFileName}`;

    // Write decrypted content to temp file
    await FileSystem.writeAsStringAsync(tempFilePath, decryptedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return tempFilePath;
  } catch (error) {
    console.error("Error decrypting file:", error);
    return null;
  }
};

/**
 * Clean up temporary decrypted files
 * @param {string} tempFilePath - Path to the temp file to delete
 */
export const cleanupTempFile = async (tempFilePath) => {
  try {
    if (tempFilePath) {
      const fileInfo = await FileSystem.getInfoAsync(tempFilePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
      }
    }
  } catch (error) {
    console.error("Error cleaning up temp file:", error);
  }
};

/**
 * Clean up all temporary playback files
 */
export const cleanupAllTempFiles = async () => {
  try {
    const tempDir = `${FileSystem.cacheDirectory}temp_playback/`;
    const dirInfo = await FileSystem.getInfoAsync(tempDir);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(tempDir, { idempotent: true });
    }
  } catch (error) {
    console.error("Error cleaning up temp directory:", error);
  }
};

/**
 * Check if a file is encrypted (by trying to decrypt it)
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - True if file appears to be encrypted
 */
export const isFileEncrypted = async (filePath) => {
  try {
    // Try to read as UTF8 (encrypted files are stored as encrypted strings)
    const content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // If it starts with "U2Fsd" it's likely a CryptoJS encrypted string
    return content.startsWith("U2Fsd");
  } catch (error) {
    // If reading as UTF8 fails, it's probably a binary (non-encrypted) file
    return false;
  }
};
