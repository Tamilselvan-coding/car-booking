import { FareWidget } from '../components/FareWidget';
import { localContent } from '../content';

export function LocalTaxi() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="reveal-up grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Local Taxi</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">City rental, by the hour or the day</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-600">{localContent.intro}</p>
        </div>
        <div className="image-frame aspect-[16/9] rounded-lg shadow-2xl shadow-zinc-950/10">
          <img
            src="/images/local-taxi.png"
            alt="White local taxi parked on a bright city street"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-xl font-black">Rental packages</h2>
          <div className="table-wrap mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead className="bg-zinc-100 text-xs font-black uppercase tracking-wide text-zinc-600">
                <tr>
                  <th scope="col" className="px-4 py-3">Package</th>
                  <th scope="col" className="px-4 py-3">Sedan</th>
                  <th scope="col" className="px-4 py-3">SUV</th>
                </tr>
              </thead>
              <tbody>
                {localContent.packages.map((pkg) => (
                  <tr key={pkg.name} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-bold">{pkg.name}</td>
                    <td className="px-4 py-3 font-medium text-zinc-600">Rs.{pkg.sedan.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-medium text-zinc-600">Rs.{pkg.suv.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs font-medium leading-5 text-zinc-500">
            Extra km and extra hour charges apply beyond the package limit. Final fare is confirmed before pickup.
          </p>

          <h2 className="mt-10 text-xl font-black">Common local taxi uses</h2>
          <ul className="stagger-reveal mt-4 grid gap-3 text-sm font-medium text-zinc-700">
            <li className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-4 shadow-sm">Office commute and corporate meeting visits</li>
            <li className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-4 shadow-sm">Hospital appointments and elderly care trips</li>
            <li className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-4 shadow-sm">Wedding and event day errands</li>
            <li className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-4 shadow-sm">Half-day or full-day city sightseeing</li>
            <li className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-4 shadow-sm">Airport and railway station transfers within the city</li>
          </ul>
        </div>

        <FareWidget defaultPickup="Chennai" defaultDrop="Chennai" showMap={false} />
      </div>
    </div>
  );
}
