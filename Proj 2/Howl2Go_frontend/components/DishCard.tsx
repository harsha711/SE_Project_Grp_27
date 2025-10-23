"use client";

import { motion } from "framer-motion";

interface DishCardProps {
  index: number;
}

export default function DishCard({ index }: DishCardProps) {
  const dishes = [
    {
      name: "Spicy Korean Tacos",
      description: "Kimchi, sriracha mayo, cilantro",
    },
    {
      name: "Truffle Mac & Cheese",
      description: "Three cheese blend, truffle oil",
    },
    {
      name: "Margherita Pizza",
      description: "Fresh mozzarella, basil, tomato",
    },
    { name: "Pad Thai Noodles", description: "Rice noodles, peanuts, lime" },
    { name: "Caesar Salad", description: "Romaine, parmesan, croutons" },
    { name: "Chicken Wings", description: "Buffalo sauce, blue cheese dip" },
    { name: "Beef Burger", description: "Wagyu beef, aged cheddar, aioli" },
    { name: "Sushi Platter", description: "Assorted nigiri and maki rolls" },
    { name: "Falafel Wrap", description: "Chickpea fritters, tahini sauce" },
    {
      name: "Chocolate Lava Cake",
      description: "Molten center, vanilla ice cream",
    },
  ];

  const dish = dishes[(index - 1) % dishes.length];

  return (
    <motion.div
      className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border w-full sm:w-[280px] bg-[var(--howl-surface-elevated)] border-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)] hover:border-[var(--howl-secondary)]"
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <div className="w-full h-48 relative bg-[var(--howl-secondary)] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500">
          {index % 3 === 0 ? "🍕" : index % 3 === 1 ? "🍜" : "🌮"}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--howl-bg)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--howl-primary)] transition-colors duration-300 text-[var(--howl-neutral)]">
          {dish.name}
        </h3>
        <p className="text-sm mb-4 text-[var(--howl-neutral)] opacity-80 leading-relaxed">
          {dish.description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-[color-mix(in_srgb,var(--howl-neutral)_10%,transparent)]">
          <span className="text-2xl font-bold text-[var(--howl-secondary)]">
            ${(8 + index * 2).toFixed(2)}
          </span>
          <motion.button
            className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all bg-[var(--howl-primary)] text-[var(--howl-bg)] hover:bg-[var(--howl-secondary)] hover:text-[var(--howl-bg)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
