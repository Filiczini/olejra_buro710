export default function CinematicDivider() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=2600&auto=format&fit=crop" 
        alt="Atmosphere"
        className="absolute inset-0 w-full h-full object-cover filter grayscale-[20%] contrast-[0.9]" 
      />
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight text-center px-4 mix-blend-overlay">
          Spaces designed for calm living.
        </h2>
      </div>
    </section>
  );
}
