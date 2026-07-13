export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`aurora ${className}`}>
      <div
        className="blob"
        style={{ width: 520, height: 520, background: "#6366F1", top: -120, left: -80 }}
      />
      <div
        className="blob"
        style={{
          width: 420,
          height: 420,
          background: "#06B6D4",
          top: 180,
          right: -100,
          animationDelay: "-6s",
        }}
      />
      <div
        className="blob"
        style={{
          width: 380,
          height: 380,
          background: "#EC4899",
          bottom: -120,
          left: "40%",
          animationDelay: "-12s",
          opacity: 0.35,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(99,102,241,0.15), transparent 40%), radial-gradient(circle at 80% 90%, rgba(6,182,212,0.12), transparent 40%)",
        }}
      />
    </div>
  );
}
