import { aboutContent } from '../content';

export function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="reveal-up grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">About Us</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">Built for Tamil Nadu&apos;s roads</h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-zinc-700">{aboutContent.intro}</p>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-zinc-700">{aboutContent.mission}</p>
        </div>
        <div className="image-frame aspect-[16/9] rounded-lg shadow-2xl shadow-zinc-950/10">
          <img
            src="/images/outstation-taxi.png"
            alt="Chettinad Express sedan travelling on an open Tamil Nadu highway"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="stagger-reveal mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {aboutContent.stats.map((stat) => (
          <div key={stat.label} className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-teal-700">{stat.value}</p>
            <p className="mt-1 text-xs font-bold text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="stagger-reveal mt-14 grid gap-6 md:grid-cols-3">
        {aboutContent.values.map((value) => (
          <div key={value.title} className="lift-card rounded-lg border border-zinc-200 bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-black">{value.title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{value.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

