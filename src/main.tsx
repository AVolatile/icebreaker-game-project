import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "./styles.css";
import { PartyProvider } from "./lib/party";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Join, HostSetup } from "./pages/Setup";
import { HostRoom } from "./pages/HostRoom";
import { PlayerRoom } from "./pages/PlayerRoom";
import { Games, GameDetail } from "./pages/Games";
import {
  About,
  HowItWorks,
  Pricing,
  Resources,
  Teams,
} from "./pages/Editorial";
import { Brand } from "./pages/Brand";
import { Campaign } from "./pages/Campaign";
import { CaseStudy } from "./pages/CaseStudy";
const StudioLibrary = React.lazy(() => import("./studio/StudioLibrary"));
const StudioEditor = React.lazy(() => import("./studio/StudioEditor"));
const StudioPreview = React.lazy(() => import("./studio/StudioPreview"));
const studio = (element: React.ReactNode) => (
  <React.Suspense
    fallback={
      <section className="page-hero">
        <p role="status">Opening the creative seat…</p>
      </section>
    }
  >
    {element}
  </React.Suspense>
);
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="room-recovery">
        <h1>The screen hit a snag.</h1>
        <p>
          Your room is still on the server. Reload to restore your controller.
        </p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload the screen
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <PartyProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="studio" element={studio(<StudioLibrary />)} />
              <Route path="studio/boards" element={studio(<StudioLibrary />)} />
              <Route
                path="studio/boards/new"
                element={studio(<StudioEditor />)}
              />
              <Route
                path="studio/boards/:id"
                element={studio(<StudioEditor />)}
              />
              <Route
                path="studio/boards/:id/preview"
                element={studio(<StudioPreview />)}
              />
              <Route path="host" element={<HostSetup />} />
              <Route path="games" element={<Games />} />
              <Route path="games/:slug" element={<GameDetail />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="for-teams" element={<Teams />} />
              <Route path="remote" element={<Teams />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="resources" element={<Resources />} />
              <Route path="about" element={<About />} />
              <Route path="brand" element={<Brand />} />
              <Route path="campaign" element={<Campaign />} />
              <Route path="case-study" element={<CaseStudy />} />
              <Route
                path="*"
                element={
                  <section className="page-hero">
                    <h1>
                      Wrong room.
                      <br />
                      Right people.
                    </h1>
                    <p>That page isn’t part of the party.</p>
                    <Link to="/" className="button">
                      Back to Ruckus ↗
                    </Link>
                  </section>
                }
              />
            </Route>
            <Route path="join" element={<Join />} />
            <Route path="room/:code/host" element={<HostRoom />} />
            <Route path="room/:code/play" element={<PlayerRoom />} />
          </Routes>
        </PartyProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
