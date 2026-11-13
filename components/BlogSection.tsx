const articles = [
  {
    category: "MATERIALS",
    title: "The art of Mongolian cashmere",
    description: "Discover what makes cashmere so soft, special, and timeless.",
    image: "/images/blog-cashmere.jpg",
    href: "#cashmere-story",
  },
  {
    category: "STYLE GUIDE",
    title: "How to care for your knitwear",
    description:
      "Simple ways to keep your favourite pieces beautiful for longer.",
    image: "/images/blog-knitwear.jpg",
    href: "#knitwear-care",
  },
  {
    category: "LIFESTYLE",
    title: "A slower approach to everyday style",
    description:
      "Explore versatile essentials designed to stay in your wardrobe.",
    image: "/images/blog-lifestyle.jpg",
    href: "#everyday-style",
  },
];

export default function BlogSection() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs tracking-[0.25em] text-neutral-500">
          THE GOBI JOURNAL
        </p>

        <h2 className="mt-4 text-center text-4xl font-light sm:text-5xl">
          Stories worth sharing
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="min-w-0">
              <a href={article.href} className="group block overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-[#f1f1ef]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <p className="mt-5 text-xs tracking-[0.2em] text-neutral-500">
                  {article.category}
                </p>

                <h3 className="mt-3 text-xl font-light">{article.title}</h3>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {article.description}
                </p>

                <span className="mt-5 inline-block border-b border-black pb-1 text-xs tracking-widest">
                  READ STORY
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
