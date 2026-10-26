import { getDealerships, getVehicles } from "../data/vehicle-store";
import Overview from "./Overview";

// Behind AuthGuard (renders nothing until the session is confirmed), so this
// admin page can't be an instant navigation.
export const instant = false;

export default async function DashboardPage() {
  const [vehicles, dealerships] = await Promise.all([
    getVehicles(),
    getDealerships(),
  ]);
  return <Overview vehicles={vehicles} dealerships={dealerships} />;
}
