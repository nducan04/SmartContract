import logoDark from "./logo-dark.png";
import logoLight from "./logo-light.png";
import logoWhite from "./logo-white.png";
import iconLogo from "./icon-logo.png";
import iconLogo32 from "./icon-logo-32.png";
import iconLogo48 from "./icon-logo-48.png";
import iconLogo64 from "./icon-logo-64.png";
import iconLogo100 from "./icon-logo-100.png";
import aboutImg from "./about.jpg";
import appImg from "./app.png";
import characterImg from "./character.png";
import ctaImg from "./cta.png";
import errorImg from "./error.png";
import playstoreImg from "./playstore.png";
import search_icon from "./search_icon.svg";
import close_icon from "./close_icon.svg";
import menu_icon from "./menu_icon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import dashboardIconColored from "./dashboardIconColored.svg";
import walletIcon from "./walletIcon.png";
import automaticMoney from "./automaticMoney.png";
import security from "./security.png";
import transparency from "./transparency.png";
import contractSetup from "./contractSetup.png";
import approved from "./approved.png";
import statusUpdate from "./statusUpdate.png";
import confirmPayment from "./confirmPayment.png";
import blockchainLogo from "./blockchainLogo.svg";
import gmail_logo from "./gmail_logo.svg";
import facebook_logo from "./facebook_logo.svg";
import instagram_logo from "./instagram_logo.svg";
import twitter_logo from "./twitter_logo.svg";
import anh_pmt from "./anh_pmt.png";

export const assets = {
  twitter_logo,
  instagram_logo,
  anh_pmt,
  facebook_logo,
  gmail_logo,
  logoDark,
  security,
  blockchainLogo,
  contractSetup,
  confirmPayment,
  approved,
  statusUpdate,
  transparency,
  automaticMoney,
  logoLight,
  logoWhite,
  clientImg: iconLogo,
  iconLogo,
  iconLogo32,
  iconLogo48,
  iconLogo64,
  iconLogo100,
  aboutImg,
  appImg,
  characterImg,
  ctaImg,
  errorImg,
  playstoreImg,
  search_icon,
  close_icon,
  menu_icon,
  dashboardIcon,
  dashboardIconColored,
  walletIcon,
};

export const menuLinks = [
  { name: "Trang chủ", path: "/" },
  // { name: "Quản Lý Hợp Đồng", path: "/contract-management" },
  { name: "Theo dõi hàng hóa", path: "/tracking" },
];

export const ownerMenuLinks = [
  {
    name: "Tổng quan",
    path: "/dashboard",
    icon: dashboardIcon,
    coloredIcon: dashboardIconColored,
  },
  {
    name: "Quản lý hợp đồng",
    path: "/dashboard/contracts",
    icon: statusUpdate,
    coloredIcon: statusUpdate,
  },
  {
    name: "Sàn hợp đồng",
    path: "/dashboard/marketplace",
    icon: search_icon, // Hoặc icon nào bạn thích
    coloredIcon: search_icon,
  },
  {
    name: "Tạo hợp đồng mới",
    path: "/dashboard/create",
    icon: contractSetup,
    coloredIcon: contractSetup,
  },
  // { name: "Manage Bookings", path: "/owner/manage-bookings", icon: listIcon, coloredIcon: listIconColored },
];
