import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ui";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (

    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
