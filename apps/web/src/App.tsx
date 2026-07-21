import { AuroraBackground } from '@/components/AuroraBackground';
import { AppRoutes } from '@/routes/AppRoutes';
import { useScrapingSocket } from '@/features/scraping/hooks/useScrapingSocket';

export default function App() {
  useScrapingSocket();

  return (
    <>
      <AuroraBackground />
      <AppRoutes />
    </>
  );
}
