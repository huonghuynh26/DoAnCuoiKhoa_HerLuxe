// Gọi API MindX cho resource "orders" (cần tạo resource này trên trang MindX trước).
//   GET  /api/resources/orders           -> lấy tất cả đơn
//   POST /api/resources/orders           -> thêm 1 đơn (body = 1 đơn)
//   PUT  /api/resources/orders/{_id}     -> sửa 1 đơn (ví dụ đổi trạng thái)

const BASE =
  import.meta.env?.VITE_MINDX_API_BASE_URL ||
  "https://mindx-mockup-server.vercel.app/api/resources";
const KEY = import.meta.env?.VITE_MINDX_API_KEY || "6ab3d52e3a04ea4a097e4dba";

const url = (suffix = "") => `${BASE}/orders${suffix}?apiKey=${KEY}`;

const INTERNAL = ["_id", "_docId", "_grouped", "__v"];
const clean = (order) =>
  Object.fromEntries(
    Object.entries(order).filter(([key]) => !INTERNAL.includes(key)),
  );

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
  if (!response.ok) {
    const hint =
      response.status === 500 &&
      /not found resource/i.test(payload?.message || "")
        ? 'The "orders" resource does not exist on MindX yet. Create it on the MindX database page first.'
        : null;
    throw new Error(
      hint || payload?.message || `Orders API returned ${response.status}`,
    );
  }
  return payload;
}

const normalizeOrder = (order) => ({
  ...order,
  items: Array.isArray(order.items) ? order.items : [],
  total: Number(order.total) || 0,
  status: order.status || "pending",
});

/** Lấy mọi đơn, mới nhất trước. Mỗi đơn kèm `_id` để cập nhật. */
export async function fetchOrders() {
  const payload = await request("GET", url());
  const docs = Array.isArray(payload?.data?.data) ? payload.data.data : [];
  const orders = [];
  docs.forEach((doc) => {
    const numericKeys = Object.keys(doc).filter((key) => /^\d+$/.test(key));
    if (numericKeys.length)
      numericKeys.forEach((key) =>
        orders.push({ ...doc[key], _docId: doc._id, _grouped: true }),
      );
    else orders.push({ ...doc });
  });
  return orders
    .filter((order) => order.id)
    .map(normalizeOrder)
    .sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    );
}

export const createOrder = (order) => request("POST", url(), clean(order));

export function updateOrder(order) {
  if (!order._id)
    throw new Error(
      "This order has no API id, so it cannot be updated on MindX.",
    );
  return request("PUT", url(`/${order._id}`), clean(order));
}
