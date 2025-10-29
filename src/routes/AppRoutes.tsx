import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Test from "../pages/Test";
import Members from "../pages/Members";
import Calendar from "../pages/Calendar";
import Products from "../pages/Products";
import MemberProducts from "../pages/MemberProducts";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Members" element={<Members />} />
      <Route path="/Members/:memberSlug" element={<MemberProducts />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/products" element={<Products />} />
      <Route path="/palette" element={<Test />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
