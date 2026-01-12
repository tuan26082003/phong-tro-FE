import { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, Modal, Empty, Descriptions } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const API = "/api/bank-accounts";

const BANK_LIST = [
  { bin: "970436", name: "Vietcombank" },
  { bin: "970407", name: "Techcombank" },
  { bin: "970415", name: "VietinBank" },
  { bin: "970418", name: "BIDV" },
  { bin: "970422", name: "MB Bank" },
  { bin: "970416", name: "ACB" },
  { bin: "970432", name: "VPBank" },
  { bin: "970437", name: "HDBank" },
  { bin: "970403", name: "Sacombank" },
  { bin: "970423", name: "TPBank" },
  { bin: "970441", name: "VIB" },
  { bin: "970448", name: "OCB" },
  { bin: "970431", name: "Eximbank" },
  { bin: "970426", name: "MSB" },
  { bin: "970429", name: "SCB" },
  { bin: "970443", name: "SHB" },
  { bin: "970425", name: "ABBANK" },
  { bin: "970452", name: "KienLongBank" },
  { bin: "970449", name: "LienVietPostBank" },
  { bin: "970428", name: "Nam A Bank" },
  { bin: "970440", name: "SeABank" },
  { bin: "970433", name: "VietBank" },
  { bin: "970430", name: "PGBank" },
  { bin: "970454", name: "BaoVietBank" },
  { bin: "970442", name: "Agribank" },
  { bin: "970405", name: "UOB Vietnam" },
  { bin: "970457", name: "Public Bank Vietnam" },
  { bin: "970438", name: "NCB" },
  { bin: "970439", name: "VietCapitalBank" },
  { bin: "970421", name: "VRB" },
  { bin: "970414", name: "SaigonBank" },
  { bin: "970458", name: "Shinhan Bank" },
  { bin: "970408", name: "OceanBank" },
  { bin: "970412", name: "GPBank" },
];

export default function OwnerBank() {
  const [form] = Form.useForm();
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user?.id;

  const loadBank = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API);
      
      if (res.data?.data) {
        setBankAccount(res.data.data);
      } else {
        setBankAccount(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setBankAccount(null);
      } else {
        toast.error("Không thể tải thông tin tài khoản");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBank();
  }, []);

  const openCreateModal = () => {
    setIsEdit(false);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = () => {
    setIsEdit(true);
    form.setFieldsValue(bankAccount);
    setModalOpen(true);
  };

  const onSelectBank = (bin) => {
    const bank = BANK_LIST.find((b) => b.bin === bin);
    if (!bank) return;
    form.setFieldsValue({
      bankName: bank.name,
      bankCode: bin,
    });
  };

  const submitForm = async () => {
    const values = await form.validateFields();

    const payload = {
      ...values,
      userId,
    };

    try {
      if (isEdit && bankAccount?.id) {
        await axiosClient.put(`${API}/${bankAccount.id}`, payload);
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await axiosClient.post(API, payload);
        toast.success("Tạo tài khoản thành công");
      }
      setModalOpen(false);
      loadBank();
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 200) {
        toast.error(isEdit ? "Cập nhật tài khoản ngân hàng lỗi" : "Tạo tài khoản ngân hàng lỗi");
      } else {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const getBankName = (bin) => {
    return BANK_LIST.find((b) => b.bin === bin)?.name || bin;
  };

  return (
    <div>
      <Card
        title="Tài khoản ngân hàng"
        extra={
          bankAccount ? (
            <Button type="primary" icon={<EditOutlined />} onClick={openEditModal}>
              Chỉnh sửa
            </Button>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tạo mới
            </Button>
          )
        }
        loading={loading}
      >
        {bankAccount ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Ngân hàng">
              {getBankName(bankAccount.bankCode)}
            </Descriptions.Item>
            <Descriptions.Item label="Mã ngân hàng">
              {bankAccount.bankCode}
            </Descriptions.Item>
            <Descriptions.Item label="Tên ngân hàng">
              {bankAccount.bankName}
            </Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">
              <span style={{ fontSize: 16, color: "#000000ff" }}>
                {bankAccount.accountNumber}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Chủ tài khoản">
              {bankAccount.accountName}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="Chưa có tài khoản ngân hàng" />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitForm}
        title={isEdit ? "Chỉnh sửa tài khoản ngân hàng" : "Tạo tài khoản ngân hàng mới"}
        okText={isEdit ? "Cập nhật" : "Tạo mới"}
        width={600}
      >
        <Form layout="vertical" form={form} style={{ marginTop: 20 }}>
          <Form.Item
            name="bankCode"
            label="Chọn ngân hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          >
            <Select onChange={onSelectBank} placeholder="Chọn ngân hàng">
              {BANK_LIST.map((b) => (
                <Select.Option key={b.bin} value={b.bin}>
                  {b.name}
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
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Chủ tài khoản"
            rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}
          >
            <Input placeholder="Nhập tên chủ tài khoản (in hoa không dấu)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
