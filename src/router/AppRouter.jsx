import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import OwnerLayout from "../layouts/OwnerLayout";
import AdminLayout from "../layouts/AdminLayout";
import RenterLayout from "../layouts/RenterLayout";


import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerRooms from "../pages/owner/OwnerRooms";
import OwnerImage from "../pages/owner/OwnerImage";
import OwnerRoomService from "../pages/owner/OwnerRoomService";

import OwnerChat from "../pages/owner/OwnerChat";
import OwnerPayment from "../pages/owner/OwnerPayment";
import OwnerContract from "../pages/owner/OwnerContract";
import OwnerBankAccount from "../pages/owner/OwnerBankAccount";
import OwnerInvoice from "../pages/owner/OwnerInvoice";
import OwnerRoomServiceUsage from "../pages/owner/OwnerRoomServiceUsage";
import OwnerChangePassword from "../pages/owner/OwnerChangePassword";
import OwnerBooking from "../pages/owner/OwnerBooking";

import Login from "../pages/renter/Login";
import Register from "../pages/renter/Register";
import Home from "../pages/renter/Home";
import RoomList from "../pages/renter/RoomList";
import RoomDetail from "../pages/renter/RoomDetail";
import Search from "../pages/renter/Search";
import Contact from "../pages/renter/Contact";
import Contract from "../pages/renter/Contract";
import Booking from "../pages/renter/Booking";
import BookingList from "../pages/renter/BookingList";
import ChangePassword from "../pages/renter/ChangePassword";
import BookingDetail from "../pages/renter/BookingDetail";

import RenterPrivateRoute from "./RenterPrivateRoute";
import ForgotPassword from "../pages/renter/ForgotPassword";
import About from "../pages/renter/About";
import PostRoom from "../pages/renter/PostRoom";
import AdminRole from "../pages/admin/AdminRole";
import AdminRoom from "../pages/admin/AdminRoom";
import OwnerUser from "../pages/admin/OwnerUser";
import RenterUser from "../pages/admin/RenterUser";
import HandleOwner from "../pages/admin/HandleOwner";
import AdminBooking from "../pages/admin/AdminBooking";
import AdminContract from "../pages/admin/AdminContract";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminPayment from "../pages/admin/AdminPayment";
import OwnerTenant from "../pages/owner/OwnerTenant";
import Chat from "../pages/renter/Chat";
import AdminChat from "../pages/admin/AdminChat";
import AdminHelp from "../pages/admin/AdminHelp";
import OwnerPaymentMonth from "../pages/owner/OwnerPaymentMonth";
import AdminRevenue from "../pages/admin/AdminRevenue";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RENTER */}
        <Route element={<RenterLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/post-room" element={<PostRoom />} />
          <Route path="/chat" element={
            <RenterPrivateRoute>
              <Chat />
            </RenterPrivateRoute>
          } />
          <Route
            path="/contract"
            element={
              <RenterPrivateRoute>
                <Contract />
              </RenterPrivateRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <RenterPrivateRoute>
                <Booking />
              </RenterPrivateRoute>
            }
          />

          <Route
            path="/booking-list"
            element={
              <RenterPrivateRoute>
                <BookingList />
              </RenterPrivateRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <RenterPrivateRoute>
                <ChangePassword />
              </RenterPrivateRoute>
            }
          />

          <Route
            path="/booking/:id"
            element={
              <RenterPrivateRoute>
                <BookingDetail />
              </RenterPrivateRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* OWNER */}

        <Route
          path="/owner"
          element={
            <PrivateRoute roles={["OWNER"]}>
              <OwnerLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="rooms" element={<OwnerRooms />} />
          <Route path="images" element={<OwnerImage />} />
          <Route path="services" element={<OwnerRoomService />} />
          <Route path="chats" element={<OwnerChat />} />
          <Route path="payments" element={<OwnerPayment />} />
          <Route path="contracts" element={<OwnerContract />} />
          <Route path="banks" element={<OwnerBankAccount />} />
          <Route path="invoices" element={<OwnerInvoice />} />
          <Route path="bookings" element={<OwnerBooking />} />
          <Route path="users" element={<OwnerTenant />} />
          <Route path="confirm-payments-monthly" element={<OwnerPaymentMonth />} />
          <Route
            path="room-service-usages"
            element={<OwnerRoomServiceUsage />}
          />
           <Route path="change-password" element={<OwnerChangePassword />} />

        </Route>

        {/* ADMIN */}
       

        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
         <Route path="role" element={<AdminRole />} />
         <Route path="rooms" element={<AdminRoom />} />
         <Route path="owners" element={<OwnerUser />} />
         <Route path="renters" element={<RenterUser />} />
         <Route path="user-approval" element={<HandleOwner />} />
         <Route path="bookings" element={<AdminBooking />} />
          <Route path="contracts" element={<AdminContract />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="payments" element={<AdminPayment />} />
          <Route path="chats" element={<AdminChat />} />
          <Route path="helps" element={<AdminHelp />} />
          <Route path="revenue" element={<AdminRevenue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
