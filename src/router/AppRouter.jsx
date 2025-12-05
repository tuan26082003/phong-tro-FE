import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import OwnerLayout from "../layouts/OwnerLayout";
import RenterLayout from "../layouts/RenterLayout";

import OwnerLogin from "../pages/owner/OwnerLogin";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerRooms from "../pages/owner/OwnerRooms";
import OwnerImage from "../pages/owner/OwnerImage";
import OwnerRoomService from "../pages/owner/OwnerRoomService";
import OwnerRole from "../pages/owner/OwnerRole";
import OwnerUser from "../pages/owner/OwnerUser";
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
import Help from "../pages/renter/Help";
import Contract from "../pages/renter/Contract";
import Booking from "../pages/renter/Booking";
import BookingList from "../pages/renter/BookingList";
import ChangePassword from "../pages/renter/ChangePassword";
import BookingDetail from "../pages/renter/BookingDetail";

import RenterPrivateRoute from "./RenterPrivateRoute";

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
          <Route path="/help" element={<Help />} />
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

        {/* OWNER */}
        <Route path="/admin/login" element={<OwnerLogin />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["ADMIN", "OWNER"]}>
              <OwnerLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="rooms" element={<OwnerRooms />} />
          <Route path="images" element={<OwnerImage />} />
          <Route path="services" element={<OwnerRoomService />} />
          <Route path="role" element={<OwnerRole />} />
          <Route path="users" element={<OwnerUser />} />
          <Route path="chats" element={<OwnerChat />} />
          <Route path="payments" element={<OwnerPayment />} />
          <Route path="contracts" element={<OwnerContract />} />
          <Route path="banks" element={<OwnerBankAccount />} />
          <Route path="invoices" element={<OwnerInvoice />} />
          <Route path="bookings" element={<OwnerBooking />} />
          <Route
            path="room-service-usages"
            element={<OwnerRoomServiceUsage />}
          />
          <Route path="change-password" element={<OwnerChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
