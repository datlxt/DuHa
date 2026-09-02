import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DuHaLogo } from "../../components/brand/DuHaLogo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#fff,#FAF6EF_45%,#EFE3D5)] px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <DuHaLogo subtitle />
        </Link>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
