"use client";

import { useEffect, useState } from "react";

const messages = [
  "FREE SHIPPING OVER €199",
  "FALL CASHMERE EDIT | UP TO 50% OFF",
];

export default function AnnouncementBar() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((current) => (current + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed left-0 top-0 z-[60] flex h-10 w-full items-center justify-between bg-black px-5 text-[10px] tracking-widest text-white transition-transform duration-300 ${
        scrolled ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <span className="z-10 whitespace-nowrap">HUNGARY / EN</span>

      <div className="absolute left-1/2 w-[65%] -translate-x-1/2 overflow-hidden text-center">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentMessage * 100}%)` }}
        >
          {messages.map((message) => (
            <div key={message} className="w-full shrink-0 whitespace-nowrap">
              {message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
