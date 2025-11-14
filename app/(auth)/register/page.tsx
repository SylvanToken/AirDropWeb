import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function RegisterPage() {
  // Redirect if already logged in
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          <RegisterForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
