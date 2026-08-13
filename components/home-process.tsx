const steps = [
  {
    step: "01",
    title: "Consult",
    copy: "Share the date, guest count, and the feeling you want in the room. WhatsApp or the quote form both reach the Pretoria kitchen.",
  },
  {
    step: "02",
    title: "Bake",
    copy: "We mix sponge and filling for the day it will be eaten — vanilla bean, Belgian ganache, strawberry, or salted caramel. Never off a shelf.",
  },
  {
    step: "03",
    title: "Collect",
    copy: "Pickup from Villa Lanta Estate, 6814 Strawberry Street, Amandasig. We pack for the drive. Delivery across Tshwane by arrangement.",
  },
]

export default function HomeProcess() {
  return (
    <section className="w-full bg-surface py-section-gap" aria-labelledby="home-process">
      <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="mx-auto mb-12 max-w-2xl text-center" data-animate="fade-up">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-dadda-primary">
            From-scratch method
          </span>
          <h2 id="home-process" className="section-title mb-4">
            Consult, bake, collect
          </h2>
          <p className="text-base text-on-surface-variant">
            Three steps from the first message to a cake leaving Strawberry Street.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3" data-stagger>
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-center rounded-3xl bg-cream-surface p-8 text-center"
              data-stagger-item
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dadda-primary font-display text-lg font-semibold text-on-primary">
                {item.step}
              </span>
              <h3 className="mb-3 font-display text-2xl font-semibold text-chocolate-text">{item.title}</h3>
              <p className="text-sm leading-6 text-on-surface-variant">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
