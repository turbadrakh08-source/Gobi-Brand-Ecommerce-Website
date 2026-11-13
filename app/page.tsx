"use client";

import { useEffect, useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "../components/Navbar";
import ShopCategories from "@/components/ShopCategories";
import NewArrivals from "@/components/NewArrivals";
import Reviews from "@/components/Reviews";
import BlogSection from "@/components/BlogSection";
export default function Home() {
  const slides = [
    {
      path: "/images/MongolianBackground.jpg",
      title: "The Fall Edit",
      description:
        "Your favourite part of colder days. Mongolian cashmere, up to 50% off selected styles.",
      button: "SHOP NOW",
    },
    {
      path: "/images/WoolBackground.jpg",
      title: "The Cashmere Edit",
      description:
        "Discover timeless styles crafted from beautiful Mongolian cashmere.",
      button: "DISCOVER NOW",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((previousSlide) => (previousSlide + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <AnnouncementBar />

      <section
        id="home"
        className="relative min-h-screen overflow-hidden bg-[#d5cbbd]"
      >
        {/* Hero background image */}
        <img
          key={slide.path}
          src={slide.path}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Navbar */}
        <Navbar />

        {/* Hero content */}
        <div className="relative flex min-h-screen items-end justify-center px-6 pb-24 pt-32 text-center sm:pb-32">
          <div className="max-w-4xl text-white">
            <h1 className="text-5xl font-light leading-tight sm:text-7xl">
              {slide.title}
            </h1>

            <p className="mt-5 text-sm sm:text-lg">{slide.description}</p>

            <a
              href="#sale"
              className="mt-10 inline-flex rounded-full border border-white px-8 py-4 text-sm transition hover:bg-white hover:text-black"
            >
              {slide.button}
            </a>

            {/* Slide indicators */}
            <div className="mt-10 flex justify-center gap-3">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  aria-pressed={currentSlide === index}
                  onClick={() => setCurrentSlide(index)}
                  className="flex h-8 w-14 cursor-pointer items-center justify-center"
                >
                  <span
                    className={`h-[2px] w-full transition-colors ${
                      currentSlide === index ? "bg-white" : "bg-white/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <NewArrivals />
      <ShopCategories />
      <Reviews />
      <BlogSection />
    </main>
  );
}
