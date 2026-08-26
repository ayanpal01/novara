import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-black tracking-tighter uppercase">NOVARA</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              Discover fashion curated<br/>
              for your everyday expression.
            </p>
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-sm mb-6 uppercase">Shop</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/shop?featured=true" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop/men" className="hover:text-foreground transition-colors">Men</Link></li>
              <li><Link href="/shop/women" className="hover:text-foreground transition-colors">Women</Link></li>
              <li><Link href="/shop/accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-sm mb-6 uppercase">Customer Care</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-foreground transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-sm mb-6 uppercase">Company</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About NOVARA</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} NOVARA. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
