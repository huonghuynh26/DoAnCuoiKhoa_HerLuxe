import { useRef, useState } from "react";
import "../styles/product-image-field.css";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // file gốc tối đa 5 MB
const MAX_IMAGE_SIDE = 800; // cạnh dài nhất sau khi thu nhỏ (px)
const MAX_ENCODED_LENGTH = 1_200_000; // chuỗi base64 sau khi nén, tránh làm đầy localStorage/API

// Đọc file ảnh, thu nhỏ + nén bằng canvas rồi trả về data URL để lưu thẳng vào product.image.
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      return reject(new Error("Please choose a PNG, JPG or WebP image."));
    if (file.size > MAX_IMAGE_BYTES)
      return reject(new Error("This image is larger than 5 MB."));
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(
        1,
        MAX_IMAGE_SIDE / Math.max(image.width, image.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas
        .getContext("2d")
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      // JPEG giữ JPEG; PNG/WebP chuyển WebP để giữ nền trong suốt mà vẫn nhẹ.
      const dataUrl =
        file.type === "image/jpeg"
          ? canvas.toDataURL("image/jpeg", 0.85)
          : canvas.toDataURL("image/webp", 0.85);
      if (dataUrl.length > MAX_ENCODED_LENGTH)
        return reject(
          new Error(
            "The image is still too large after resizing. Please use a smaller one.",
          ),
        );
      resolve(dataUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This file could not be read as an image."));
    };
    image.src = objectUrl;
  });
}

export default function ProductImageField({ value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isUploaded = String(value || "").startsWith("data:");

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await readImageFile(file));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="product-image-field">
      <span className="product-image-label">Product image</span>
      <div className="product-image-row">
        <div className="product-image-preview">
          {value ? (
            <img src={value} alt="Product preview" />
          ) : (
            <i className="fa-regular fa-image"></i>
          )}
        </div>
        <div className="product-image-controls">
          <div className="product-image-actions">
            <button
              type="button"
              className="button button-outline"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <i className="fa-solid fa-upload"></i>{" "}
              {busy ? "Processing..." : value ? "Change image" : "Choose image"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              hidden
            />
          </div>
          <small>
            PNG, JPG or WebP up to 5 MB. Large images are resized automatically.
          </small>
          {error && (
            <small className="product-image-error" role="alert">
              {error}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}
