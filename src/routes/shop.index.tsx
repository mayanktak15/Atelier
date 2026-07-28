import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "./shop.$category";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop all — Atelier" },
      { name: "description", content: "Browse the full Atelier collection: women, men, kids, ethnic, footwear and accessories." },
      { property: "og:title", content: "Shop all — Atelier" },
      { property: "og:description", content: "Browse the full Atelier collection." },
    ],
  }),
  component: () => <ShopView />,
});
