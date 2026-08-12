export default function CinematicDivider() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      <img
        src="/cinematic-divider.png"
        alt="Atmosphere"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover filter grayscale-[20%] contrast-[0.9]"
      />
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-3xl md:text-h2 font-display text-white tracking-tight text-center px-4 mix-blend-overlay">
          Spaces designed for calm living.
        </h2>
      </div>
    </section>
  );
}
