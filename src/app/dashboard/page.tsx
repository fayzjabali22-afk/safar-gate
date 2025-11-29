import { AppLayout } from '@/components/app-layout';
import { MapPlaceholder } from '@/components/map-placeholder';
import { RideRequestPanel } from '@/components/ride-request-panel';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapPlaceholder />
        </div>
        <div className="lg:col-span-1">
          <RideRequestPanel />
        </div>
      </div>
    </AppLayout>
  );
}
