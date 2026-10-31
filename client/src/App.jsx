import { lazy, Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";

// Secondary pages are code-split so the homepage loads faster.
const List = lazy(() => import("./pages/list/List"));
const Hotel = lazy(() => import("./pages/hotel/Hotel"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Account = lazy(() => import("./pages/account/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // "instant" so the global smooth-scroll does not animate page changes.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const BackToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      className={`toTop ${show ? "show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>
  );
};

// Re-mounts on navigation so every page fades in.
const PageFade = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="pageFade">
      {children}
    </div>
  );
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
        <PageFade>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<List />} />
          <Route path="/hotels/:id" element={<Hotel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </PageFade>
      </Suspense>
      <BackToTop />
    </>
  );
}

export default App;
