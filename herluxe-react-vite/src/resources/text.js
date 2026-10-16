// Chuẩn hóa chuỗi để tìm kiếm không phân biệt dấu tiếng Việt và hoa/thường.
// "Sữa rửa mặt" -> "sua rua mat", "Đẹp" -> "dep"
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// true nếu `text` chứa `query` (bỏ qua dấu, hoa/thường). Query rỗng = khớp tất cả.
export function matchesSearch(text, query) {
  const q = normalizeText(query);
  return !q || normalizeText(text).includes(q);
}
