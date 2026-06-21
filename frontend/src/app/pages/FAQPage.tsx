import { Card } from "../components/Card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Quy trình đặt hàng",
      questions: [
        {
          q: "Làm thế nào để đặt hàng trên Yufiz?",
          a: "Bạn chỉ cần dán link sản phẩm từ Taobao/Xianyu vào ô tìm kiếm, hệ thống sẽ tự động phân tích và hiển thị thông tin sản phẩm. Sau đó bạn chọn số lượng, phân loại và tiến hành đặt hàng.",
        },
        {
          q: "Tôi cần thanh toán bao nhiêu khi đặt hàng?",
          a: "Bạn cần thanh toán 70% tổng giá trị đơn hàng làm tiền đặt cọc. 30% còn lại sẽ thanh toán sau khi hàng về kho Trung Quốc và được kiểm tra.",
        },
      ],
    },
    {
      category: "Chính sách hoàn tiền",
      questions: [
        {
          q: "Trường hợp nào được hoàn tiền?",
          a: "Bạn được hoàn 100% nếu: hàng lỗi do người bán, hàng giả/hàng nhái, sai sản phẩm, hoặc người bán không giao hàng. Yêu cầu hoàn tiền phải gửi trong vòng 7 ngày kể từ khi nhận hàng.",
        },
        {
          q: "Thời gian hoàn tiền bao lâu?",
          a: "Sau khi yêu cầu được phê duyệt, tiền sẽ được hoàn về ví Yufiz của bạn trong 3-5 ngày làm việc.",
        },
      ],
    },
    {
      category: "Phạm vi trách nhiệm",
      questions: [
        {
          q: "Yufiz chịu trách nhiệm về chất lượng hàng không?",
          a: "Yufiz chịu trách nhiệm kiểm tra hàng theo yêu cầu khách hàng tại kho Trung Quốc. Tuy nhiên, chúng tôi không chịu trách nhiệm về chất lượng sản phẩm từ người bán. Bạn nên kiểm tra kỹ đánh giá người bán trước khi đặt.",
        },
      ],
    },
    {
      category: "Điều khoản sử dụng",
      questions: [
        {
          q: "Chính sách về hàng cấm nhập khẩu?",
          a: "Yufiz không hỗ trợ đặt các mặt hàng thuộc danh mục cấm nhập khẩu theo quy định của Việt Nam như: vũ khí, ma túy, thuốc chưa có giấy phép, hàng vi phạm bản quyền, v.v.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h1>
      <p className="text-muted-foreground mb-8">
        Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ của chúng tôi
      </p>

      <div className="space-y-6">
        {faqs.map((category, catIndex) => (
          <div key={catIndex}>
            <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
            <div className="space-y-3">
              {category.questions.map((faq, qIndex) => {
                const index = catIndex * 100 + qIndex;
                const isOpen = openIndex === index;

                return (
                  <Card key={qIndex} className="overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="font-semibold pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t text-muted-foreground">
                        {faq.a}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
