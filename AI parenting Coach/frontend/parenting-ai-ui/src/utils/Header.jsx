import { Layout } from "antd";
import DarkModeToggle from "./DarkModeToggle";

const { Header } = Layout;

const AppHeader = ({ darkMode, toggleDarkMode }) => {
  return (
    <Header
      className={`app-header ${darkMode ? "header-dark" : "header-light"}`}
    >
      <h1>Parenting Guide</h1>
      <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </Header>
  );
};

export default AppHeader;
