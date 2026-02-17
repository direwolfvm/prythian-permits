import { useEffect, useRef, useState } from "react"
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"

import "./App.css"
import HomePage from "./HomePage"
import PortalPage from "./PortalPage"
import { ProjectsPage } from "./ProjectsPage"
import ResourceCheckPage from "./ResourceCheckPage"
import DeveloperToolsPage from "./DeveloperToolsPage"
import SettingsPage from "./SettingsPage"
import AboutPage from "./AboutPage"
import AnalyticsPage from "./AnalyticsPage"
import ResourcesPage from "./ResourcesPage"
import PermitStartPage from "./PermitStartPage"
import ComplexReviewStartPage from "./ComplexReviewStartPage"
import { PermitInfoPage } from "./PermitInfoPage"
import { useHolidayTheme } from "./holidayThemeContext"
import Snowfall from "./components/Snowfall"

function Layout() {
  const bannerRef = useRef<HTMLElement | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const bannerVisibleHeightRef = useRef<number | undefined>(undefined)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const location = useLocation()
  const currentYear = new Date().getFullYear()
  const { isChristmasThemeEnabled } = useHolidayTheme()

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const root = document.documentElement
    const updateLayoutMetrics = (visibleBannerHeight?: number) => {
      const bannerHeight = bannerRef.current?.offsetHeight ?? 0
      const headerHeight = headerRef.current?.offsetHeight ?? 0

      if (typeof visibleBannerHeight === "number") {
        bannerVisibleHeightRef.current = visibleBannerHeight
      }

      const storedVisibleHeight = bannerVisibleHeightRef.current
      const effectiveBannerHeight =
        typeof visibleBannerHeight === "number"
          ? visibleBannerHeight
          : typeof storedVisibleHeight === "number"
            ? storedVisibleHeight
            : bannerHeight

      if (typeof storedVisibleHeight !== "number") {
        bannerVisibleHeightRef.current = effectiveBannerHeight
      }

      root.style.setProperty("--site-banner-height", `${Math.max(0, effectiveBannerHeight)}px`)
      root.style.setProperty("--site-header-height", `${headerHeight}px`)
    }

    updateLayoutMetrics()

    const banner = bannerRef.current
    const header = headerRef.current
    const observers: ResizeObserver[] = []

    if (typeof ResizeObserver !== "undefined") {
      if (banner) {
        const observer = new ResizeObserver(() => {
          updateLayoutMetrics()
        })
        observer.observe(banner)
        observers.push(observer)
      }

      if (header) {
        const observer = new ResizeObserver(() => {
          updateLayoutMetrics()
        })
        observer.observe(header)
        observers.push(observer)
      }
    }

    const handleResize = () => {
      updateLayoutMetrics()
    }

    window.addEventListener("resize", handleResize)

    let intersectionObserver: IntersectionObserver | undefined
    let handleScroll: (() => void) | undefined

    if (banner && typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const visibleHeight =
              entry.isIntersecting || entry.intersectionRatio > 0
                ? entry.intersectionRect.height
                : 0
            updateLayoutMetrics(visibleHeight)
          })
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      )
      intersectionObserver.observe(banner)
    } else if (banner) {
      handleScroll = () => {
        const rect = banner.getBoundingClientRect()
        const clampedTop = Math.min(Math.max(rect.top, 0), window.innerHeight)
        const clampedBottom = Math.min(Math.max(rect.bottom, 0), window.innerHeight)
        const visibleHeight = Math.max(0, clampedBottom - clampedTop)
        updateLayoutMetrics(visibleHeight)
      }
      window.addEventListener("scroll", handleScroll)
    }

    return () => {
      observers.forEach((observer) => observer.disconnect())
      window.removeEventListener("resize", handleResize)
      intersectionObserver?.disconnect()
      if (handleScroll) {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  useEffect(() => {
    setIsNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isNavOpen || typeof window === "undefined") {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNavOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isNavOpen])

  return (
    <div className="site-shell">
      {isChristmasThemeEnabled ? <Snowfall /> : null}
      <section ref={bannerRef} className="site-banner" aria-label="Website disclaimer">
        <div className="site-banner__inner">
          <div className="site-banner__bar">
            <span className="site-banner__icon" aria-hidden="true">
              <svg
                className="site-banner__icon-graphic"
                viewBox="0 0 24 24"
                role="img"
                focusable="false"
                aria-hidden="true"
              >
                <path d="M12 1.75a4.75 4.75 0 0 0-4.75 4.75v2.5H6.5A2.75 2.75 0 0 0 3.75 11.75v7.5A2.75 2.75 0 0 0 6.5 22h11a2.75 2.75 0 0 0 2.75-2.75v-7.5A2.75 2.75 0 0 0 17.5 9.25h-.75v-2.5A4.75 4.75 0 0 0 12 1.75Zm-3.25 4.75a3.25 3.25 0 0 1 6.5 0v2.5h-6.5Zm8.75 4H6.5c-.69 0-1.25.56-1.25 1.25v7.5c0 .69.56 1.25 1.25 1.25h11c.69 0 1.25-.56 1.25-1.25v-7.5c0-.69-.56-1.25-1.25-1.25Z" />
              </svg>
            </span>
            <p className="site-banner__message">
              <strong>Welcome to Prythian Permits</strong> &mdash; a fantasy permitting portal for the Courts of Prythian.
            </p>
            <details className="site-banner__details">
              <summary className="site-banner__summary">What is this?</summary>
              <div className="site-banner__content">
                <p>
                  Prythian Permits is a demo portal themed after A Court of Thorns and Roses.
                  All decrees, courts, and auguries are fictional.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
      <header ref={headerRef} className="site-header">
        <div className="site-header__inner">
          <div className="site-header__brand">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? "site-header__brand-link site-header__brand-link--active"
                  : "site-header__brand-link"
              }
            >
              <span className="site-header__title">Prythian Permits</span>
              <span className="site-header__tagline">A Court of Permits and Reviews</span>
            </NavLink>
          </div>
          <button
            type="button"
            className="site-nav-toggle"
            aria-expanded={isNavOpen}
            aria-controls="site-nav-primary"
            onClick={() => {
              setIsNavOpen((previous) => !previous)
            }}
          >
            <span className="site-nav-toggle__icon" aria-hidden="true">
              <span className="site-nav-toggle__bar" />
              <span className="site-nav-toggle__bar" />
              <span className="site-nav-toggle__bar" />
            </span>
            <span className="site-nav-toggle__label">{isNavOpen ? "Close" : "Menu"}</span>
          </button>
          <nav
          id="site-nav-primary"
          className={`site-nav${isNavOpen ? " site-nav--open" : ""}`}
          aria-label="Primary"
        >
          {isChristmasThemeEnabled ? (
            <span className="site-nav__holiday" aria-hidden="true" role="img">
              ❄️ 🎄 🎅 🎁 ❄️
            </span>
          ) : null}
          <NavLink
            to="/about"
            data-tour="nav-link"
            data-tour-title="About Prythian Permits"
              data-tour-intro="Learn about the Courts and how decrees work."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/portal"
              data-tour="nav-link"
              data-tour-title="File a new petition"
              data-tour-intro="Work with the copilot to begin a new augury for your petition."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              Petition Portal
            </NavLink>
            <NavLink
              to="/projects"
              data-tour="nav-link"
              data-tour-title="Petitions overview"
              data-tour-intro="See active petitions and track their chronicle entries."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              Petitions
            </NavLink>
            <NavLink
              to="/analytics"
              data-tour="nav-link"
              data-tour-title="Analytics"
              data-tour-intro="Review augury activity and court processing times."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/resource-check"
              data-tour="nav-link"
              data-tour-title="Augury check"
              data-tour-intro="Check how a venture footprint may interact with ley lines and wards."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              Augury Check
            </NavLink>
            <NavLink
              to="/resources"
              data-tour="nav-link"
              data-tour-title="Decrees"
              data-tour-intro="Browse the inventory of court decrees and authorizations."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              Decrees
            </NavLink>
            <NavLink
              to="/developer-tools"
              data-tour="nav-link"
              data-tour-title="Developer tools"
              data-tour-intro="See how the Copilot integrations power the portal."
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              Developer Tools
            </NavLink>
            <NavLink
              to="/settings"
              aria-label="Settings"
              data-tour="nav-link"
              data-tour-title="Settings"
              data-tour-intro="Adjust profile preferences and site options."
              className={({ isActive }) =>
                isActive
                  ? "site-nav__link site-nav__link--active site-nav__link--icon"
                  : "site-nav__link site-nav__link--icon"
              }
            >
              <span className="site-nav__icon" aria-hidden="true" role="img">
                ⚙️
              </span>
              <span className="visually-hidden">Settings</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer" aria-label="Site footer">
        <p className="site-footer__message">
          By decree of the High Lords, this portal was forged with the aid of enchanted constructs
          and the diligent oversight of mortal stewards.
        </p>
        <p className="site-footer__copyright">© {currentYear} Prythian Permits. All rights reserved under the Prythian Accord.</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="portal">
          <Route index element={<PortalPage />} />
          <Route path=":projectId" element={<PortalPage />} />
        </Route>
        <Route path="resource-check" element={<ResourceCheckPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="permits/basic" element={<PermitStartPage />} />
        <Route path="reviews/complex" element={<ComplexReviewStartPage />} />
        <Route path="permit-info/:permitId" element={<PermitInfoPage />} />
        <Route path="developer-tools" element={<DeveloperToolsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
