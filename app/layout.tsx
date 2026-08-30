// this layout wraps every page with the shared navigation and styles
import type { Metadata } from "next"; 

import "bootstrap/dist/css/bootstrap.min.css"; 
import "./globals.css"; 

import Navbar from "@/components/Navbar";

export const metadata: Metadata = { 
  title: "Betting Transparency Dashboard", 
  description: "Sports betting probability and risk analysis", 
}; 

export default function RootLayout({ 
  children, 
}: Readonly<{ children: React.ReactNode; 
}>) { 
  return ( 
    <html lang="en"> 
      <body>
        {/* this stays at the top no matter which page is open */}
        <Navbar />

        {/* next.js swaps the current page into this spot */}
        {children}
      </body> 
    </html> 
  ); 
}
