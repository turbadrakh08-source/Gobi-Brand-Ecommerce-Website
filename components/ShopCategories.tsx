const featuredCategories = [
  {
    title: "Shop women",
    image: "/images/HomePage/Categories/ShopWomen.webp",
    href: "#women",
  },
  {
    title: "Shop men",
    image: "/images/HomePage/Categories/ShopMen.webp",
    href: "#men",
  },
];

const categories = [
  {
    title: "Sweaters",
    image: "/images/HomePage/Categories/Sweaters.jpg",
    href: "#sweaters",
  },
  {
    title: "Accessories",
    image: "/images/HomePage/Categories/Accessories.webp",
    href: "#accessories",
  },
  {
    title: "Cardigans",
    image: "/images/HomePage/Categories/Cardigans.webp",
    href: "#cardigans",
  },
  {
    title: "Coats",
    image: "/images/HomePage/Categories/Coats.jpg",
    href: "#coats",
  },
];

export default function ShopCategories() {
  return (
    <section className="bg-white">
      {/* Women and men */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {featuredCategories.map((category) => (
          <a
            key={category.title}
            href={category.href}
            className="group relative block h-[520px] overflow-hidden sm:h-[620px]"
          >
            <img
              src={category.image}
              alt={category.title}
              className="h-500px w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />

            <h2 className="absolute bottom-7 left-7 text-2xl font-light text-white underline underline-offset-4 hover:scale-105">
              {category.title}
            </h2>
          </a>
        ))}
      </div>

      {/* Individual categories */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {categories.map((category) => (
          <a
            key={category.title}
            href={category.href}
            className="group relative block aspect-[3/4] overflow-hidden"
          >
            <img
              src={category.image}
              alt={category.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-black/15" />

            <div className="absolute inset-x-2 bottom-6 flex justify-center sm:bottom-8">
              <span className="rounded-full border border-white px-5 py-3 text-sm text-white transition-colors duration-300 group-hover:bg-white group-hover:text-black sm:px-8">
                {category.title}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
