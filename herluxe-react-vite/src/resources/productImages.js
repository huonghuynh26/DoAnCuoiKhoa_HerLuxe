// Thư viện ảnh nhiều tấm cho sản phẩm.
//
// Cách lấy danh sách ảnh của 1 sản phẩm:
//  1. Nếu sản phẩm có mảng `images` (do admin thêm) -> dùng đúng mảng đó.
//  2. Nếu không, với các sản phẩm đã có sẵn file cushion1.png / cushion2.png trong cùng thư mục với ảnh cũ
//     -> bộ ảnh = [cushion.png, cushion1.png, cushion2.png] (chỉ lấy file thật sự tồn tại).
//     Ảnh mặc định là cushion.png; khi hover hiện cushion2.png.
//  3. Còn lại -> chỉ dùng `product.image`.
import { useEffect, useState } from "react";

// Các sản phẩm đã có thêm ảnh 1 / 2 (tên file gốc, không gồm số và đuôi)
const STEMS_WITH_EXTRA_IMAGES = {
  cushion: ["cushion"],
  eyelash: ["eyelash"],
  brush: ["brush"],
  lipoil: ["lipoil"],
  lipscrub: ["lipscrub"],
  bodylotion: ["bodylotion"],
  bodyoil: ["bodyoil"],
  bodyscrub: ["bodyscrub"],
  footcream: ["footcream"],
  handcream: ["handcream"],
  sunscreen: ["sunscreen", "sunsreen"],
  sunsreen: ["sunsreen", "sunscreen"], // file cũ bị gõ sai chính tả
  facialspray: ["facialspray"],
  micellar: ["micellar"],
};
const EXTRA_COUNT = 2;

const resolved = new Map(); // ảnh gốc -> danh sách ảnh đã kiểm tra
const inflight = new Map();
const probeCache = new Map();

const probe = (src) => {
  if (src.startsWith("data:")) return Promise.resolve(true);
  if (probeCache.has(src)) return probeCache.get(src);
  const promise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
  probeCache.set(src, promise);
  return promise;
};

const declaredImages = (product) =>
  Array.isArray(product?.images) ? product.images.filter(Boolean) : [];

// Trả về danh sách ứng viên theo từng vị trí: [[alias1.png, alias2.png], [..2..]] hoặc null
function numberedCandidates(image) {
  const match = /^(.*\/)([^/]+?)(\d*)(\.[A-Za-z0-9]+)$/.exec(image || "");
  if (!match) return null;
  const [, dir, stem, , ext] = match;
  const aliases = STEMS_WITH_EXTRA_IMAGES[stem.toLowerCase()];
  if (!aliases) return null;
  return Array.from({ length: EXTRA_COUNT }, (_, i) =>
    aliases.map((alias) => `${dir}${alias}${i + 1}${ext}`),
  );
}

function resolveFromImage(image) {
  if (!image) return Promise.resolve([]);
  if (resolved.has(image)) return Promise.resolve(resolved.get(image));
  if (inflight.has(image)) return inflight.get(image);
  const slots = numberedCandidates(image);
  const task = (async () => {
    if (!slots) return [image];
    const found = (await probe(image)) ? [image] : [];
    for (const options of slots) {
      for (const src of options) {
        if (await probe(src)) {
          found.push(src);
          break;
        }
      }
    }
    return found.length ? found : [image];
  })().then((list) => {
    resolved.set(image, list);
    inflight.delete(image);
    return list;
  });
  inflight.set(image, task);
  return task;
}

/** Dùng bất đồng bộ (ví dụ trong Admin khi mở form sửa). */
export async function resolveGallery(product) {
  const declared = declaredImages(product);
  if (declared.length) return declared;
  return resolveFromImage(product?.image);
}

/** Hook: trả về danh sách ảnh của sản phẩm (luôn có ít nhất ảnh chính nếu có). */
export function useGallery(product) {
  const image = product?.image;
  const hasDeclared = declaredImages(product).length > 0;
  const [, refresh] = useState(0);
  useEffect(() => {
    if (hasDeclared || !image || resolved.has(image)) return undefined;
    let alive = true;
    resolveFromImage(image).then(() => alive && refresh((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [hasDeclared, image]);
  if (hasDeclared) return declaredImages(product);
  return resolved.get(image) || (image ? [image] : []);
}

/** Ảnh hiện khi hover: với ảnh tự tìm thì là ảnh "2" (ảnh cuối); với ảnh admin thêm thì là ảnh thứ hai. */
export function hoverImageOf(product, gallery) {
  if (gallery.length < 2) return null;
  if (declaredImages(product).length) return gallery[1];
  return gallery.length > 2 ? gallery[gallery.length - 1] : gallery[1];
}
