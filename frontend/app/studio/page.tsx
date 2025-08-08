"use client"

/**
 * AEON Studio - Main Studio Page
 * Upgraded to include the interactive timeline editor and render pipeline
 */

import dynamic from 'next/dynamic';

const AEONViralStudio = dynamic(() => import('@/components/studio/AEONViralStudio'), { ssr: false });

export default function StudioPage() {
  return (
    <div className="min-h-screen p-6">
      <AEONViralStudio />
    </div>
  );
}
