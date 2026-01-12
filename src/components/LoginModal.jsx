import { useContext, useState, useEffect } from "react";
import { Modal, Form, Input, Button, Typography, Select, Steps, message } from "antd";
import { UserOutlined, LockOutlined, UserAddOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, ArrowLeftOutlined, SafetyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import loginImg from "../assets/login.png";
import PostRoom from "../pages/renter/PostRoom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";


export default function LoginModal({ visible, onClose, initialMode, onLoginSuccess }) {
  const { login, setAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [regForm] = Form.useForm();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'postroom'
  const [currentUser, setCurrentUser] = useState(null);
  const [postActiveTab, setPostActiveTab] = useState("login");
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerForm] = Form.useForm();
  // forgot password states
  const [fpStep, setFpStep] = useState(0); // 0: request otp, 1: verify+reset, 2: success
  const [fpLoading, setFpLoading] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpCountdown, setFpCountdown] = useState(0);
  const [fpForm] = Form.useForm();

  useEffect(() => {
    // reset forms when modal closes
    if (!visible) {
      form.resetFields();
      regForm.resetFields();
      ownerForm.resetFields();
      fpForm.resetFields();
      setFpStep(0);
      setFpCountdown(0);
      setMode("login");
    } else {
      // if modal opened with an initialMode prop, set it
      if (initialMode) setMode(initialMode);
    }

    // load current user from localStorage
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setCurrentUser(parsed.user || null);
      } else setCurrentUser(null);
    } catch (e) {
      setCurrentUser(null);
    }
  }, [visible, form, regForm, ownerForm, fpForm, initialMode]);

  // forgot-password countdown effect
  useEffect(() => {
    if (fpCountdown <= 0) return;
    const t = setInterval(() => {
      setFpCountdown((v) => {
        if (v <= 1) {
          clearInterval(t);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [fpCountdown]);

  // when currentUser becomes available, prefill ownerForm fields
  useEffect(() => {
    if (currentUser) {
      ownerForm.setFieldsValue({
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        citizenId: currentUser.citizenId || "",
      });
    }
  }, [currentUser, ownerForm]);

  const onFinish = async (values) => {
    setLoading(true);
    const payload = {
      email: values.email,
      password: values.password,
      platform: "WEB",
      deviceToken: "",
      versionApp: "1.0",
    };
    const result = await login(payload, { redirect: false, suppressErrorToast: true });
    setLoading(false);

    // result is either null or { userData, raw }
    if (result && result.raw) {
      const code = result.raw.code ?? result.raw.status ?? (result.raw.accessToken ? 200 : undefined);
      if (code === 200) {
        // success
        const userData = result.userData || result.raw || {};
        const roleName = userData.role || userData.roleName || (userData.user && userData.user.roleName) || null;

        // prefer to update context and SPA-navigate, but handle postroom flow specially
        if (setAuth) {
          setAuth(userData, { persist: true, redirect: false });
          toast.success("Đăng nhập thành công");

          // If modal was opened to continue owner registration, keep it open and switch to the postroom step
          if (initialMode === "postroom") {
            setCurrentUser(userData.user || userData);
            setMode("postroom");
            if (onLoginSuccess) onLoginSuccess();
            return;
          }

          // If parent provided onLoginSuccess, call it but still perform role-based navigation for admins/owners.
          if (onLoginSuccess) {
            try {
              onLoginSuccess();
            } catch (e) {
              console.warn('onLoginSuccess threw', e);
            }
            onClose?.();

            if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
              navigate('/admin/dashboard');
              return;
            }
            if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
              navigate('/owner/dashboard');
              return;
            }

            // otherwise let the parent stay in control
            return;
          }

          // Fallback: close modal and navigate according to role
          onClose();
          if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
            navigate('/admin/dashboard');
          } else if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
            navigate('/owner/dashboard');
          } else {
            navigate('/');
          }
          return;
        }

        // fallback: persist to storage and handle postroom flow
        toast.success("Đăng nhập thành công");
        try {
          const u = localStorage.getItem("user");
          if (u) {
            const parsed = JSON.parse(u);
            setCurrentUser(parsed.user || null);
          }
        } catch (e) {
          setCurrentUser(userData.user || null);
        }

        if (initialMode === "postroom") {
          setMode("postroom");
          if (onLoginSuccess) onLoginSuccess();
          return;
        }

        if (onLoginSuccess) {
          try {
            onLoginSuccess();
          } catch (e) {
            console.warn('onLoginSuccess threw', e);
          }
          onClose?.();

          if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
            navigate('/admin/dashboard');
            return;
          }
          if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
            navigate('/owner/dashboard');
            return;
          }

          return;
        } else {
          onClose();
        }
        return;
      }
      // non-200 response from server
      toast.error("Đăng nhập không thành công");
      setMode("login");
      return;
    }

    // result is null or network error
    toast.error("Đăng nhập không thành công");
    setMode("login");
    return;
  };

  const handleOwnerRequest = async (values) => {
    setOwnerLoading(true);
    try {
      const payload = { reason: values.reason };
      const resp = await axiosClient.post("/api/owner-requests", payload);
      toast.success(resp.data?.message || "Gửi yêu cầu đăng ký chủ trọ thành công");
      ownerForm.resetFields();
      onClose();
    } catch (err) {
      console.error("Owner request error", err);
      const msg = err.response?.data?.message || "Gửi yêu cầu thất bại";
      toast.error(msg);
    } finally {
      setOwnerLoading(false);
    }
  };

  // Forgot-password handlers adapted from ForgotPassword page
  const startFpCountdown = () => {
    setFpCountdown(60);
  };

  const handleRequestOtpFp = async (values) => {
    setFpLoading(true);
    try {
      const response = await axiosClient.post(
        `/api/user/forgot-password/request-otp?email=${encodeURIComponent(values.email)}`
      );
      if (response.data?.code === 200) {
        message.success("Mã OTP đã được gửi đến email của bạn!");
        setFpEmail(values.email);
        setFpStep(1);
        startFpCountdown();
      } else {
        message.error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPasswordFp = async (values) => {
    setFpLoading(true);
    try {
      const response = await axiosClient.post("/api/user/forgot-password/reset", {
        email: fpEmail || values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      if (response.data?.code === 200) {
        message.success("Đặt lại mật khẩu thành công!");
        setFpStep(2);
      } else {
        message.error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResendOtpFp = async () => {
    if (fpCountdown > 0) return;
    setFpLoading(true);
    try {
      const response = await axiosClient.post(
        `/api/user/forgot-password/request-otp?email=${encodeURIComponent(fpEmail)}`
      );
      if (response.data?.code === 200) {
        message.success("Đã gửi lại mã OTP!");
        startFpCountdown();
      }
    } catch (error) {
      message.error("Không thể gửi lại OTP. Vui lòng thử lại!");
    } finally {
      setFpLoading(false);
    }
  };

  const onRegister = async (values) => {
    setLoading(true);
    const payload = {
      email: values.email,
      fullName: values.fullName,
      phone: values.phone,
      password: values.password,
      gender: values.gender || "OTHER",
      address: values.address || "",
      citizenId: values.citizenId || "",
    };

    try {
      const req = await axiosClient.post("/api/user", payload);
      if (req.data?.status >= 400) {
        toast.error(req.data.message || "Đăng ký thất bại");
        return;
      }

      toast.success("Đăng ký thành công");
      setMode("login");
      regForm.resetFields();
    } catch (err) {
      console.error(err);
      toast.error("Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };
const googleLogin = useGoogleLogin({
  flow: "auth-code",
  scope: "openid email profile",
  onSuccess: async ({ code }) => {
    try {
      const res = await axiosClient.post("/auth/google", { code });
      // prefer HTTP status 200; also support backend returning { code: 200 }
      const okHttp = res.status === 200;
      const payload = res.data?.data ?? res.data ?? {};
      const okBody = payload?.code === 200 || payload?.status === 200 || (!('code' in payload) && okHttp);

      if (!okHttp || !okBody) {
        toast.error(payload?.message || 'Đăng nhập không thành công');
        return;
      }

      const accessToken = payload.accessToken || payload.access_token;
      const refreshToken = payload.refreshToken || payload.refresh_token || '';
      const userResponse = payload.userResponse || payload.user || payload.user_response || null;
      const roleName = payload.roleName || payload.role || (userResponse && userResponse.roleName) || null;

      if (!accessToken) {
        toast.error('Token không hợp lệ');
        return;
      }

      const userData = { accessToken, refreshToken, user: userResponse, role: roleName };
      // update context and persist + redirect according to role
      if (setAuth) {
        // persist to localStorage but don't redirect inside setAuth
        setAuth(userData, { persist: true, redirect: false });
        toast.success('Đăng nhập thành công');

        // If opened for owner registration, keep modal open and switch to postroom
        if (initialMode === 'postroom') {
          setCurrentUser(userData.user || userData);
          setMode('postroom');
          if (onLoginSuccess) onLoginSuccess();
          return;
        }

        // If parent provided onLoginSuccess, call it but still perform role-based navigation for admins/owners.
        if (onLoginSuccess) {
          try {
            onLoginSuccess();
          } catch (e) {
            console.warn('onLoginSuccess threw', e);
          }
          onClose?.();

          if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
            navigate('/admin/dashboard');
            return;
          }
          if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
            navigate('/owner/dashboard');
            return;
          }

          // otherwise let the parent stay in control
          return;
        }

        // fallback: close modal and perform navigation
        onClose?.();
        if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
          navigate('/admin/dashboard');
        } else if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
        return;
      }

      // fallback: persist and perform a SPA navigation (or continue postroom flow)
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Đăng nhập thành công');
      if (initialMode === 'postroom') {
        setCurrentUser(userData.user || userData);
        setMode('postroom');
        if (onLoginSuccess) onLoginSuccess();
        return;
      }
      if (onLoginSuccess) {
        try {
          onLoginSuccess();
        } catch (e) {
          console.warn('onLoginSuccess threw', e);
        }
        onClose?.();

        if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
          navigate('/admin/dashboard');
          return;
        }
        if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
          navigate('/owner/dashboard');
          return;
        }

        return;
      } else {
        onClose?.();
      }
      if (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (roleName === 'OWNER' || roleName === 'ROLE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error', err);
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  },
  onError: (err) => {
    console.error('Google OAuth error', err);
    toast.error('Đăng nhập bằng Google thất bại');
  },
});
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={820}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
    >
      <div style={{ display: "flex", minHeight: 520 }}>
        <div style={{ width: 320, flexShrink: 0, position: "relative", background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={loginImg} alt="login" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ width: 460, padding: 28, background: '#fff' }}>
          {mode === 'login' ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <Typography.Text style={{ color: '#6b7280' }}>Xin chào bạn</Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 12px' }}>Đăng nhập để tiếp tục</Typography.Title>
              </div>

              <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
                  <Input prefix={<UserOutlined />} placeholder="Email hoặc số điện thoại" />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                </Form.Item>
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <a onClick={() => setMode('forgot')} style={{ color: '#2196F3', fontWeight: 600 }}>Quên mật khẩu?</a>
                </div>

                <Form.Item>
                  <Button
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={{
                      height: 50,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)',
                      border: 'none',
                      color: '#111',
                      fontWeight: 700,
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <div style={{ color: '#9ca3af', fontSize: 13 }}>Hoặc</div>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>

              <div>
                <Button
                  block
                  size="large"
                  style={{
                    background: '#000',
                    color: '#fff',
                    borderRadius: 8,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    border: 'none',
                  }}
                   onClick={() => googleLogin()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                    <path fill="#4285F4" d="M24 9.5c3.9 0 7 1.4 9.2 3.2l6.8-6.8C35.1 2.3 29.9 0 24 0 14.7 0 6.9 5.6 3 13.6l7.9 6.2C12.9 15 18 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.5 24.5c0-1.7-.1-3.3-.4-4.9H24v9.3h12.7c-.6 3-2.6 5.6-5.6 7.3l8.6 6.6C43.9 38.1 46.5 31.7 46.5 24.5z"/>
                    <path fill="#FBBC05" d="M10.9 29.8A14.3 14.3 0 0110 24.5c0-1.7.3-3.4.9-5.1L3 13.6C1.1 16.9 0 20.6 0 24.5c0 3.9 1.1 7.6 3 10.9l7.9-6.2z"/>
                    <path fill="#EA4335" d="M24 48c6.5 0 11.9-2.1 15.9-5.7l-8.6-6.6c-2.4 1.6-5.4 2.6-8.3 2.6-5.9 0-10.9-4.7-12-11l-7.9 6.2C6.9 42.4 14.7 48 24 48z"/>
                  </svg>
                  Đăng nhập bằng Google
                </Button>
              </div>

              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Typography.Text>Bạn chưa là thành viên? <a onClick={() => setMode('register')} style={{ color: '#f43f5e', fontWeight: 600 }}>Đăng ký</a> tại đây</Typography.Text>
              </div>
            </>
          ) : mode === 'register' ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <Typography.Text style={{ color: '#6b7280' }}>Chưa có tài khoản?</Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 12px' }}>Đăng ký để tiếp tục</Typography.Title>
              </div>

              <Form form={regForm} layout="vertical" onFinish={onRegister} size="large">
                <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                  <Input prefix={<UserAddOutlined />} placeholder="Họ tên" />
                </Form.Item>

                <Form.Item name="email" rules={[{ required: true, message: 'Nhập email' }]}>
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>

                <Form.Item name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                  <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 12 }}>
                  <Form.Item name="gender" style={{ flex: 1 }} initialValue="MALE" rules={[{ required: true, message: 'Chọn giới tính' }]}>
                    <Select size="large">
                      <Select.Option value="MALE">Nam</Select.Option>
                      <Select.Option value="FEMALE">Nữ</Select.Option>
                      <Select.Option value="OTHER">Khác</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="citizenId" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập CCCD' }]}>
                    <Input prefix={<IdcardOutlined />} placeholder="CCCD" />
                  </Form.Item>
                </div>

                <Form.Item name="address" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
                  <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{
                      width: '100%',
                      height: 50,
                      borderRadius: 8,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)',
                      border: 'none',
                    }}
                  >
                    Đăng ký
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Typography.Text>Đã có tài khoản? <a onClick={() => setMode('login')} style={{ color: '#2196F3', fontWeight: 600 }}>Đăng nhập</a></Typography.Text>
              </div>
            </>
          ) : mode === 'postroom' ? (
            <>
              {currentUser ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <Typography.Text style={{ color: '#6b7280' }}>Đăng kí thông tin</Typography.Text>
                    <Typography.Title level={2} style={{ margin: '6px 0 12px' }}>Đăng kí thông tin chủ trọ</Typography.Title>
                  </div>

                  <Form form={ownerForm} layout="vertical" onFinish={handleOwnerRequest} size="large">
                    <Form.Item name="fullName" label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}>
                      <Input prefix={<UserOutlined />} disabled />
                    </Form.Item>

                    <Form.Item name="email" label={<span style={{ fontWeight: 500 }}>Email</span>}>
                      <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>

                    <Form.Item name="phone" label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}>
                      <Input prefix={<PhoneOutlined />} disabled />
                    </Form.Item>

                    <Form.Item name="citizenId" label={<span style={{ fontWeight: 500 }}>Số CCCD/CMND</span>}>
                      <Input prefix={<IdcardOutlined />} disabled />
                    </Form.Item>

                    <Form.Item name="reason" label={<span style={{ fontWeight: 500 }}>Lý do muốn trở thành chủ trọ</span>} rules={[{ required: true, message: 'Vui lòng nhập lý do' }, { min: 20, message: 'Lý do phải có ít nhất 20 ký tự' }]}>
                      <Input.TextArea rows={4} placeholder="Ví dụ: Tôi có 5 năm kinh nghiệm quản lý nhà trọ, hiện đang sở hữu 2 dãy Phòng Trọ tại..." />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <Button onClick={() => { ownerForm.resetFields(); setMode('login'); onClose(); }} size="large" style={{ minWidth: 120, height: 46, borderRadius: 8, fontWeight: 500 }}>Hủy bỏ</Button>
                        <Button htmlType="submit" loading={ownerLoading} type="primary" size="large" style={{ minWidth: 160, height: 46, borderRadius: 8, background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)', border: 'none', fontSize: 16, fontWeight: 600 }}>Gửi yêu cầu</Button>
                      </div>
                    </Form.Item>
                  </Form>

                  <div style={{ marginTop: 16, padding: 12, background: '#e3f2fd', borderRadius: 8, borderLeft: '4px solid #2196F3' }}>
                    <Typography.Text style={{ fontSize: 13, color: '#424242', lineHeight: 1.6 }}>
                      <strong style={{ color: '#1976D2' }}>💡 Lưu ý:</strong> Sau khi gửi yêu cầu, quản trị viên sẽ xem xét và phê duyệt trong vòng 24-48 giờ. Bạn sẽ nhận được email thông báo kết quả.
                    </Typography.Text>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    
                    <Typography.Title level={3} style={{ margin: '6px 0 12px' }}>Đăng kí thông tin chủ trọ</Typography.Title>
                    <Typography.Text style={{ color: '#6b7280' }}>Nếu chưa có tài khoản trang web bạn hãy đăng kí trước khi đăng nhập</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <Button type={postActiveTab === 'login' ? 'primary' : 'default'} onClick={() => setPostActiveTab('login')} block>Đăng nhập</Button>
                    <Button type={postActiveTab === 'register' ? 'primary' : 'default'} onClick={() => setPostActiveTab('register')} block>Đăng ký</Button>
                  </div>

                  {postActiveTab === 'login' ? (
                    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                      <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Email hoặc số điện thoại" />
                      </Form.Item>

                      <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                      </Form.Item>

                      <Form.Item>
                        <Button htmlType="submit" block size="large" loading={loading} style={{ height: 50, borderRadius: 8, background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)', border: 'none', fontWeight: 700 }}>Đăng nhập</Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    <Form form={regForm} layout="vertical" onFinish={onRegister} size="large">
                      <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                        <Input prefix={<UserAddOutlined />} placeholder="Họ tên" />
                      </Form.Item>

                      <Form.Item name="email" rules={[{ required: true, message: 'Nhập email' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                      </Form.Item>

                      <Form.Item name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                      </Form.Item>

                      <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                      </Form.Item>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <Form.Item name="gender" style={{ flex: 1 }} initialValue="MALE" rules={[{ required: true, message: 'Chọn giới tính' }]}>
                          <Select size="large">
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                          </Select>
                        </Form.Item>

                        <Form.Item name="citizenId" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập CCCD' }]}>
                          <Input prefix={<IdcardOutlined />} placeholder="CCCD" />
                        </Form.Item>
                      </div>

                      <Form.Item name="address" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
                        <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
                      </Form.Item>

                      <Form.Item>
                        <Button htmlType="submit" loading={loading} block size="large" style={{ height: 50, borderRadius: 8, background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)', border: 'none', fontWeight: 700 }}>Đăng ký</Button>
                      </Form.Item>
                    </Form>
                  )}
                </div>
              )}
            </>
          ) : mode === 'forgot' ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <Typography.Text style={{ color: '#6b7280' }}>Quên mật khẩu</Typography.Text>
                <Typography.Title level={3} style={{ margin: '6px 0 12px' }}>Lấy lại mật khẩu</Typography.Title>
              </div>

              <div style={{ maxWidth: 420 }}>
                <Steps current={fpStep} size="small" style={{ marginBottom: 16 }} items={[{ title: 'Email' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }]} />

                {fpStep === 0 && (
                  <Form layout="vertical" onFinish={handleRequestOtpFp} form={fpForm} size="large">
                    <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                      <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email của bạn" />
                    </Form.Item>

                    <Form.Item>
                      <Button htmlType="submit" block size="large" loading={fpLoading} style={{ height: 50, borderRadius: 8, background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)', border: 'none', fontWeight: 700 }}>Gửi mã OTP</Button>
                    </Form.Item>
                  </Form>
                )}

                {fpStep === 1 && (
                  <>
                    <Form form={fpForm} layout="vertical" onFinish={handleResetPasswordFp} size="large">
                      <Form.Item name="otp" rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }, { len: 6, message: 'Mã OTP gồm 6 chữ số' }]}>
                        <Input prefix={<SafetyOutlined />} placeholder="Nhập mã OTP" maxLength={6} />
                      </Form.Item>

                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <Typography.Text style={{ color: '#6b7280' }}>Không nhận được mã? </Typography.Text>
                        <a onClick={handleResendOtpFp} style={{ color: fpCountdown > 0 ? '#9ca3af' : '#2196F3', cursor: fpCountdown > 0 ? 'not-allowed' : 'pointer' }}>{fpCountdown > 0 ? `Gửi lại sau ${fpCountdown}s` : 'Gửi lại'}</a>
                      </div>

                      <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
                      </Form.Item>

                      <Form.Item name="confirmPassword" dependencies={["newPassword"]} rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu không khớp')); }, })]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                      </Form.Item>

                      <Form.Item>
                        <Button htmlType="submit" block size="large" loading={fpLoading} style={{ height: 50, borderRadius: 8, background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)', border: 'none', fontWeight: 700 }}>Đặt lại mật khẩu</Button>
                      </Form.Item>
                    </Form>
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      <a onClick={() => { setFpStep(0); setMode('login'); }} style={{ color: '#2196F3' }}>Quay lại đăng nhập</a>
                    </div>
                  </>
                )}

                {fpStep === 2 && (
                  <div style={{ textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 56, color: '#2196F3', marginBottom: 12 }} />
                    <Typography.Title level={4}>Đặt lại mật khẩu thành công!</Typography.Title>
                    <Typography.Text style={{ color: '#6b7280' }}>Bạn đã có thể đăng nhập với mật khẩu mới.</Typography.Text>
                    <div style={{ marginTop: 16 }}>
                      <Button type="primary" onClick={() => { setMode('login'); setFpStep(0); onClose(); }} style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)', border: 'none' }}>Đăng nhập ngay</Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
