import { useEffect, useState } from "react";
import { Upload, Modal, Button, message } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";

const API = "/api/images";

export default function OwnerImage() {
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState({ open: false, url: "" });
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteFile, setDeleteFile] = useState(null);

  const loadImages = async () => {
    try {
      const res = await axiosClient.get(API);
      setImages(res.data.data || []);
    } catch (err) {
      console.error("LOAD IMAGES ERROR:", err);
      message.error("Không tải được danh sách ảnh");
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // =========================
  // UPLOAD FILE ĐÚNG CÁCH
  // =========================
  const uploadFile = async (file) => {
    const form = new FormData();
    form.append("files", file);

    try {
      const res = await axiosClient.post(`${API}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("UPLOAD RESPONSE:", res.data);

      message.success("Upload thành công");
      loadImages();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      if (err.response) {
        console.error("SERVER:", err.response.data);
        message.error(err.response.data.message || "Upload thất bại");
      } else if (err.request) {
        console.error("NO RESPONSE:", err.request);
        message.error("Không nhận được phản hồi từ server");
      } else {
        console.error("REQUEST ERROR:", err.message);
        message.error("Không gửi được yêu cầu upload");
      }
    }
  };

  const beforeUpload = (file) => {
    uploadFile(file);
    return false; // BẮT BUỘC
  };

  const openDelete = (fileName) => {
    setDeleteFile(fileName);
    setModalDeleteOpen(true);
  };

  // =========================
  // XOÁ ẢNH
  // =========================
  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API}/${deleteFile}`);
      message.success("Đã xoá ảnh");
      setModalDeleteOpen(false);
      loadImages();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      message.error("Không xoá được ảnh");
    }
  };

  return (
    <div>
      <h3>Quản lý hình ảnh</h3>

      <Upload
        multiple
        listType="picture-card"
        beforeUpload={beforeUpload}
        showUploadList={false}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Tải ảnh</div>
        </div>
      </Upload>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {images.map((img) => (
          <div
            key={img}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 10,
              textAlign: "center",
            }}
          >
            <img
              alt=""
              src={`${API}/file/${img}`}
              style={{
                width: "100%",
                height: 130,
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
                marginBottom: 8,
              }}
              onClick={() =>
                setPreview({ open: true, url: `${API}/file/${img}` })
              }
            />

            <Button
              danger
              icon={<DeleteOutlined />}
              style={{ width: "100%" }}
              onClick={() => openDelete(img)}
            >
              Xoá
            </Button>
          </div>
        ))}
      </div>

      <Modal
        open={preview.open}
        footer={null}
        onCancel={() => setPreview({ open: false, url: "" })}
      >
        <img alt="" src={preview.url} style={{ width: "100%" }} />
      </Modal>

      <Modal
        open={modalDeleteOpen}
        onCancel={() => setModalDeleteOpen(false)}
        onOk={handleDelete}
        okText="Xoá"
        okType="danger"
        title="Xoá hình ảnh"
      >
        <ExclamationCircleOutlined style={{ color: "red", marginRight: 8 }} />
        Bạn muốn xoá ảnh:
        <br />
        <strong>{deleteFile}</strong>
      </Modal>
    </div>
  );
}
