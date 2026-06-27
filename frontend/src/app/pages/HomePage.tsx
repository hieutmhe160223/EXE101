import { Link } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import {
  Search,
  Shield,
  TrendingDown,
  PackageCheck,
  ArrowRight,
  Star,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

export function HomePage() {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Phí dịch vụ thấp nhất",
      description: "Chỉ từ 5% - tiết kiệm chi phí tối đa",
    },
    {
      icon: Shield,
      title: "Kiểm hàng kỹ lưỡng",
      description: "Đội ngũ chuyên nghiệp tại kho Trung Quốc",
    },
    {
      icon: PackageCheck,
      title: "Vận chuyển nhanh chóng",
      description: "Giao hàng trong 7-10 ngày",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Dán link sản phẩm",
      description: "Copy link từ Taobao hoặc Xianyu",
    },
    {
      number: 2,
      title: "Đặt cọc 70%",
      description: "Thanh toán đặt cọc để xác nhận đơn",
    },
    {
      number: 3,
      title: "Kiểm tra hàng",
      description: "Nhận ảnh/video kiểm hàng tại kho TQ",
    },
    {
      number: 4,
      title: "Thanh toán & nhận hàng",
      description: "Hoàn tất thanh toán và nhận hàng tại VN",
    },
  ];

  const reviews = [
    {
      name: "Nguyễn Văn A",
      rating: 5,
      comment: "Dịch vụ tuyệt vời, hàng đúng mô tả. Sẽ tiếp tục ủng hộ!",
    },
    {
      name: "Trần Thị B",
      rating: 5,
      comment: "Phí rẻ, ship nhanh, nhân viên tư vấn nhiệt tình. Rất hài lòng!",
    },
    {
      name: "Lê Văn C",
      rating: 5,
      comment: "Đã đặt nhiều đơn, chất lượng dịch vụ ổn định. Recommend!",
    },
  ];

  const faqs = [
    {
      question: "Tôi có thể mua hàng từ những trang nào?",
      answer: "Hiện tại Yufiz hỗ trợ đặt hàng từ Taobao và Xianyu.",
    },
    {
      question: "Phí dịch vụ được tính như thế nào?",
      answer: "Phí dịch vụ = 5-8% giá trị đơn hàng, tùy theo loại sản phẩm.",
    },
    {
      question: "Thời gian giao hàng bao lâu?",
      answer: "Trung bình 7-10 ngày kể từ khi hàng về kho Trung Quốc.",
    },
    {
      question: "Có được hoàn tiền nếu hàng lỗi?",
      answer: "Có, bạn sẽ được hoàn tiền 100% nếu hàng lỗi do người bán.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Đặt hàng Taobao & Xianyu
                <br />
                <span className="text-primary">Dễ dàng - Nhanh chóng</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Nền tảng order hàng Trung uy tín #1 Việt Nam. Phí thấp, giao nhanh, kiểm hàng kỹ.
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Dán link sản phẩm Taobao/Xianyu vào đây..."
                  className="flex-1 px-4 py-3 outline-none"
                />
                <Button size="md" className="whitespace-nowrap">
                  <Search className="w-5 h-5 mr-2" />
                  Tìm kiếm
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/order/new">
                  <Button size="lg">
                    Đặt hàng ngay
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/exchange-rate">
                  <Button variant="outline" size="lg">
                    Xem tỷ giá
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur">
                <Card className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Tỷ giá hôm nay</span>
                    <span className="text-xs bg-accent text-white px-2 py-1 rounded">Live</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    1 ¥ = 3,650 đ
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="text-center">
                    <div className="text-2xl font-bold text-primary">5%</div>
                    <div className="text-xs text-muted-foreground mt-1">Phí dịch vụ</div>
                  </Card>
                  <Card className="text-center">
                    <div className="text-2xl font-bold text-accent">7-10</div>
                    <div className="text-xs text-muted-foreground mt-1">Ngày giao</div>
                  </Card>
                  <Card className="text-center">
                    <div className="text-2xl font-bold text-secondary">24/7</div>
                    <div className="text-xs text-muted-foreground mt-1">Hỗ trợ</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tại sao chọn Yufiz?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} hover className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Quy trình đặt hàng
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <Card className="text-center h-full">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
                {step.number < 4 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-primary w-6 h-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Khách hàng nói gì về chúng tôi
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="relative">
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{review.name}</div>
                    <div className="text-xs text-muted-foreground">Khách hàng</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq">
              <Button variant="outline">
                Xem tất cả câu hỏi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng đặt hàng?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia hàng nghìn khách hàng tin dùng Yufiz mỗi ngày
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Đăng ký ngay
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
                <MessageSquare className="w-5 h-5 mr-2" /> Chat với chúng tôi
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
