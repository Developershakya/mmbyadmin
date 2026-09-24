import "@/styles/globals.css";
export const metadata = {
  title: "Make My Bharat Yatra",
  description: "Customized Tour Packages and Holidays",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
