import { redirect } from 'next/navigation';

export default function DocsPage() {
  // Redirect to the AEON docs by default
  redirect('/docs/aeon');
}
