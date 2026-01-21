import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";

export const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white">
    {/* Responsive container with adaptive padding */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
      {/* Responsive grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
        {/* Brand */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Plexus</h3>
          <p className="text-sm sm:text-base text-gray-400">
            Профессиональное развитие медицинских работников через качественное
            образование.
          </p>
        </div>

        {/* Links */}
        <div className="text-center sm:text-left">
          <h4 className="font-bold mb-3 sm:mb-4">Навигация</h4>
          <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
            <li>
              <Link
                href="/"
                className="hover:text-white transition inline-block py-1"
              >
                Главная
              </Link>
            </li>
            <li>
              <Link
                href="#courses"
                className="hover:text-white transition inline-block py-1"
              >
                Курсы
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition inline-block py-1"
              >
                О нас
              </Link>
            </li>
          </ul>
        </div>

        

        {/* Contact */}
        <div className="text-center sm:text-left">
          <h4 className="font-bold mb-3 sm:mb-4">Контакты</h4>
          <ul className="space-y-3 text-gray-400 text-sm sm:text-base">
            <li className="flex items-center gap-2 justify-center sm:justify-start">
              <Phone size={18} className="shrink-0" />
              <a
                href="tel:+7-707-593-46-15"
                className="hover:text-white transition"
              >
                +7 (707) 593-46-15
              </a>
            </li>
            <li className="flex items-center gap-2 justify-center sm:justify-start">
              <Mail size={18} className="shrink-0" />
              <a
                href="mailto:info@plexus.kz"
                className="hover:text-white transition"
              >
                info@plexus.kz
              </a>
            </li>
            <li className="flex items-center gap-2 justify-center sm:justify-start">
              <MapPin size={18} className="shrink-0" />
              <span>Казахстан, Алматы</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider - responsive layout */}
      <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
          © 2025 Plexus. Все права защищены.
        </p>
        {/* Social icons with touch-friendly sizes */}
        <div className="flex gap-4">
          <a
            href="#"
            className="text-gray-400 hover:text-white transition p-2 -m-2"
            aria-label="Facebook"
          >
            <Facebook size={20} />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition p-2 -m-2"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition p-2 -m-2"
            aria-label="Twitter"
          >
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
