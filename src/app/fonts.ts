import { Red_Hat_Display, Young_Serif, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const poppins = Poppins({ subsets: ["latin"], weight:['400']})
export const young = Young_Serif({ subsets: ["latin"], weight:['400']})
