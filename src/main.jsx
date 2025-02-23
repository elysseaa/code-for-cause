import ReactDOM from "react-dom/client";
// import './index.css'
import '@mantine/core/styles.css';
import App from './App.jsx'
import { MantineProvider, createTheme } from "@mantine/core";

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider defaultColorScheme="dark" withGlobalStyles withNormalizeCSS >
    <App />
  </MantineProvider>
);