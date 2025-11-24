import { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button } from "antd";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const API = "/api/bank-accounts";

const BANK_LIST = [
  {
    bank_code: "VCB",
    bank_name: "Ngân hàng TMCP Ngoại Thương Việt Nam",
    bank_short: "Vietcombank",
  },
  {
    bank_code: "BIDV",
    bank_name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    bank_short: "BIDV",
  },
  {
    bank_code: "VTB",
    bank_name: "Ngân hàng TMCP Công thương Việt Nam",
    bank_short: "Vietinbank",
  },
  {
    bank_code: "MB",
    bank_name: "Ngân hàng TMCP Quân đội",
    bank_short: "MBBank",
  },
  { bank_code: "ACB", bank_name: "Ngân hàng TMCP Á Châu", bank_short: "ACB" },
  {
    bank_code: "TCB",
    bank_name: "Ngân hàng TMCP Kỹ Thương Việt Nam",
    bank_short: "Techcombank",
  },
  {
    bank_code: "VPB",
    bank_name: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
    bank_short: "VPBank",
  },
  {
    bank_code: "TPB",
    bank_name: "Ngân hàng TMCP Tiên Phong",
    bank_short: "TPBank",
  },
  {
    bank_code: "OCB",
    bank_name: "Ngân hàng TMCP Phương Đông",
    bank_short: "OCB",
  },
  { bank_code: "VIB", bank_name: "Ngân hàng TMCP Quốc tế", bank_short: "VIB" },
  {
    bank_code: "HDB",
    bank_name: "Ngân hàng TMCP Phát triển TPHCM",
    bank_short: "HDBank",
  },
  { bank_code: "SCB", bank_name: "Ngân hàng TMCP Sài Gòn", bank_short: "SCB" },
  {
    bank_code: "EIB",
    bank_name: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam",
    bank_short: "Eximbank",
  },
];

export default function OwnerBank() {
  const [form] = Form.useForm();
  const [existingId, setExistingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user?.id;

  const loadBank = async () => {
    try {
      const res = await axiosClient.get(`${API}/${userId}`);
      if (res.data?.data) {
        setExistingId(res.data.data.id);
        form.setFieldsValue(res.data.data);
      }
    } catch (err) {
      // không có bank -> không set gì
    }
  };

  useEffect(() => {
    loadBank();
  }, []);

  const onSelectBank = (code) => {
    const bank = BANK_LIST.find((b) => b.bank_code === code);
    if (!bank) return;
    form.setFieldsValue({
      bankName: bank.bank_name,
      bankCode: bank.bank_code,
    });
  };

  const submitForm = async () => {
    const values = await form.validateFields();

    const payload = {
      ...values,
      userId,
    };

    try {
      if (existingId) {
        await axiosClient.put(`${API}/${existingId}`, payload);
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await axiosClient.post(API, payload);
        toast.success("Tạo tài khoản thành công");
      }
      loadBank();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Card title="Tài khoản ngân hàng" bordered style={{ maxWidth: 600 }}>
      <Form layout="vertical" form={form}>
        <Form.Item
          name="bankCode"
          label="Chọn ngân hàng"
          rules={[{ required: true }]}
        >
          <Select onChange={onSelectBank} placeholder="Chọn ngân hàng">
            {BANK_LIST.map((b) => (
              <Select.Option key={b.bank_code} value={b.bank_code}>
                {b.bank_short} — {b.bank_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="bankName" label="Tên ngân hàng">
          <Input readOnly />
        </Form.Item>

        <Form.Item
          name="accountNumber"
          label="Số tài khoản"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="accountName"
          label="Chủ tài khoản"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="User ID">
          <Input value={userId} readOnly />
        </Form.Item>

        <Button type="primary" onClick={submitForm} block>
          {existingId ? "Cập nhật" : "Lưu tài khoản"}
        </Button>
      </Form>
    </Card>
  );
}
