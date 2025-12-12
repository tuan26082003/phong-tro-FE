// Helper function để tạo URL ảnh từ backend
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://placehold.co/900x600?text=No+Image";
  
  // Nếu đã có http:// hoặc https:// thì return luôn
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu không thì thêm localhost:8080
  const baseUrl = 'http://localhost:8080';
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

// Helper cho nhiều ảnh
export const getImageUrls = (images) => {
  if (!images || images.length === 0) {
    return ["https://placehold.co/900x600?text=No+Image"];
  }
  return images.map(img => getImageUrl(img));
};
