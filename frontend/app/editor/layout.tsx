import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AEON Video Editor',
  description: 'Professional video editing with AI assistance',
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
