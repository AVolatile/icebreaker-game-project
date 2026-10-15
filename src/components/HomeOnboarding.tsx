import { Icon } from "./Visuals";

export function DrawnArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`drawn-arrow ${className}`}
      viewBox="0 0 80 42"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 28C22 9 34 35 51 23 59 17 65 13 74 14M62 5l13 9-8 15" />
    </svg>
  );
}

const STEPS = [
  {
    title: "Host it.",
    icon: "screen",
    body: "Start a room on your laptop, TV or shared screen.",
  },
  {
    title: "Scan it.",
    icon: "scan",
    body: "Your room opens with a QR code. Phones out.",
  },
  {
    title: "Join it.",
    icon: "phone",
    body: "Scan or enter the room code. Your phone is the controller.",
  },
  {
    title: "Play.",
    icon: "bolt",
    body: "Everyone in? The host starts. The big screen runs the show.",
  },
];

export function HomeOnboarding() {
  return (
    <section
      className="home-onboarding"
      aria-labelledby="home-onboarding-title"
    >
      <div className="onboarding-heading">
        <h2 id="home-onboarding-title">How to start a ruckus.</h2>
        <p>Big screen hosts. Phones play.</p>
      </div>
      <ol className="onboarding-beats">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <div className="onboarding-beat-art">
              <span className="onboarding-number" aria-hidden="true">
                0{index + 1}
              </span>
              <Icon name={step.icon} />
            </div>
            <div className="onboarding-beat-copy">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            {index < STEPS.length - 1 && <DrawnArrow />}
          </li>
        ))}
      </ol>
    </section>
  );
}
