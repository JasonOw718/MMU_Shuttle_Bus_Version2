import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import ViewRoutePage from "./pages/ViewRoutePage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AppBar from "./components/NavBar";
import FeedbackFormPage from "./pages/FeedbackFormPage";

const AppLayout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/route/');

  return (
    <>
      {!hideNavbar && <AppBar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feedback" element={<FeedbackFormPage />} />
        <Route path="/route/:id" element={<ViewRoutePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;