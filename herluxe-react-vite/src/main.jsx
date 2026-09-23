import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/header.css";
import "./styles/home.css";
import "./styles/products.css";
import "./styles/cart.css";
import "./styles/about.css";
import "./styles/contact.css";
import "./styles/faq.css";
import "./styles/style.css";
import "./styles/register.css";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
