import { useState } from "react";
import AppHeader from "./utils/Header";
import AppFooter from "./utils/Footer";
import AdviceForm from "./components/AdviceForm";
import AdviceDisplay from "./components/AdviceDisplay";
import { fetchParentingAdvice } from "./services/ParentingAPI";
import { Layout, Spin } from "antd";

import "./styles.css";

const { Content } = Layout;

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const getAdvice = async (query) => {
    setLoading(true);
    const result = await fetchParentingAdvice(query);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <Layout className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Content className="content-area">
        <AdviceForm onSubmit={getAdvice} />
        {loading ? (
          <Spin size="large" className="loading-spinner" />
        ) : (
          <AdviceDisplay advice={advice} />
        )}
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default App;
