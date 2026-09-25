import { test, expect, Page } from "@playwright/test";

const totals = (quantity: number) => {
  const total = 383250 * quantity + 71500;
  return { quantity, grandTotalVnd: total, depositAmountVnd: Math.round(total * .7), finalAmountVnd: total - Math.round(total * .7),
    depositPercent: .7, exchangeRate: 3650, totalCny: total / 3650,
    costBreakdown: [{ label: "Tiền hàng", value: 365000 * quantity, currency: "₫" },
      { label: "Vận chuyển nội địa TQ (mỗi đơn)", value: 36500, currency: "₫" },
      { label: "Phí dịch vụ", value: 18250 * quantity, currency: "₫" },
      { label: "Vận chuyển quốc tế (mỗi đơn)", value: 25000, currency: "₫" },
      { label: "Bảo hiểm (mỗi đơn)", value: 10000, currency: "₫" }] };
};
async function fixture(page: Page, loggedIn = true) {
  await page.addInitScript((loggedIn) => {
    if (loggedIn) {
      localStorage.setItem("token", "test-token"); localStorage.setItem("userId","1");
      localStorage.setItem("userEmail","customer@example.com"); localStorage.setItem("userFullName","Khách kiểm thử");
      localStorage.setItem("userRole","CUSTOMER");
    }
  }, loggedIn);
  let paid = false, favorite = false, pending = false;
  const quote = { ...totals(1), quoteId: 1, nameZh: "测试相机", nameVi: "Máy ảnh kiểm thử", descriptionVi: "Mô tả sản phẩm đã dịch.",
    images: [], priceCny: 100, priceVndEstimate: 365000, variants: [], translationComplete: true,
    expiresAt: "2099-01-01T00:00:00", exchangeRateUpdatedAt: "15/09/2026 12:00", seller: { name: "Shop kiểm thử", level: "L7", rating: 4.95, reviews: 99 } };
  const order = () => ({ id: 42, orderCode: "ORD-TEST-42", status: paid ? "DEPOSIT_PAID" : "WAITING_DEPOSIT", quantity: 2,
    totalAmountVnd: 838000, depositAmountVnd: 586600, finalAmountVnd: 251400, paidAmountVnd: paid ? 586600 : 0,
    productName: quote.nameVi, productImageUrl: null, shippingAddress: "Địa chỉ kiểm thử", createdAt: "2026-09-15",
    costSnapshotJson: JSON.stringify(totals(2)), timeline: [] });
  const payment = () => ({ id: 9, orderId: 42, orderCode: "ORD-TEST-42", method: "BANK_TRANSFER", status: paid ? "PAID" : "PENDING",
    amountVnd: 586600, merchantReference: "TEST-TRANSFER", instructions: { qrUrl: null, payUrl: null, bankCode: "TEST", accountNumber: "000", accountName: "TEST", transferContent: "TEST-TRANSFER" } });
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url()), path = url.pathname, method = route.request().method();
    const json = (data: unknown, status = 200) => route.fulfill({ status, json: data });
    if (path === "/api/quotes/1") return json(quote);
    if (path === "/api/quotes/1/price-preview") return json(totals(Number(url.searchParams.get("quantity") || 1)));
    if (path.endsWith("/similar-products")) return json([]);
    if (path.startsWith("/api/wishlist/check")) return json(favorite);
    if (path.startsWith("/api/wishlist")) { favorite = method !== "DELETE"; return json({}, method === "POST" ? 201 : 200); }
    if (path === "/api/orders" && method === "POST") return json({ orderId: 42 }, 201);
    if (path === "/api/orders/42") return json(order());
    if (path === "/api/payments/methods") return json([{method:"BANK_TRANSFER",available:true},{method:"MOMO",available:false},{method:"ZALOPAY",available:false}]);
    if (path.endsWith("/deposit-payments/latest")) return pending ? json(payment()) : route.fulfill({status:204});
    if (path.endsWith("/deposit-payments")) { pending = true; return json(payment()); }
    return json({ message: "Unexpected test endpoint " + path }, 404);
  });
  return { markPaid: () => { paid = true; }, markPending: () => { pending = true; } };
}
test("product → wishlist → quantity pricing → real order ID → pending payment", async ({page}) => {
  await fixture(page);
  await page.goto("/product/1");
  await expect(page.getByRole("heading",{name:"Máy ảnh kiểm thử",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Yêu thích",exact:true}).click();
  await expect(page.getByRole("button",{name:"Đã yêu thích",exact:true})).toBeVisible();
  await page.getByRole("spinbutton",{name:"Số lượng"}).fill("2");
  await expect(page.getByText("838.000", {exact:false}).first()).toBeVisible();
  await page.getByRole("button",{name:"Đặt hàng ngay"}).click();
  await page.getByLabel("Địa chỉ giao hàng").fill("Khách kiểm thử, 0900000000, 123 Lê Lợi, TP HCM");
  const created = page.waitForRequest(r => r.url().endsWith("/api/orders") && r.method()==="POST");
  await page.getByRole("button",{name:"Tạo đơn và tiếp tục thanh toán"}).click();
  expect((await created).postDataJSON()).toMatchObject({ quantity:2, expectedTotalVnd:838000 });
  await expect(page).toHaveURL(/order\/payment\?orderId=42/);
  await page.getByRole("button",{name:"Tiếp tục với Chuyển khoản ngân hàng"}).click();
  await expect(page.getByRole("heading",{name:"Chờ xác nhận · Chuyển khoản ngân hàng"})).toBeVisible();
  await expect(page).not.toHaveURL(/success/);
});
test("success page stays pending until server confirms payment; reload retains correct order", async ({page}) => {
  const data=await fixture(page);
  await page.goto("/order/success?orderId=42");
  await expect(page.getByRole("heading",{name:"Đơn hàng đã được tạo"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Đã nhận tiền cọc!"})).toHaveCount(0);
  await page.screenshot({path:"test-results/order-pending.png", fullPage:true});
  data.markPaid(); await page.getByRole("button",{name:"Cập nhật trạng thái"}).click();
  await expect(page.getByRole("heading",{name:"Đã nhận tiền cọc!"})).toBeVisible();
  await page.reload(); await expect(page.getByText("ORD-TEST-42",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Theo dõi đơn"}).click();
  await expect(page).toHaveURL(/orders\/42/);
  await expect(page.getByRole("heading",{name:"Đơn ORD-TEST-42"})).toBeVisible();
});
test("deposit can be paid immediately from the real Yufiz wallet balance",async({page})=>{
 await fixture(page);
 await page.route("**/api/payments/methods",r=>r.fulfill({json:[{method:"WALLET",available:true},{method:"BANK_TRANSFER",available:true},{method:"MOMO",available:false},{method:"ZALOPAY",available:false}]}));
 await page.route("**/api/user/profile",r=>r.fulfill({json:{id:1,fullName:"Khách kiểm thử",email:"customer@example.com",walletBalance:700000,loyaltyPoints:0}}));
 await page.route("**/api/orders/42/deposit-payments/latest",r=>r.fulfill({status:204}));
 await page.route("**/api/orders/42/deposit-payments",async r=>{
   expect(r.request().postDataJSON()).toEqual({method:"WALLET"});
   await r.fulfill({json:{id:10,orderId:42,orderCode:"ORD-TEST-42",type:"DEPOSIT_70",method:"WALLET",status:"PAID",amountVnd:586600,merchantReference:"WALLET_TEST",instructions:null,message:null}});
 });
 await page.goto("/order/payment?orderId=42");
 await page.getByText("Ví Yufiz",{exact:true}).click();
 await expect(page.getByText("Số dư hiện tại: 700.000",{exact:false})).toBeVisible();
 await page.getByRole("button",{name:"Thanh toán 586.600 ₫ bằng Ví Yufiz"}).click();
 await expect(page).toHaveURL(/order\/success\?orderId=42/);
});
test("checkout keeps its URL when login is required", async ({page}) => {
  await fixture(page,false); await page.goto("/order/confirm?quoteId=1&quantity=2");
  await expect(page.getByText("Vui lòng đăng nhập để đặt hàng.")).toBeVisible();
  await page.getByRole("main").getByRole("button",{name:"Đăng nhập",exact:true}).click();
  await expect(page).toHaveURL(/login\?next=/);
});
test("mobile detail remains readable with unavailable image and no recommendations", async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await fixture(page);
  await page.goto("/product/1");
  await expect(page.getByText("Chưa có ảnh",{exact:true})).toBeVisible();
  await expect(page.getByText("Chưa có sản phẩm phù hợp để gợi ý.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:"test-results/product-mobile.png",fullPage:true});
});

test("final payment uses remaining balance and cannot mistake the deposit for full payment", async ({page})=>{
  await fixture(page);
  let settled=false;
  const current=()=>({id:42,orderCode:"ORD-FINAL",status:settled?"FINAL_PAID":"WAITING_FINAL_PAYMENT",quantity:2,
    totalAmountVnd:838000,depositAmountVnd:586600,finalAmountVnd:251400,paidAmountVnd:settled?838000:586600,
    productName:"Máy ảnh",shippingAddress:"Địa chỉ thử nghiệm",timeline:[]});
  await page.route("**/api/orders/42?**",r=>r.fulfill({json:current()}));
  await page.route("**/api/orders/42/final-payments/latest",r=>r.fulfill({status:204}));
  await page.route("**/api/orders/42/final-payments",r=>r.fulfill({json:{id:10,orderId:42,type:"FINAL_30",method:"BANK_TRANSFER",
    status:"PENDING",amountVnd:251400,merchantReference:"FINAL-42",instructions:null}}));
  await page.goto("/orders/42/final-payment");
  await expect(page.getByRole("heading",{name:"Thanh toán phần còn lại",exact:true})).toBeVisible();
  await expect(page.getByText("Cần thanh toán: 251.400",{exact:false})).toBeVisible();
  const request=page.waitForRequest(r=>r.url().endsWith("/final-payments") && r.method()==="POST");
  await page.getByRole("button",{name:"Tiếp tục với Chuyển khoản ngân hàng"}).click();
  expect((await request).postDataJSON()).toEqual({method:"BANK_TRANSFER"});
  await page.goto("/order/success?orderId=42&phase=final");
  await expect(page.getByRole("heading",{name:"Đã thanh toán đủ!"})).toHaveCount(0);
  settled=true;
  await page.getByRole("button",{name:"Cập nhật trạng thái"}).click();
  await expect(page.getByRole("heading",{name:"Đã thanh toán đủ!"})).toBeVisible();
});

test("admin advances only the next fulfillment step and submits current status",async({page})=>{
  await fixture(page);
  await page.addInitScript(()=>localStorage.setItem("userRole","ADMIN"));
  let status="DEPOSIT_PAID";
  const detail=()=>({id:42,orderCode:"ORD-ADMIN",status,quantity:1,totalAmountVnd:100000,depositAmountVnd:70000,
    paidAmountVnd:70000,shippingAddress:"Địa chỉ",timeline:[],productName:"Máy ảnh"});
  await page.route("**/api/admin/orders/42",r=>r.fulfill({json:detail()}));
  await page.route("**/api/admin/orders/42/status",async r=>{
    expect(r.request().postDataJSON()).toMatchObject({expectedStatus:"DEPOSIT_PAID",status:"PURCHASED",note:"Đã mua, mã TEST"});
    status="PURCHASED";await r.fulfill({json:detail()});
  });
  await page.goto("/admin/orders/42");
  await expect(page.getByRole("heading",{name:"Xử lý đơn ORD-ADMIN"})).toBeVisible();
  await page.getByLabel("Ghi chú xử lý / mã vận đơn").fill("Đã mua, mã TEST");
  await page.getByRole("button",{name:"Xác nhận bước tiếp theo"}).click();
  await expect(page.getByText("Trạng thái: Đã mua hàng",{exact:true})).toBeVisible();
});

test("wallet renders API values and empty records without demo transactions",async({page})=>{
 await fixture(page);
 await page.route("**/api/user/wallet",r=>r.fulfill({json:{profile:{walletBalance:987654,loyaltyPoints:7},transactions:[],vouchers:[]}}));
 await page.goto("/wallet");
 await expect(page.getByText("987.654",{exact:false})).toBeVisible();
 await expect(page.getByText("Chưa có dữ liệu.",{exact:true})).toHaveCount(2);
 await expect(page.getByText("311,057",{exact:false})).toHaveCount(0);
});
test("account menu opens on hover and renders the real profile balance",async({page})=>{
 await fixture(page);
 await page.route("**/api/user/profile",r=>r.fulfill({json:{id:1,fullName:"Khách kiểm thử",email:"customer@example.com",phoneNumber:"0900000000",walletBalance:987654,loyaltyPoints:12}}));
 await page.goto("/");
 const trigger=page.getByRole("button",{name:"Tài khoản của Khách kiểm thử"});
 await trigger.hover();
 const menu=page.getByRole("menu",{name:"Menu tài khoản"});
 await expect(menu).toBeVisible();
 await expect(menu.getByText("customer@example.com",{exact:true})).toBeVisible();
 await expect(menu.getByText("987.654",{exact:false})).toBeVisible();
 await expect(menu.getByRole("menuitem",{name:"Nạp tiền"})).toHaveAttribute("href","/wallet");
});
test("profile page renders backend data and keeps profile and address actions usable",async({page})=>{
 await fixture(page);let updatedName="Khách kiểm thử";
 await page.route("**/api/user/profile",async r=>{
   if(r.request().method()==="PUT"){updatedName=r.request().postDataJSON().fullName;return r.fulfill({status:200,body:"Đã lưu"});}
   return r.fulfill({json:{id:1,fullName:updatedName,email:"customer@example.com",phoneNumber:"0900000000",walletBalance:987654,loyaltyPoints:12,referralCode:"YUFIZ12"}});
 });
 await page.route("**/api/user/addresses?**",r=>r.fulfill({json:[{id:7,fullName:"Khách kiểm thử",phone:"0900000000",addressDetail:"123 Lê Lợi, TP HCM",isDefault:true}]}));
 await page.goto("/profile");
 await expect(page.getByRole("heading",{name:"Hồ sơ của bạn"})).toBeVisible();
 await expect(page.getByText("987.654",{exact:false})).toBeVisible();
 await page.getByLabel("Họ và tên").fill("Nguyễn Yufiz");
 await page.getByRole("button",{name:"Lưu thay đổi"}).click();
 await expect(page.getByText("Thông tin cá nhân đã được cập nhật.")).toBeVisible();
 expect(updatedName).toBe("Nguyễn Yufiz");
 await page.getByRole("button",{name:/Địa chỉ giao hàng/}).click();
 await expect(page.getByText("123 Lê Lợi, TP HCM",{exact:true})).toBeVisible();
 await expect(page.getByText("Mặc định",{exact:true})).toBeVisible();
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:"test-results/profile-redesign.png",fullPage:true});
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:"test-results/profile-redesign-mobile.png",fullPage:true});
});
test("support sends persisted API message and does not generate a fake reply",async({page})=>{
 await fixture(page);let messages:any[]=[];
 await page.route("**/api/user/support",async r=>{
   if(r.request().method()==="POST"){messages=[{id:1,sender:"Khách kiểm thử",message:r.request().postDataJSON().message,createdAt:"2026-09-16"}];await r.fulfill({status:200});}
   else await r.fulfill({json:messages});
 });
 await page.goto("/chat");
 await page.getByLabel("Nội dung").fill("Kiểm tra đơn của tôi");
 await page.getByRole("button",{name:"Gửi tin nhắn",exact:true}).click();
 await expect(page.getByText("Kiểm tra đơn của tôi",{exact:true})).toBeVisible();
 await expect(page.getByText("Chưa có tin nhắn.",{exact:true})).toHaveCount(0);
});

test("wallet topup creates VietQR and refreshes balance after server receipt",async({page})=>{
 await fixture(page);let paid=false,created=false;
 const topup=()=>({id:77,amount:150000,reference:"YFZABCDEF1234567890ABCD",status:paid?"PAID":"PENDING",bankCode:"TEST",accountNumber:"123456",accountName:"TEST",qrUrl:"https://img.vietqr.io/image/TEST-123456-compact2.png?amount=150000&addInfo=YFZABCDEF1234567890ABCD",message:null});
 await page.route("**/api/user/wallet",r=>r.fulfill({json:{profile:{walletBalance:paid?175000:25000,loyaltyPoints:0},transactions:[],vouchers:[]}}));
 await page.route("**/api/user/wallet/topups/config",r=>r.fulfill({json:{available:true,minAmount:10000,maxAmount:50000000}}));
 await page.route("**/api/user/wallet/topups/latest",r=>created?r.fulfill({json:topup()}):r.fulfill({status:204}));
 await page.route("**/api/user/wallet/topups",async r=>{expect(r.request().postDataJSON().amount).toBe(150000);created=true;await r.fulfill({json:topup()});});
 await page.route("**/api/user/wallet/topups/77",r=>r.fulfill({json:topup()}));
 await page.route("https://img.vietqr.io/**",r=>r.fulfill({status:200,contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>'}));
 await page.goto("/wallet");
 await page.getByLabel("Số tiền muốn nạp (VND)").fill("150000");
 await page.getByRole("button",{name:"Tạo mã VietQR"}).click();
 await expect(page.getByAltText("VietQR nạp tiền vào ví")).toHaveAttribute("src",/amount=150000/);
 await expect(page.getByText("YFZABCDEF1234567890ABCD",{exact:true})).toBeVisible();
 await page.reload();
 await expect(page.getByAltText("VietQR nạp tiền vào ví")).toBeVisible();
 paid=true;
 await expect(page.getByText("Đã nạp thành công",{exact:false})).toBeVisible({timeout:10000});
 await expect(page.getByText("175.000",{exact:false})).toBeVisible();
});

test("pending wallet topup can go back to change amount or be cancelled",async({page})=>{
 await fixture(page);let created=false,cancelled=false;
 const topup=()=>({id:88,amount:150000,reference:"YFZ11111111111111111111",status:cancelled?"CANCELLED":"PENDING",bankCode:"TEST",accountNumber:"123456",accountName:"TEST",qrUrl:"https://img.vietqr.io/image/TEST.png",message:cancelled?"Bạn đã hủy yêu cầu nạp tiền":null});
 await page.route("**/api/user/wallet",r=>r.fulfill({json:{profile:{walletBalance:25000,loyaltyPoints:0},transactions:[],vouchers:[]}}));
 await page.route("**/api/user/wallet/topups/config",r=>r.fulfill({json:{available:true,minAmount:10000,maxAmount:50000000}}));
 await page.route("**/api/user/wallet/topups/latest",r=>created?r.fulfill({json:topup()}):r.fulfill({status:204}));
 await page.route("**/api/user/wallet/topups",async r=>{created=true;await r.fulfill({json:topup()});});
 await page.route("**/api/user/wallet/topups/88/cancel",async r=>{cancelled=true;await r.fulfill({json:topup()});});
 await page.route("**/api/user/wallet/topups/88",r=>r.fulfill({json:topup()}));
 await page.route("https://img.vietqr.io/**",r=>r.fulfill({status:200,contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
 await page.goto("/wallet");await page.getByLabel("Số tiền muốn nạp (VND)").fill("150000");await page.getByRole("button",{name:"Tạo mã VietQR"}).click();
 await page.getByRole("button",{name:"Quay lại · Đổi số tiền"}).click();
 await expect(page.getByLabel("Số tiền muốn nạp (VND)")).toHaveValue("150000");
 cancelled=false;await page.getByLabel("Số tiền muốn nạp (VND)").fill("200000");await page.getByRole("button",{name:"Tạo mã VietQR"}).click();
 await page.getByRole("button",{name:"Hủy yêu cầu nạp"}).click();
 await expect(page.getByText("đã được hủy",{exact:false})).toBeVisible();
 await expect(page.getByRole("button",{name:"Tạo yêu cầu nạp mới"})).toBeVisible();
});

test("wallet topup countdown follows backend expiry and unlocks a new request",async({page})=>{
 await fixture(page);const deadline=Date.now()+2200;
 const topup=()=>({id:99,amount:100000,reference:"YFZ22222222222222222222",status:Date.now()>=deadline?"EXPIRED":"PENDING",bankCode:"TEST",accountNumber:"123456",accountName:"TEST",qrUrl:"https://img.vietqr.io/image/TEST.png",message:null,expiresAt:new Date(deadline).toISOString()});
 await page.route("**/api/user/wallet",r=>r.fulfill({json:{profile:{walletBalance:0,loyaltyPoints:0},transactions:[],vouchers:[]}}));
 await page.route("**/api/user/wallet/topups/config",r=>r.fulfill({json:{available:true,minAmount:10000,maxAmount:50000000}}));
 await page.route("**/api/user/wallet/topups/latest",r=>r.fulfill({json:topup()}));
 await page.route("**/api/user/wallet/topups/99",r=>r.fulfill({json:topup()}));
 await page.route("https://img.vietqr.io/**",r=>r.fulfill({status:200,contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
 await page.goto("/wallet");
 await expect(page.getByRole("timer")).toContainText(":");
 await expect(page.getByText("Yêu cầu đã hết hạn sau 10 phút.")).toBeVisible({timeout:7000});
 await expect(page.getByRole("button",{name:"Tạo yêu cầu nạp mới"})).toBeVisible();
});
