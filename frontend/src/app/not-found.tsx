import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-muted p-6 rounded-full mb-6 text-muted-foreground">
        <FileQuestion size={48} />
      </div>
      <h2 className="text-4xl font-bold tracking-tight mb-4">404 - Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link href="/shop/men" className={buttonVariants({ variant: "outline" })}>
          Shop Men
        </Link>
        <Link href="/" className={buttonVariants()}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
