import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";

export const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white">
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-4">MediCourse</h3>
          <p className="text-gray-400">
            Профессиональное развитие медицинских работников через качественное образование.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold mb-4">Навигация</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/" className="hover:text-white transition">Главная</Link></li>
            <li><Link href="#courses" className="hover:text-white transition">Курсы</Link></li>
            <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Контакты</Link></li>
          </ul>
        </div>

        {/* Courses */}
        <div>
          <h4 className="font-bold mb-4">Популярные курсы</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/courses/1" className="hover:text-white transition">Кардиология</Link></li>
            <li><Link href="/courses/2" className="hover:text-white transition">Хирургия</Link></li>
            <li><Link href="/courses/3" className="hover:text-white transition">Педиатрия</Link></li>
            <li><Link href="/courses/4" className="hover:text-white transition">Сестринский уход</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-4">Контакты</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2">
              <Phone size={18} />
              <a href="tel:+7-999-999-99-99" className="hover:text-white transition">
                +7 (999) 999-99-99
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} />
              <a href="mailto:hello@medicourse.ru" className="hover:text-white transition">
                hello@medicourse.ru
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={18} />
              <span>Казахстан, Алматы</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400">
          © 2025 MediCourse. Все права защищены.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-gray-400 hover:text-white transition">
            <Facebook size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <Linkedin size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
