import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="container-x py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-xl font-semibold">Atelier<span className="text-accent">.</span></div>
          <p className="mt-3 text-muted-foreground max-w-xs">
            Modern wardrobe essentials, considered fabrications, made to be worn for years.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Shop</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/shop/$category" params={{ category: "women" }} className="hover:text-foreground">Women</Link></li>
            <li><Link to="/shop/$category" params={{ category: "men" }} className="hover:text-foreground">Men</Link></li>
            <li><Link to="/shop/$category" params={{ category: "ethnic" }} className="hover:text-foreground">Ethnic</Link></li>
            <li><Link to="/shop/$category" params={{ category: "footwear" }} className="hover:text-foreground">Footwear</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Help</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>Shipping & Delivery</li>
            <li>Returns & Exchanges</li>
            <li>Size Guide</li>
            <li>Contact us</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>Our story</li>
            <li>Sustainability</li>
            <li>Journal</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Atelier. All rights reserved.</div>
          <div>Storefront demo · UI only</div>
        </div>
      </div>
    </footer>
  );
}
