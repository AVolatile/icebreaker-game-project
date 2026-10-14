import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo, Icon } from "./Visuals";
export function Layout() {
  const [open, setOpen] = useState(false),
    location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" aria-label="Ruckus home">
          <Logo />
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"} <span>☰</span>
        </button>
        <nav className={open ? "open" : ""} aria-label="Main navigation">
          <NavLink to="/games">The games</NavLink>
          <NavLink to="/how-it-works">How it works</NavLink>
          <NavLink to="/for-teams">For your people</NavLink>
          <NavLink to="/join" className="nav-join">
            Join a room <span>↗</span>
          </NavLink>
          <Link className="button small" to="/host">
            Start a ruckus <Icon name="arrow" />
          </Link>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <Link to="/">
            <Logo light />
          </Link>
          <p>
            Good company.
            <br />
            Questionable competition.
          </p>
          <Link to="/host" className="button yellow">
            Get the room going <Icon name="arrow" />
          </Link>
        </div>
        <div className="footer-links">
          <div>
            <Link to="/games">The games</Link>
            <Link to="/remote">Remote play</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/resources">Host’s field guide</Link>
          </div>
          <div>
            <Link to="/about">About Ruckus</Link>
            <Link to="/brand">Brand world</Link>
            <Link to="/campaign">Out in the wild</Link>
            <Link to="/case-study">The case study</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            A self-initiated concept by Anthony Volatile / Volatile Solutions.
          </span>
          <span>© 2026 Ruckus. All play, no accounts.</span>
        </div>
      </footer>
    </>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="error-message">
      {message}
    </p>
  ) : null;
}
