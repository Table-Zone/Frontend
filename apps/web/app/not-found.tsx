import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-tz-cream flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-6">
          <Image src="/logo.jpg" alt="Table Zone" width={80} height={80} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-6xl font-extrabold text-tz-espresso mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn't exist — maybe it's still brewing?
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-tz-primary hover:bg-tz-primary-dark text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-tz-primary/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
