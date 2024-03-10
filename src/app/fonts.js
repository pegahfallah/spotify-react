import { Red_Hat_Display, Inria_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const red_hat = Red_Hat_Display({ subsets: ["latin"] });
export const inria = Inria_Serif({ subsets: ["latin"], weight:['400']})
