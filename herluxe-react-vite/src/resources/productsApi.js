// Gọi API MindX cho resource "products" theo đúng tài liệu /instruction:
//   GET    /api/resources/products              -> lấy tất cả
//   POST   /api/resources/products              -> thêm 1 bản ghi (body = 1 sản phẩm)
//   PUT    /api/resources/products/{_id}        -> sửa 1 bản ghi
//   DELETE /api/resources/products/{_id}        -> xóa 1 bản ghi
// Lưu ý: PUT /api/resources/products (không có _id) chỉ để ĐỔI TÊN resource, không dùng để ghi dữ liệu.

const BASE =
  import.meta.env?.VITE_MINDX_API_BASE_URL ||
  "https://mindx-mockup-server.vercel.app/api/resources";
const KEY = import.meta.env?.VITE_MINDX_API_KEY || "6ab3d52e3a04ea4a097e4dba";

const url = (suffix = "") => `${BASE}/products${suffix}?apiKey=${KEY}`;

// Các field chỉ dùng nội bộ / do server thêm, không gửi ngược lên.
const INTERNAL = ["_id", "_docId", "_grouped", "createdAt", "updatedAt", "__v"];
const clean = (product) =>
  Object.fromEntries(
    Object.entries(product).filter(([key]) => !INTERNAL.includes(key)),
  );

// Chuẩn hóa sản phẩm đọc từ API (thiếu field thì điền mặc định để giao diện không lỗi).
export const normalizeProduct = (product, index = 0) => {
  const description = String(
    product.description || product.shortDescription || "",
  ).trim();
  return {
    ...product,
    id: product.id || `product-${index + 1}`,
    tag: product.tag ?? "New", // "" nghĩa là không gắn thẻ; chỉ sản phẩm chưa có field tag mới mặc định "New"
    price: Number(product.price) || 0,
    stock: Number(product.stock ?? 0),
    shortDescription:
      product.shortDescription ||
      description.split(/[.!?]/)[0] ||
      "HerLuxe beauty essential.",
    description: description || "HerLuxe beauty essential.",
  };
};

async function request(method, target, body) {
  const response = await fetch(target, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* response không có JSON */
  }
  if (!response.ok)
    throw new Error(
      payload?.message || `Products API returned ${response.status}`,
    );
  return payload;
}

/**
 * Lấy toàn bộ sản phẩm. Mỗi sản phẩm kèm `_id` (id bản ghi trên server) để sửa/xóa.
 * Bản ghi cũ dạng "gộp" (một bản ghi chứa key "0","1",...) được tách ra và đánh dấu `_grouped: true`.
 */
export async function fetchProducts() {
  const payload = await request("GET", url());
  const docs = Array.isArray(payload?.data?.data) ? payload.data.data : [];
  const grouped = [];
  const single = [];
  docs.forEach((doc) => {
    const numericKeys = Object.keys(doc).filter((key) => /^\d+$/.test(key));
    if (numericKeys.length) {
      numericKeys.forEach((key) =>
        grouped.push({ ...clean(doc[key]), _docId: doc._id, _grouped: true }),
      );
    } else {
      single.push({ ...clean(doc), _id: doc._id });
    }
  });
  // Trùng id thì giữ bản đứng sau; bản đơn lẻ xếp sau nên được ưu tiên hơn bản gộp.
  const byId = new Map();
  [...grouped, ...single].forEach((item) => {
    if (!item.id) return;
    byId.delete(item.id);
    byId.set(item.id, item);
  });
  return [...byId.values()].map(normalizeProduct);
}

export const createProduct = (product) =>
  request("POST", url(), clean(product));

export async function updateProduct(product) {
  // Sản phẩm nằm trong bản ghi gộp không sửa riêng được -> tạo bản ghi đơn lẻ mới (bản mới được ưu tiên khi đọc).
  if (product._grouped || !product._id) return createProduct(product);
  return request("PUT", url(`/${product._id}`), clean(product));
}

export async function deleteProduct(product) {
  if (product._grouped || !product._id) {
    throw new Error(
      "This product is stored in a grouped record. Run migrateGroupedProducts() once, then delete it.",
    );
  }
  return request("DELETE", url(`/${product._id}`));
}

/**
 * Chạy MỘT LẦN: tách mọi bản ghi gộp thành từng bản ghi riêng rồi xóa bản ghi gộp cũ.
 * Trả về số sản phẩm đã tách.
 */
let migrating = null;
export function migrateGroupedProducts() {
  if (!migrating) {
    migrating = (async () => {
      const payload = await request("GET", url());
      const docs = Array.isArray(payload?.data?.data) ? payload.data.data : [];
      const groupedDocs = docs.filter((doc) =>
        Object.keys(doc).some((key) => /^\d+$/.test(key)),
      );
      const existingIds = new Set(
        docs.filter((doc) => !groupedDocs.includes(doc)).map((doc) => doc.id),
      );
      let moved = 0;
      for (const doc of groupedDocs) {
        const keys = Object.keys(doc).filter((key) => /^\d+$/.test(key));
        for (const key of keys) {
          const item = clean(doc[key]);
          if (item.id && existingIds.has(item.id)) continue; // đã có bản đơn lẻ mới hơn
          await createProduct(item);
          if (item.id) existingIds.add(item.id);
          moved += 1;
        }
        await request("DELETE", url(`/${doc._id}`));
      }
      return moved;
    })().finally(() => {
      migrating = null;
    });
  }
  return migrating;
}
