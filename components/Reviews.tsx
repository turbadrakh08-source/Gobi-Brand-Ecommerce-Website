const reviews = [
  {
    name: "Emily R.",
    title: "Beautifully soft cashmere",
    text: "The sweater feels incredibly soft and the fit is exactly what I wanted. A timeless piece for my wardrobe.",
  },
  {
    name: "Daniel M.",
    title: "Excellent quality",
    text: "Beautiful material, thoughtful details, and a comfortable fit. I can see myself wearing it for years.",
  },
  {
    name: "Sophie L.",
    title: "My new favourite",
    text: "The colour is gorgeous and the knit feels luxurious. It has quickly become one of my favourite pieces.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-[#faf9f6] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs tracking-[0.25em] text-neutral-500">
          KIND WORDS
        </p>

        <h2 className="mt-4 text-center text-4xl font-light sm:text-5xl">
          Loved by our customers
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="border border-black/10 bg-white p-6 sm:p-8"
            >
              <p
                className="text-sm tracking-widest text-amber-700"
                aria-label="5 out of 5 stars"
              >
                ★★★★★
              </p>

              <h3 className="mt-5 text-lg">{review.title}</h3>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                {review.text}
              </p>

              <p className="mt-6 text-xs font-medium tracking-widest">
                {review.name}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
