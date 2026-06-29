import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DuHaLogo } from "../../components/brand/DuHaLogo";

export function LandingPage() {
  return (
    <div className="bg-ivory text-charcoal">
      <header className="sticky top-0 z-20 border-b border-beige bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <DuHaLogo />
          <nav className="hidden gap-6 text-sm text-muted md:flex">
            <a href="#problem">Vấn đề</a>
            <a href="#solution">Giải pháp</a>
            <a href="#demo">Demo</a>
            <a href="#roadmap">Roadmap</a>
          </nav>
          <div className="flex gap-2">
            <Link className="rounded-lg px-4 py-2 text-sm font-semibold text-burgundy" to="/login">Đăng nhập</Link>
            <Link className="rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white" to="/register">Dùng thử miễn phí</Link>
          </div>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_0.9fr] md:py-24">
          <div>
            <p className="font-semibold text-burgundy">DuHa - Thử gạch hôm nay, thấy nhà ngày mai</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
              Chụp phòng mộc, thử gạch, <span className="text-burgundy">thấy trước</span> không gian hoàn thiện
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">
              DuHa giúp cửa hàng gạch và khách hàng đang xây nhà tạo phối cảnh phòng hoàn thiện từ ảnh phòng mộc và mẫu gạch chỉ trong vài bước.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-burgundy px-5 py-3 font-semibold text-white">Dùng thử miễn phí</Link>
              <a href="#demo" className="rounded-lg border border-beige bg-white px-5 py-3 font-semibold text-burgundy">Xem demo</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted">
              {["Tư vấn nhanh hơn", "Dễ hình dung hơn", "Hỗ trợ chốt đơn"].map((item) => (
                <span key={item} className="flex items-center gap-2"><CheckCircle2 size={17} className="text-burgundy" />{item}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {["Phòng mộc", "Mẫu gạch", "Phối cảnh DuHa"].map((item, idx) => (
              <div key={item} className="card">
                <div className={`h-36 rounded-lg ${idx === 0 ? "bg-[#ded3c4]" : idx === 1 ? "bg-[linear-gradient(135deg,#d9d0c4,#8b7d73)]" : "bg-[linear-gradient(135deg,#fff7ec,#7A0013)]"}`} />
                <p className="mt-3 font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="problem" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="text-3xl font-bold">Vì sao khách hàng khó chọn gạch?</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {["Một viên gạch đẹp chưa chắc lát cả phòng sẽ đẹp", "Khó tưởng tượng màu tường và nội thất", "Dựng phối cảnh truyền thống quá chậm", "Khách phân vân lâu, dễ bỏ đi"].map((title) => (
                <div className="card" key={title}><h3 className="font-semibold text-burgundy">{title}</h3><p className="mt-2 text-sm text-muted">DuHa biến tư vấn bằng lời nói thành trải nghiệm nhìn thấy trực tiếp.</p></div>
              ))}
            </div>
          </div>
        </section>
        <section id="solution" className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="text-3xl font-bold">DuHa hỗ trợ tư vấn trực quan hơn</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {["Upload phòng mộc", "Upload mẫu gạch", "Chọn phong cách", "Xem phối cảnh", "Gửi khách"].map((step) => <div className="card text-center font-semibold" key={step}>{step}</div>)}
          </div>
        </section>
        <section id="demo" className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="card">
              <h2 className="text-3xl font-bold">Tạo phối cảnh thử với DuHa</h2>
              <p className="mt-2 text-muted">Demo frontend. Bản chính thức trong dashboard sẽ lưu dự án thật vào Supabase.</p>
              <Link to="/app/create" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-burgundy px-5 py-3 font-semibold text-white">Vào trang tạo phối cảnh <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
        <section id="roadmap" className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="text-3xl font-bold">Lộ trình phát triển</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["v0.1 Upload ảnh + mock preview", "v0.2 Supabase data thật", "v0.3 AI render thật", "v0.4 Catalog mẫu gạch", "v0.5 Báo giá và Zalo", "v1.0 SaaS cửa hàng gạch"].map((item) => <div className="card" key={item}>{item}</div>)}
          </div>
        </section>
      </main>
      <footer className="border-t border-beige bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <DuHaLogo />
          <p className="text-sm text-muted">© 2026 DuHa. AI phối cảnh gạch từ ảnh phòng mộc.</p>
        </div>
      </footer>
    </div>
  );
}
