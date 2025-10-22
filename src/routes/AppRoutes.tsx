import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Test from "../pages/Test";
import Members from "../pages/Members";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Members" element={<Members />} />
      <Route path="/features" element={<Test />} />
      <Route path="/pricing" element={<Test />} />
      <Route path="/contact" element={<Test />} />
      <Route path="*" element={<Test />} />
    </Routes>
  );
};

export default AppRoutes;
