import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Event',
  description:
    'Book The Porch Coffee Bar for your next event. Premium mobile coffee cart service for weddings, parties, corporate events, and more. Get a quote in minutes!',
  openGraph: {
    title: 'Book The Porch Coffee Bar for Your Event',
    description:
      'Premium mobile coffee cart service for weddings, parties, and events. Get a quote in minutes!',
  },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
