import { faqs } from '../content';

export function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="reveal-up">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">FAQ</p>
        <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">Frequently asked questions</h1>
        <div className="image-frame mt-8 aspect-[16/10] rounded-lg shadow-2xl shadow-zinc-950/10 sm:aspect-[16/7]">
          <img src="/images/local-taxi.png" alt="Chettinad Express local cab ready for a city ride" loading="lazy" />
        </div>
      </div>
      <div className="stagger-reveal mt-8 grid gap-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="lift-card group rounded-lg border border-zinc-200 bg-white/90 p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-black text-zinc-900 marker:hidden">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

