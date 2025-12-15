import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const year = new Date().getFullYear();

/* ================= DATA ================= */

const SHOP_LINKS = [
  { label: "Men", to: "/category/men" },
  { label: "Women", to: "/category/women" },
  { label: "Electronics", to: "/category/electronics" },
  { label: "Shoes", to: "/category/shoes" },
];

const COMPANY_LINKS = [
  { label: "About Us", to: "/" },
  { label: "Careers", to: "/" },
  { label: "Blog", to: "/" },
  { label: "Contact", to: "/" },
];

const SUPPORT_LINKS = [
  { label: "My Orders", to: "/my-orders" },
  { label: "Help Center", to: "/" },
  { label: "Privacy Policy", to: "/" },
  { label: "Terms & Conditions", to: "/" },
];

const SOCIAL_LINKS = [
  { icon: <FaFacebookF />, href: "https://facebook.com" },
  { icon: <FaInstagram />, href: "https://instagram.com" },
  { icon: <FaTwitter />, href: "https://twitter.com" },
  { icon: <FaLinkedinIn />, href: "https://linkedin.com" },
];

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t">
      {/* TOP */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-extrabold bg-linear-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            Shopco
          </h2>

          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            Shopco is your one-stop destination for fashion, electronics, and
            lifestyle products – trusted by thousands of customers.
          </p>

          {/* SOCIALS */}
          <div className="flex gap-4 mt-6">
            {SOCIAL_LINKS.map((item, i) => (
              <Social key={i} {...item} />
            ))}
          </div>
        </div>

        <FooterSection title="Shop">
          {SHOP_LINKS.map((link) => (
            <FooterLink key={link.label} {...link} />
          ))}
        </FooterSection>

        <FooterSection title="Company">
          {COMPANY_LINKS.map((link) => (
            <FooterLink key={link.label} {...link} />
          ))}
        </FooterSection>

        <FooterSection title="Support">
          {SUPPORT_LINKS.map((link) => (
            <FooterLink key={link.label} {...link} />
          ))}
        </FooterSection>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-2">
          <p>© {year} Shopco. All rights reserved.</p>
          <p>Made with ❤️ for production-grade ecommerce</p>
        </div>
      </div>
    </footer>
  );
}

/* ================= SMALL COMPONENTS ================= */

const FooterSection = React.memo(({ title, children }) => (
  <div>
    <h3 className="text-gray-900 font-semibold mb-4">{title}</h3>
    <ul className="space-y-2 text-sm">{children}</ul>
  </div>
));

const FooterLink = React.memo(({ to, label }) => (
  <li>
    <Link
      to={to}
      className="text-gray-600 hover:text-indigo-600 transition"
    >
      {label}
    </Link>
  </li>
));

const Social = React.memo(({ icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="social link"
    className="w-9 h-9 rounded-full bg-gray-100 text-gray-600
               hover:bg-indigo-600 hover:text-white
               grid place-items-center transition"
  >
    {icon}
  </a>
));

export default React.memo(Footer);
