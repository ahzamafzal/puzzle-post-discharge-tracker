import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import the main tracker component to avoid server-side rendering issues
const PuzzlePostDischargeTracker = dynamic(() => import('../components/PuzzlePostDischargeTracker'), { ssr: false });

export default function Home() {
  return (
    <div>
      <Head>
        <title>Puzzle Post‑Discharge Tracker</title>
        <meta name="description" content="Puzzle Post‑Discharge Tracker app" />
      </Head>
      <PuzzlePostDischargeTracker />
    </div>
  );
}
