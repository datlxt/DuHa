import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
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
            <a href="#demo">Trải nghiệm</a>
            <a href="#hanh-trinh">Hành trình</a>
            <a href="#lien-he">Liên hệ</a>
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
            <span className="inline-block rounded-full border border-burgundy/20 bg-burgundy/5 px-3 py-1 text-xs font-semibold text-burgundy">Từ 2004 · Gần 30 năm kinh nghiệm</span>
            <p className="mt-3 font-semibold text-burgundy">Showroom Dũng Hậu - Thử gạch hôm nay, thấy nhà ngày mai</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
              Chụp phòng mộc, thử gạch, <span className="text-burgundy">thấy trước</span> không gian hoàn thiện
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">
              Showroom Dũng Hậu giúp bạn thử gạch và xem trước phòng hoàn thiện từ ảnh phòng mộc và mẫu gạch chỉ trong vài bước, với công nghệ DuHa AI.
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
            {["Phòng mộc", "Mẫu gạch", "Phối cảnh DuHa AI"].map((item, idx) => (
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
                <div className="card" key={title}><h3 className="font-semibold text-burgundy">{title}</h3><p className="mt-2 text-sm text-muted">Showroom Dũng Hậu biến tư vấn bằng lời nói thành trải nghiệm nhìn thấy trực tiếp.</p></div>
              ))}
            </div>
          </div>
        </section>
        <section id="solution" className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="text-3xl font-bold">Showroom Dũng Hậu hỗ trợ tư vấn trực quan hơn</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {["Upload phòng mộc", "Upload mẫu gạch", "Chọn phong cách", "Xem phối cảnh", "Gửi khách"].map((step) => <div className="card text-center font-semibold" key={step}>{step}</div>)}
          </div>
        </section>
        <section id="demo" className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="card">
              <h2 className="text-3xl font-bold">Tạo phối cảnh thử với DuHa AI</h2>
              <p className="mt-2 text-muted">Chọn ảnh phòng và mẫu gạch, DuHa AI sẽ dựng phối cảnh phòng hoàn thiện để bạn xem trước.</p>
              <Link to="/app/create" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-burgundy px-5 py-3 font-semibold text-white">Vào DuHa AI <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
        <section id="hanh-trinh" className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="text-3xl font-bold">Hành trình Showroom Dũng Hậu</h2>
          <p className="mt-2 max-w-3xl text-muted">Hơn 20 năm đồng hành cùng khách hàng kể từ năm 2004, với gần 30 năm kinh nghiệm trong nghề gạch ốp lát.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["2004", "Thành lập Showroom Dũng Hậu tại Hưng Yên"],
              ["2010", "Mở rộng kho hàng, đa dạng mẫu gạch cao cấp"],
              ["2016", "Hợp tác trực tiếp nhiều thương hiệu gạch lớn"],
              ["2020", "Đồng hành cùng hàng nghìn công trình nhà ở & dự án"],
              ["2024", "Tròn 20 năm, chuẩn hoá quy trình tư vấn tận tâm"],
              ["2026", "Ra mắt DuHa AI — phối cảnh gạch bằng công nghệ AI"],
            ].map(([year, text]) => (
              <div className="card" key={year}>
                <p className="font-serif text-2xl font-bold text-burgundy">{year}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="lien-he" className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-3xl font-bold">Liên hệ Showroom Dũng Hậu</h2>
            <p className="mt-2 text-muted">Ghé showroom hoặc gọi trực tiếp để được tư vấn chọn gạch.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="card flex items-start gap-3">
                <MapPin className="mt-1 shrink-0 text-burgundy" size={20} />
                <div>
                  <p className="font-semibold">Địa chỉ</p>
                  <p className="mt-1 text-sm text-muted">Thôn Tây Sa, xã Hoàn Long, tỉnh Hưng Yên</p>
                </div>
              </div>
              <a href="tel:0983915727" className="card flex items-start gap-3 transition hover:border-burgundy">
                <Phone className="mt-1 shrink-0 text-burgundy" size={20} />
                <div>
                  <p className="font-semibold">Hotline</p>
                  <p className="mt-1 text-sm text-muted">0983 915 727</p>
                </div>
              </a>
              <a href="https://www.facebook.com/share/1LK16AAwLa/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 transition hover:border-burgundy">
                <svg viewBox="0 0 24 24" width="20" height="20" className="mt-1 shrink-0 fill-burgundy" aria-hidden="true">
                  <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.5-1.5H17V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.8V13h2.7v8h3z" />
                </svg>
                <div>
                  <p className="font-semibold">Facebook</p>
                  <p className="mt-1 text-sm text-muted">Nhắn tin &amp; xem mẫu gạch mới</p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-beige bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <DuHaLogo />
          <div className="text-sm text-muted md:text-right">
            <p>Thôn Tây Sa, xã Hoàn Long, tỉnh Hưng Yên · <a href="tel:0983915727" className="font-semibold text-burgundy">0983 915 727</a></p>
            <p className="mt-1">© 2026 Showroom Dũng Hậu. Phối cảnh gạch bằng công nghệ DuHa AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
