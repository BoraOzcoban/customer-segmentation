import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage/LandingPage"; // ✅ Correct import path
import ProductRecommendationPage from "./ProductRecommendationPage/ProductRecommendationPage"; // ✅ Correct import path

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/recommendations"
          element={<ProductRecommendationPage />}
        />
      </Routes>
    </Router>
  );
};

export default App;
