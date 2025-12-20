// Main page - redirects to customer landing page
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/customer')
}
