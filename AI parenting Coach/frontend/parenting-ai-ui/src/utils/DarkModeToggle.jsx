import { Switch } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <Switch
      checked={darkMode}
      onChange={toggleDarkMode}
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
    />
  );
};

export default DarkModeToggle;
