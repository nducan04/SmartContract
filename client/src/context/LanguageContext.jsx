import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const translations = {
  vi: {
    // Navbar
    navHome: "Trang chủ",
    navTracking: "Theo dõi hợp đồng",
    navDashboard: "Dashboard",
    navSearchPlaceholder: "Tìm kiếm theo ID...",
    navConnectWallet: "Kết nối ví",
    navDisconnect: "Đăng xuất",
    navWalletTitle: "Thông tin ví",
    navLangLabel: "VI",

    // Hero
    heroBadge: "Công nghệ Blockchain 4.0",
    heroTitleLine1: "Quản Lý Hợp Đồng",
    heroTitleLine2: "Minh Bạch & Tự Động",
    heroDesc:
      "Giải pháp tối ưu cho chuỗi cung ứng logistics. Loại bỏ trung gian, giảm thiểu rủi ro và tự động hóa thanh toán với Smart Contract an toàn tuyệt đối.",
    heroBtnStart: "Bắt đầu ngay",
    heroBtnGuide: "Xem hướng dẫn",
    heroStatSecurity: "Bảo mật",
    heroStatLatency: "Độ trễ thanh toán",

    // Benefits
    benefitsTitle: "Tại Sao Nên Chọn Hệ thống Của Chúng Tôi?",
    benefitsSubtitle:
      "Khám phá những lợi ích vượt trội mà công nghệ hợp đồng thông minh mang lại cho quy trình quản lý của bạn.",
    benefit1Title: "Minh bạch tuyệt đối",
    benefit1Desc:
      "Mọi trạng thái, lịch sử của hợp đồng đều được ghi lại vĩnh viễn trên Blockchain, không thể thay đổi hay xóa bỏ.",
    benefit2Title: "Tự động thanh toán (Escrow)",
    benefit2Desc:
      "Tiền ký quỹ được khóa an toàn. Hợp đồng sẽ tự động thanh toán cho Nhà cung cấp ngay khi Người nhận xác nhận, không cần bên thứ ba.",
    benefit3Title: "Bảo mật & Bất biến",
    benefit3Desc:
      "Sử dụng mã hóa và cơ chế đồng thuận phi tập trung, đảm bảo không ai có thể can thiệp hay làm giả thông tin hợp đồng.",

    // HowItWorks
    howTitle: "Quy Trình Hoạt Động",
    howSubtitle: "Đơn giản hóa quy trình phức tạp chỉ trong 4 bước.",
    step1Title: "Tạo Hợp Đồng",
    step1Desc:
      "Client nhập thông tin, tải điều khoản lên IPFS và ký quỹ tiền ETH.",
    step2Title: "Nhà Vận Chuyển Nhận",
    step2Desc: "Provider xem xét đơn hàng trên sàn và xác nhận thực hiện.",
    step3Title: "Thực Hiện & Cập Nhật",
    step3Desc: "Cập nhật trạng thái vận chuyển theo thời gian thực lên Blockchain.",
    step4Title: "Xác Nhận & Trả Tiền",
    step4Desc:
      "Người nhận xác nhận. Hợp đồng tự động mở khóa tiền chuyển cho Provider.",

    // CallToAction
    ctaTitle: "Sẵn Sàng Minh Bạch Hóa Quy Trình Của Bạn?",
    ctaDesc:
      "Tham gia ngay hôm nay để trải nghiệm sức mạnh của hợp đồng thông minh. Kết nối ví của bạn và tạo thỏa thuận đầu tiên chỉ trong vài phút.",
    ctaBtn: "Bắt đầu ngay",

    // Footer
    footerDesc:
      "Nền tảng quản lý hợp đồng phi tập trung, đảm bảo minh bạch, tự động và bảo mật bằng công nghệ Blockchain.",
    footerQuickLinks: "LIÊN KẾT NHANH",
    footerAboutUs: "Về Chúng Tôi",
    footerSupport: "HỖ TRỢ",
    footerFaq: "Câu Hỏi Thường Gặp - FAQ",
    footerTerms: "Điều Khoản Dịch Vụ",
    footerPrivacy: "Chính Sách Bảo Mật",
    footerInsurance: "Chính Sách Bảo Hiểm",
    footerContact: "LIÊN HỆ",
    footerPolicy: "Chính Sách",
    footerCookies: "Cookies",

    // TutorialModal
    tutStep1Title: "1. Ví điện tử là gì?",
    tutStep1Content:
      "Ví điện tử là một tài khoản online, ứng dụng trên thiết bị di động hoặc website, cho phép người dùng lưu trữ, quản lý tiền và thực hiện các giao dịch tài chính như thanh toán hóa đơn, mua sắm trực tuyến, chuyển tiền nhanh chóng mà không cần tiền mặt. Thay vì dùng tên đăng nhập và mật khẩu, bạn dùng ví để kết nối và xác thực danh tính nhanh chóng, an toàn.",
    tutStep2Title: "2. Cài đặt & bảo mật",
    tutStep2Content:
      "Bạn có thể tải MetaMask dưới dạng tiện ích mở rộng (Extension) trên Chrome/Edge. Lưu ý: không chia sẻ 12 từ khóa khôi phục (Seed code) cho bất kỳ ai.",
    tutStep3Title: "3. Phí gas là gì?",
    tutStep3Content:
      'Mọi thao tác trên blockchain như ký hợp đồng,... đều cần một lượng phí nhỏ gọi là "Gas". Bạn cần có sẵn một ít ETH trong ví để trả phí này. Nếu đang dùng thử Testnet, bạn có thể nhận ETH miễn phí từ các trang web cung cấp một lượng nhỏ ETH.',
    tutStep4Title: "4. Quy trình ký hợp đồng",
    tutStep4Content:
      "Bước 1: bên A tạo hợp đồng và nhập địa chỉ ví Bên B.\nBước 2: bên B vào web, kiểm tra nội dung và ký xác nhận (thanh toán tiền cọc nếu có).\nBước 3: mọi dữ liệu được lưu vĩnh viễn và minh bạch trên Blockchain.",
    tutStep5Title: "Cùng Bắt Đầu Nhé!",
    tutStep5Content:
      'Sau khi đã nắm được các khái niệm cơ bản, hãy nhấn "Kết nối ví" ở góc phải màn hình để trải nghiệm hệ thống quản lý hợp đồng thông minh ngay.',
    tutPrev: "Quay lại",
    tutNext: "Tiếp theo",
    tutFinish: "Hoàn tất",

    // Sidebar & Dashboard Layout
    sideMainNav: "Điều hướng chính",
    sideOverview: "Tổng quan",
    sideContracts: "Quản lý hợp đồng",
    sideMarketplace: "Sàn hợp đồng",
    sideCreate: "Tạo hợp đồng mới",
    sideAdminSection: "Quản trị viên",
    sideAdmin: "Quản trị hệ thống",
    sideAccount: "Tài khoản",
    sideOnline: "Online",
    sideGuest: "Khách",
    themeLight: "Sáng",
    themeDark: "Tối",
    backToHome: "Về trang chủ",

    // Dashboard Overview
    dashOverviewTitle: "Tổng quan hệ thống",
    dashOverviewSub: "Theo dõi hiệu suất chuỗi cung ứng của bạn",
    dashCreateBtn: "Tạo hợp đồng",
    dashNotConnected: "Chưa kết nối ví",
    dashNotConnectedSub: "Vui lòng kết nối ví MetaMask để xem tổng quan hệ thống của bạn.",
    statCreated: "Đơn hàng đã tạo",
    statReceived: "Đơn hàng đã nhận",
    statShipping: "Đơn hàng vận chuyển",
    statWaiting: "Chờ xác nhận",
    statCompleted: "Đã hoàn thành",
    statTotal: "Tổng hoạt động",
    dashRecentTitle: "Hoạt động gần đây",
    dashNoRecent: "Chưa có hoạt động nào gần đây.",
    roleClient: "Chủ hợp đồng (Bên A)",
    roleReceiver: "Người nhận (Bên B)",
    roleProvider: "Vận chuyển",
    roleMember: "Thành viên",
    labelContract: "Hợp đồng:",
    labelPartner: "Đối tác:",
    labelReceiverB: "Bên nhận (Bên B):",
    labelClientA: "Bên giao (Bên A):",
    labelOwnerA: "Chủ hàng (Bên A):",
    labelValue: "Giá trị",
    labelStatus: "Trạng thái:",
    btnDetails: "Chi tiết",

    // Chart
    chartTitle: "Phân bổ trạng thái",
    chartTotal: "Tổng số",
    chartNoData: "Chưa có dữ liệu biểu đồ",
    chartNew: "Mới tạo",
    chartProcessing: "Đang xử lý",
    chartCompleted: "Hoàn thành",
    chartCancelled: "Đã hủy",
    chartCount: "đơn",

    // Contract Statuses
    statusCreated: "Mới tạo",
    statusAccepted: "Đã chấp nhận",
    statusShipping: "Đang vận chuyển",
    statusCompleted: "Đã hoàn thành",
    statusPaid: "Đã thanh toán",
    statusCancelled: "Đã hủy",

    // Contract List Page & Components
    listTitle: "Quản lý hợp đồng",
    listSub: "Danh sách và trạng thái các hợp đồng của bạn",
    listGuestWarning: "Bạn đang ở chế độ khách để trải nghiệm demo.",
    listGuestSub: "Hệ thống đang hiển thị toàn bộ danh sách hợp đồng công khai trên Blockchain. Để tạo và bảo mật quản lý hợp đồng của riêng bạn, hãy kết nối ví của bạn.",
    listFilterTitle: "Bộ lọc & Trích xuất dữ liệu",
    listFilterStatus: "Trạng thái:",
    listFilterAll: "-- Tất cả --",
    listFilterStatus0: "Mới tạo (Chờ nhận)",
    listFilterStatus1: "Đã chấp nhận",
    listFilterStatus2: "Đang thực hiện",
    listFilterStatus3: "Đã hoàn thành (Chờ TT)",
    listFilterStatus4: "Đã thanh toán (Xong)",
    listFilterStatus5: "Đã hủy",
    listFilterFrom: "Từ:",
    listFilterTo: "Đến:",
    listFilterClear: "Xóa lọc",
    listShowing: "Đang hiển thị",
    listContractsByCriteria: "hợp đồng theo tiêu chí.",
    listPage: "Trang",
    listPrev: "Trước",
    listNext: "Tiếp",
    btnCreateNew: "Tạo mới",
    btnExportExcel: "Xuất Excel",
    filterRoleAll: "Tất cả vai trò",
    filterRoleClient: "Là người tạo (Bên A)",
    filterRoleProvider: "Là vận chuyển",
    filterRoleReceiver: "Là người nhận (Bên B)",
    tabAddress: "Mã Hợp đồng",
    tabRole: "Vai trò",
    tabValue: "Giá trị",
    tabDate: "Ngày tạo",
    tabStatus: "Trạng thái",
    tabAction: "Thao tác",
    btnView: "Xem chi tiết",
    btnQR: "Mã QR",
    emptyTable: "Không tìm thấy hợp đồng nào phù hợp.",

    // Create Contract Page
    createTitle: "Khởi tạo hợp đồng kỹ thuật số",
    createSec1: "1. Thông số Smart Contract",
    createReceiver: "Ví Người nhận (Bên B)",
    createDeposit: "Ký quỹ (ETH)",
    createPenalty: "Phạt trễ (ETH)",
    createDeadline: "Hạn chót cam kết",
    createOriginalFile: "File Hợp đồng gốc (PDF có dấu)",
    createSec2: "2. Thông tin Bên Bán / Bên Gửi (Bên A)",
    createNamePlaceholder: "Tên Công ty / Cá nhân",
    createAddressPlaceholder: "Địa chỉ trụ sở",
    createMstPlaceholder: "Mã số thuế",
    createRepPlaceholder: "Người đại diện",
    createSec3: "3. Thông tin Bên Mua / Bên Nhận (Bên B)",
    createSec4: "4. Các điều khoản thỏa thuận",
    createArt1: "Điều 1: Tên hàng, số lượng, chất lượng",
    createArt2: "Điều 2: Quy cách đóng gói",
    createArt3: "Điều 3: Giá cả hàng hóa",
    createArt4: "Điều 4: Thời gian & Địa điểm giao hàng",
    createArt5: "Điều 5: Phương thức thanh toán",
    createArt6_1: "Điều 6.1: Trách nhiệm Bên A",
    createArt6_2: "Điều 6.2: Trách nhiệm Bên B",
    createArt7: "Điều 7: Điều khoản chung",
    createSubmitBtn: "Ký & Khởi tạo hợp đồng",
    createProcessing: "Đang xử lý giao dịch...",
    // Contract Details Page
    detailPrint: "In Báo Cáo / Lưu PDF",
    detailRepublic: "Cộng hòa xã hội chủ nghĩa Việt Nam",
    detailMotto: "Độc lập - Tự do - Hạnh phúc",
    detailContractTitle: "Hợp đồng Giao nhận & Vận chuyển",
    detailId: "Mã số (Smart Contract ID):",
    detailToday: "Hôm nay, ngày",
    detailWeInclude: ", chúng tôi gồm có:",
    detailPartyA: "Bên Giao / Bên Bán (Bên A)",
    detailPartyB: "Bên Nhận / Bên Mua (Bên B)",
    detailName: "Tên cá nhân/Tổ chức:",
    detailAddress: "Địa chỉ:",
    detailTax: "Mã số thuế:",
    detailRep: "Người đại diện:",
    detailWallet: "Ví Blockchain xác thực:",
    detailAgreement: "Sau khi bàn bạc, hai bên thống nhất ký kết hợp đồng với những điều khoản sau:",
    detailSignA: "ĐẠI DIỆN BÊN A",
    detailSignB: "ĐẠI DIỆN BÊN B",
    detailSignProvider: "ĐƠN VỊ VẬN CHUYỂN",
    detailSignNote: "(Ký & Ghi rõ họ tên / Ký số Blockchain)",
    // Marketplace Page
    marketBadge: "Sàn hợp đồng công khai",
    marketTitle: "Thị trường đơn hàng & Hợp đồng",
    marketSubtitle: "Nhận việc vận chuyển hoặc kiểm tra các thỏa thuận mua bán mở trên toàn hệ thống",
    marketLoading: "Đang tải sàn hợp đồng...",
    marketFilterNewest: "Mới nhất",
    marketFilterHighPrice: "Giá cao nhất",
    marketEmpty: "Hiện tại chưa có đơn hàng nào.",
    marketOrderContent: "Nội dung đơn hàng",
    marketPartyA: "Bên Giao (Bên A)",
    marketPartyB: "Bên Nhận (Bên B)",
    marketDeposit: "Ký quỹ",
    marketAction: "Hành động",
    marketYourContract: "Hợp đồng của bạn",
    marketYouAreReceiver: "Bạn là người nhận",
    marketTakeJob: "Nhận việc ngay",
    marketNew: "MỚI",
    // Chatbot AI
    chatTitle: "Trợ lý AI",
    chatSubtitle: "Hỏi tôi bất cứ điều gì về hệ thống",
    chatPlaceholder: "Nhập câu hỏi của bạn...",
    chatSend: "Gửi",
    chatThinking: "Đang suy nghĩ...",
    chatError: "Đã xảy ra lỗi. Vui lòng thử lại.",
    chatWelcome: "Xin chào! 👋 Tôi là trợ lý AI của hệ thống Smart Contract. Tôi có thể giúp bạn tra cứu hợp đồng, hướng dẫn sử dụng và giải đáp mọi thắc mắc.",
    chatSuggest1: "Smart Contract là gì?",
    chatSuggest2: "Làm sao để tạo hợp đồng?",
    chatSuggest3: "Kiểm tra hợp đồng của tôi",
  },
  en: {
    // Navbar
    navHome: "Home",
    navTracking: "Track Contract",
    navDashboard: "Dashboard",
    navSearchPlaceholder: "Search by ID...",
    navConnectWallet: "Connect Wallet",
    navDisconnect: "Disconnect",
    navWalletTitle: "Wallet Info",
    navLangLabel: "EN",

    // Hero
    heroBadge: "Blockchain 4.0 Technology",
    heroTitleLine1: "Smart Contract Management",
    heroTitleLine2: "Transparent & Automated",
    heroDesc:
      "The ultimate solution for logistics supply chain. Eliminate intermediaries, minimize risk, and automate payments with maximum security Smart Contracts.",
    heroBtnStart: "Get Started",
    heroBtnGuide: "Watch Tutorial",
    heroStatSecurity: "Security",
    heroStatLatency: "Payment Latency",

    // Benefits
    benefitsTitle: "Why Choose Our System?",
    benefitsSubtitle:
      "Discover the outstanding benefits that smart contract technology brings to your management workflow.",
    benefit1Title: "Absolute Transparency",
    benefit1Desc:
      "Every contract status and history is permanently recorded on the Blockchain, tamper-proof and unerasable.",
    benefit2Title: "Automated Escrow Payment",
    benefit2Desc:
      "Escrow funds are locked securely. The contract automatically pays the Provider as soon as the Receiver confirms, no third party required.",
    benefit3Title: "Security & Immutability",
    benefit3Desc:
      "Using encryption and decentralized consensus, ensuring no one can tamper with or forge contract data.",

    // HowItWorks
    howTitle: "How It Works",
    howSubtitle: "Simplify complex processes in just 4 simple steps.",
    step1Title: "Create Contract",
    step1Desc:
      "Client inputs details, uploads terms to IPFS, and escrows ETH.",
    step2Title: "Carrier Acceptance",
    step2Desc: "Provider reviews order on marketplace and confirms execution.",
    step3Title: "Execute & Update",
    step3Desc: "Real-time shipment status updates saved onto Blockchain.",
    step4Title: "Confirm & Release Payment",
    step4Desc:
      "Receiver confirms receipt. Contract automatically unlocks and transfers payment to Provider.",

    // CallToAction
    ctaTitle: "Ready to Transparentize Your Process?",
    ctaDesc:
      "Join today to experience the power of smart contracts. Connect your wallet and create your first agreement in minutes.",
    ctaBtn: "Get Started",

    // Footer
    footerDesc:
      "Decentralized contract management platform, ensuring transparency, automation, and security powered by Blockchain.",
    footerQuickLinks: "QUICK LINKS",
    footerAboutUs: "About Us",
    footerSupport: "SUPPORT",
    footerFaq: "Frequently Asked Questions - FAQ",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerInsurance: "Insurance Policy",
    footerContact: "CONTACT",
    footerPolicy: "Policy",
    footerCookies: "Cookies",

    // TutorialModal
    tutStep1Title: "1. What is a Crypto Wallet?",
    tutStep1Content:
      "A digital wallet is an online account, app, or browser extension that lets users store and manage funds, performing fast financial transactions without cash. Instead of username and password, you use your wallet to connect and authenticate identity quickly and securely.",
    tutStep2Title: "2. Setup & Security",
    tutStep2Content:
      "You can download MetaMask as an extension on Chrome/Edge. Note: never share your 12 seed recovery words with anyone.",
    tutStep3Title: "3. What is Gas Fee?",
    tutStep3Content:
      'Every operation on blockchain requires a small fee called "Gas". You need some ETH in your wallet to cover this fee. If using a Testnet, you can obtain free test ETH from faucets.',
    tutStep4Title: "4. Contract Signing Process",
    tutStep4Content:
      "Step 1: Party A creates a contract and enters Party B's address.\nStep 2: Party B visits the web, reviews terms and signs/confirms.\nStep 3: All data is permanently recorded on the Blockchain.",
    tutStep5Title: "Let's Get Started!",
    tutStep5Content:
      'Now that you understand the basic concepts, click "Connect Wallet" at the top right to experience the smart contract system immediately.',
    tutPrev: "Back",
    tutNext: "Next",
    tutFinish: "Finish",

    // Sidebar & Dashboard Layout
    sideMainNav: "Main Navigation",
    sideOverview: "Overview",
    sideContracts: "Contract Management",
    sideMarketplace: "Marketplace",
    sideCreate: "Create New Contract",
    sideAdminSection: "Administrator",
    sideAdmin: "Admin Management",
    sideAccount: "Account",
    sideOnline: "Online",
    sideGuest: "Guest",
    themeLight: "Light",
    themeDark: "Dark",
    backToHome: "Back to Home",

    // Dashboard Overview
    dashOverviewTitle: "System Overview",
    dashOverviewSub: "Track your supply chain performance",
    dashCreateBtn: "Create Contract",
    dashNotConnected: "Wallet Not Connected",
    dashNotConnectedSub: "Please connect your MetaMask wallet to view your system overview.",
    statCreated: "Created Orders",
    statReceived: "Accepted Orders",
    statShipping: "Shipping Orders",
    statWaiting: "Pending Confirmation",
    statCompleted: "Completed",
    statTotal: "Total Activities",
    dashRecentTitle: "Recent Activities",
    dashNoRecent: "No recent activity.",
    roleClient: "Contract Owner (Party A)",
    roleReceiver: "Receiver (Party B)",
    roleProvider: "Carrier (Provider)",
    roleMember: "Member",
    labelContract: "Contract:",
    labelPartner: "Partner:",
    labelReceiverB: "Receiver (Party B):",
    labelClientA: "Sender (Party A):",
    labelOwnerA: "Owner (Party A):",
    labelValue: "Value",
    labelStatus: "Status:",
    btnDetails: "Details",

    // Chart
    chartTitle: "Status Distribution",
    chartTotal: "Total",
    chartNoData: "No chart data available",
    chartNew: "Created",
    chartProcessing: "Processing",
    chartCompleted: "Completed",
    chartCancelled: "Cancelled",
    chartCount: "orders",

    // Contract Statuses
    statusCreated: "Created",
    statusAccepted: "Accepted",
    statusShipping: "In Transit",
    statusCompleted: "Completed",
    statusPaid: "Paid",
    statusCancelled: "Cancelled",

    // Contract List Page & Components
    listTitle: "Contract Management",
    listSub: "List and status of your contracts",
    listGuestWarning: "You are in guest mode for demo experience.",
    listGuestSub: "The system displays all public contracts on the Blockchain. To create and securely manage your own contracts, please connect your wallet.",
    listFilterTitle: "Filter & Data Extraction",
    listFilterStatus: "Status:",
    listFilterAll: "-- All --",
    listFilterStatus0: "Created (Pending)",
    listFilterStatus1: "Accepted",
    listFilterStatus2: "In Progress",
    listFilterStatus3: "Completed (Pending Pay)",
    listFilterStatus4: "Paid (Done)",
    listFilterStatus5: "Cancelled",
    listFilterFrom: "From:",
    listFilterTo: "To:",
    listFilterClear: "Clear Filter",
    listShowing: "Showing",
    listContractsByCriteria: "contracts matching criteria.",
    listPage: "Page",
    listPrev: "Prev",
    listNext: "Next",
    btnCreateNew: "Create New",
    btnExportExcel: "Export Excel",
    filterRoleAll: "All Roles",
    filterRoleClient: "As Creator (Party A)",
    filterRoleProvider: "As Carrier",
    filterRoleReceiver: "As Receiver (Party B)",
    tabAddress: "Contract Address",
    tabRole: "Role",
    tabValue: "Value",
    tabDate: "Date Created",
    tabStatus: "Status",
    tabAction: "Action",
    btnView: "View Details",
    btnQR: "QR Code",
    emptyTable: "No matching contracts found.",

    // Create Contract Page
    createTitle: "Create Digital Contract",
    createSec1: "1. Smart Contract Parameters",
    createReceiver: "Receiver Wallet (Party B)",
    createDeposit: "Deposit (ETH)",
    createPenalty: "Late Penalty (ETH)",
    createDeadline: "Commitment Deadline",
    createOriginalFile: "Original Contract File (Signed PDF)",
    createSec2: "2. Sender / Seller Info (Party A)",
    createNamePlaceholder: "Company / Individual Name",
    createAddressPlaceholder: "Headquarters Address",
    createMstPlaceholder: "Tax Code",
    createRepPlaceholder: "Representative",
    createSec3: "3. Receiver / Buyer Info (Party B)",
    createSec4: "4. Agreement Terms",
    createArt1: "Article 1: Item name, quantity, quality",
    createArt2: "Article 2: Packaging specifications",
    createArt3: "Article 3: Pricing",
    createArt4: "Article 4: Delivery time & location",
    createArt5: "Article 5: Payment method",
    createArt6_1: "Article 6.1: Party A Responsibilities",
    createArt6_2: "Article 6.2: Party B Responsibilities",
    createArt7: "Article 7: General Terms",
    createSubmitBtn: "Sign & Create Contract",
    createProcessing: "Processing transaction...",
    // Contract Details Page
    detailPrint: "Print / Save PDF",
    detailRepublic: "Socialist Republic of Vietnam",
    detailMotto: "Independence - Freedom - Happiness",
    detailContractTitle: "Delivery & Transportation Contract",
    detailId: "Smart Contract ID:",
    detailToday: "Today, on",
    detailWeInclude: ", we include:",
    detailPartyA: "Sender / Seller (Party A)",
    detailPartyB: "Receiver / Buyer (Party B)",
    detailName: "Name/Organization:",
    detailAddress: "Address:",
    detailTax: "Tax Code:",
    detailRep: "Representative:",
    detailWallet: "Blockchain Wallet:",
    detailAgreement: "After discussion, both parties agree to sign the contract with the following terms:",
    detailSignA: "PARTY A REPRESENTATIVE",
    detailSignB: "PARTY B REPRESENTATIVE",
    detailSignProvider: "CARRIER",
    detailSignNote: "(Sign & Full Name / Blockchain Digital Signature)",
    // Marketplace Page
    marketBadge: "Public Marketplace",
    marketTitle: "Order & Contract Marketplace",
    marketSubtitle: "Take shipping jobs or explore open trade agreements across the network",
    marketLoading: "Loading marketplace contracts...",
    marketFilterNewest: "Newest",
    marketFilterHighPrice: "Highest Price",
    marketEmpty: "There are currently no orders.",
    marketOrderContent: "Order Content",
    marketPartyA: "Sender (Party A)",
    marketPartyB: "Receiver (Party B)",
    marketDeposit: "Deposit",
    marketAction: "Action",
    marketYourContract: "Your Contract",
    marketYouAreReceiver: "You are the receiver",
    marketTakeJob: "Take Job Now",
    marketNew: "NEW",
    // Chatbot AI
    chatTitle: "AI Assistant",
    chatSubtitle: "Ask me anything about the system",
    chatPlaceholder: "Type your question...",
    chatSend: "Send",
    chatThinking: "Thinking...",
    chatError: "An error occurred. Please try again.",
    chatWelcome: "Hello! 👋 I'm the AI assistant for the Smart Contract system. I can help you look up contracts, guide you through the platform, and answer your questions.",
    chatSuggest1: "What is a Smart Contract?",
    chatSuggest2: "How to create a contract?",
    chatSuggest3: "Check my contracts",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app_language") || "vi";
  });

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations["vi"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
