import { useRef, useState } from "react";
import "../styles/product-image-field.css";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // file gốc tối đa 5 MB
const MAX_IMAGE_SIDE = 640; // cạnh dài nhất sau khi thu nhỏ (px)
const MAX_ENCODED_LENGTH = 450_000; // mỗi ảnh sau khi nén
export const MAX_GALLERY_IMAGES = 5;

// Đọc file, thu nhỏ + nén bằng canvas rồi trả về data URL.
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      return reject(
        new Error(`"${file.name}": please choose PNG, JPG or WebP.`),
      );
    if (file.size > MAX_IMAGE_BYTES)
      return reject(new Error(`"${file.name}" is larger than 5 MB.`));
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
      const dataUrl =
        file.type === "image/jpeg"
          ? canvas.toDataURL("image/jpeg", 0.82)
          : canvas.toDataURL("image/webp", 0.82);
      if (dataUrl.length > MAX_ENCODED_LENGTH)
        return reject(
          new Error(`"${file.name}" is still too large after resizing.`),
        );
      resolve(dataUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`"${file.name}" could not be read as an image.`));
    };
    image.src = objectUrl;
  });
}

/**
 * Chọn nhiều ảnh cho sản phẩm.
 * value: mảng ảnh (ảnh đầu tiên là ảnh bìa). onChange(mảngMới).
 */
export default function ProductGalleryField({ value = [], onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const images = value.filter(Boolean);
  const left = MAX_GALLERY_IMAGES - images.length;

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (files.length > left)
      setError(`You can add up to ${MAX_GALLERY_IMAGES} images per product.`);
    setBusy(true);
    const added = [];
    const problems = [];
    for (const file of files.slice(0, Math.max(0, left))) {
      try {
        added.push(await readImageFile(file));
      } catch (uploadError) {
        problems.push(uploadError.message);
      }
    }
    if (added.length) onChange([...images, ...added]);
    if (problems.length) setError(problems.join(" "));
    setBusy(false);
  };

  const remove = (index) => onChange(images.filter((_, i) => i !== index));
  const move = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="product-image-field product-gallery-field">
      <span className="product-image-label">
        Product images{" "}
        <em>
          ({images.length}/{MAX_GALLERY_IMAGES})
        </em>
      </span>
      <div className="gallery-field-grid">
        {images.map((src, index) => (
          <div
            className={`gallery-field-item ${index === 0 ? "is-cover" : ""}`}
            key={`${index}-${src.slice(-24)}`}
          >
            <img src={src} alt={`Product ${index + 1}`} />
            {index === 0 && <span className="gallery-cover-badge">Cover</span>}
            <div className="gallery-field-tools">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move earlier"
                title="Move earlier"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === images.length - 1}
                aria-label="Move later"
                title="Move later"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => remove(index)}
                aria-label="Remove image"
                title="Remove"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        ))}
        {left > 0 && (
          <button
            type="button"
            className="gallery-add-tile"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <i className="fa-solid fa-plus"></i>
            <span>{busy ? "Processing..." : "Add images"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFiles}
        hidden
      />
      <small>
        PNG, JPG or WebP up to 5 MB each. The first image is the cover; the
        second shows when customers hover the product.
      </small>
      {error && (
        <small className="product-image-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
