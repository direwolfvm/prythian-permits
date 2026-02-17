import { type FormEvent, useEffect, useMemo, useState } from "react"

import RuntimeSelectionControl from "./components/RuntimeSelectionControl"
import {
  ProjectPersistenceError,
  deleteProjectAndRelatedData,
  fetchProjectHierarchy,
  type ProjectHierarchy
} from "./utils/projectPersistence"
import { useHolidayTheme } from "./holidayThemeContext"
import { useDesignTheme, type DesignTheme } from "./designThemeContext"

import "./App.css"

const PASSWORD_HASH = "d996810399b26e931368974d273e2f6872463b32d87494f228cb414f07170618"

async function hashPassword(candidate: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(candidate)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function verifyPassword(candidate: string): Promise<boolean> {
  if (!candidate || typeof crypto?.subtle === "undefined") {
    return false
  }

  const hashedCandidate = await hashPassword(candidate)
  return hashedCandidate === PASSWORD_HASH
}

function formatProjectLabel(project: ProjectHierarchy): string {
  const title = project.project.title?.trim()
  const baseLabel = title?.length ? title : `Project ${project.project.id}`
  const updated = project.project.lastUpdated
  return updated ? `${baseLabel} (updated ${new Date(updated).toLocaleString()})` : baseLabel
}

type DeleteProjectModalProps = {
  projects: ProjectHierarchy[]
  onClose: () => void
  onProjectDeleted: (projectId: number) => void
}

function DeleteProjectModal({ projects, onClose, onProjectDeleted }: DeleteProjectModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">(() => projects[0]?.project.id ?? "")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle")
  const [error, setError] = useState<string | null>(null)

  const hasProjects = projects.length > 0
  const deleteDisabled = !hasProjects || status === "pending"

  useEffect(() => {
    if (!hasProjects) {
      setSelectedProjectId("")
      return
    }

    if (selectedProjectId === "") {
      setSelectedProjectId(projects[0]?.project.id ?? "")
      return
    }

    const stillExists = projects.some((project) => project.project.id === selectedProjectId)
    if (!stillExists) {
      setSelectedProjectId(projects[0]?.project.id ?? "")
      setPassword("")
      setStatus("idle")
    }
  }, [projects, hasProjects, selectedProjectId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!hasProjects || selectedProjectId === "") {
      setError("Select a petition to delete.")
      return
    }

    setStatus("pending")
    setError(null)

    try {
      const isValid = await verifyPassword(password)
      if (!isValid) {
        setStatus("idle")
        setError("Incorrect password. Enter the maintenance password to continue.")
        return
      }

      await deleteProjectAndRelatedData(selectedProjectId)
      setStatus("success")
      onProjectDeleted(selectedProjectId)
    } catch (caughtError) {
      console.error("Failed to delete petition", caughtError)
      const fallbackMessage = "Unable to delete the petition right now. Try again in a moment."
      const message =
        caughtError instanceof ProjectPersistenceError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : fallbackMessage
      setError(message || fallbackMessage)
      setStatus("idle")
    }
  }

  return (
    <div className="process-info-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="process-info-modal settings__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="process-info-modal__header">
          <p className="process-info-modal__eyebrow">Petition maintenance</p>
          <h2 id="delete-project-modal-title">Delete a petition</h2>
          <button className="process-info-modal__close" type="button" onClick={onClose} aria-label="Close dialog">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <path d="m4.5 4.5 9 9m0-9-9 9" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="process-info-modal__body settings__modal-body">
          <p>
            Permanently remove a petition and its related processes, ruling payloads, chronicle entries, supporting
            documents, and map data. This action cannot be undone.
          </p>

          <form className="settings__form" onSubmit={handleSubmit}>
            <label className="settings__field">
              <span className="settings__label">Select a petition</span>
              <select
                className="settings__select"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value === "" ? "" : Number(event.target.value))}
                disabled={!hasProjects || status === "pending"}
              >
                {!hasProjects ? <option value="">No petitions available</option> : null}
                {projects.map((project) => (
                  <option key={project.project.id} value={project.project.id}>
                    {formatProjectLabel(project)}
                  </option>
                ))}
              </select>
            </label>

            <label className="settings__field">
              <span className="settings__label">Confirm with password</span>
              <input
                className="settings__input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter maintenance password"
                disabled={deleteDisabled}
              />
              <span className="settings__hint">Enter the maintenance password to authorize deletion.</span>
            </label>

            {error ? (
              <p className="settings__error" role="alert">
                {error}
              </p>
            ) : null}

            {status === "success" ? (
              <p className="settings__success" role="status">
                Petition deleted successfully.
              </p>
            ) : null}

            <div className="settings__modal-actions">
              <button className="settings__button" type="submit" disabled={deleteDisabled}>
                {status === "pending" ? "Deleting…" : "Delete petition"}
              </button>
              <button className="settings__button settings__button--ghost" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [projects, setProjects] = useState<ProjectHierarchy[]>([])
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { isChristmasThemeEnabled, setChristmasThemeEnabled } = useHolidayTheme()
  const { designTheme, setDesignTheme } = useDesignTheme()

  useEffect(() => {
    let isActive = true

    const loadProjects = async () => {
      setIsLoadingProjects(true)
      setProjectLoadError(null)
      try {
        const hierarchy = await fetchProjectHierarchy()
        if (isActive) {
          setProjects(hierarchy)
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof ProjectPersistenceError ? error.message : "Unable to load petitions."
          setProjectLoadError(message)
          setProjects([])
        }
      } finally {
        if (isActive) {
          setIsLoadingProjects(false)
        }
      }
    }

    loadProjects()

    return () => {
      isActive = false
    }
  }, [])

  const availableProjects = useMemo(() => projects, [projects])

  const handleProjectDeleted = (projectId: number) => {
    setProjects((previous) => previous.filter((project) => project.project.id !== projectId))
  }

  return (
    <div className="settings" aria-labelledby="settings-heading">
      <div className="settings__inner">
        <header className="settings__header">
          <h1 id="settings-heading">Settings</h1>
          <p>Configure how Prythian Permits connects to Copilot runtimes used throughout the portal.</p>
        </header>

        <section className="settings__section" aria-labelledby="settings-runtime-heading">
          <h2 id="settings-runtime-heading">Copilot runtime</h2>
          <p className="settings__description">
            Choose between the hosted Copilot Cloud or the local Prythian ADK proxy for development and testing.
          </p>
          <div className="settings__control">
            <RuntimeSelectionControl />
          </div>
          <p className="settings__hint">
            Switching to the Prythian ADK routes Copilot requests through the local <code>/api/custom-adk</code>
            proxy.
          </p>
        </section>

        <section className="settings__section" aria-labelledby="settings-theme-heading">
          <h2 id="settings-theme-heading">Seasonal theme</h2>
          <p className="settings__description">
            Add a festive touch to Prythian Permits with falling starlight and Starfall cheer in the navigation.
          </p>
          <label className="settings__switch" htmlFor="settings-christmas-toggle">
            <div className="settings__switch-text">
              <span className="settings__label">Starfall theme</span>
              <span className="settings__hint">Show falling starlight and Starfall celebration in the header.</span>
            </div>
            <input
              id="settings-christmas-toggle"
              className="settings__switch-input"
              type="checkbox"
              checked={isChristmasThemeEnabled}
              onChange={(event) => setChristmasThemeEnabled(event.target.checked)}
            />
          </label>
        </section>

        <section className="settings__section" aria-labelledby="settings-design-theme-heading">
          <h2 id="settings-design-theme-heading">Visual theme</h2>
          <p className="settings__description">
            Choose between multiple visual themes. Your selection is saved to this device.
          </p>
          <div className="settings__control">
            <label className="settings__field" htmlFor="settings-design-theme-select">
              <span className="settings__label">Theme</span>
              <select
                id="settings-design-theme-select"
                className="settings__select"
                value={designTheme}
                onChange={(event) => setDesignTheme(event.target.value as DesignTheme)}
              >
                <option value="night">Night Court</option>
                <option value="spring">Spring Court</option>
                <option value="summer">Summer Court</option>
                <option value="autumn">Autumn Court</option>
                <option value="winter">Winter Court</option>
                <option value="day">Day Court</option>
                <option value="dawn">Dawn Court</option>
              </select>
              <span className="settings__hint">Theme preference is stored in local browser storage.</span>
            </label>
          </div>
        </section>

        <section className="settings__section settings__section--danger" aria-labelledby="settings-projects-heading">
          <h2 id="settings-projects-heading">Petition maintenance</h2>
          <p className="settings__description">
            Remove petitions and their associated data from Supabase when they are no longer needed.
          </p>

          {projectLoadError ? <p className="settings__error">{projectLoadError}</p> : null}
          {!projectLoadError && isLoadingProjects ? (
            <p className="settings__hint">Loading petitions…</p>
          ) : (
            <p className="settings__hint">
              Petitions, processes, ruling payloads, supporting documents, map data, and chronicle entries will be
              deleted together.
            </p>
          )}

          <div className="settings__danger-actions">
            <button
              className="settings__button settings__button--danger"
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoadingProjects || (!!projectLoadError && projects.length === 0)}
            >
              Delete a petition
            </button>
          </div>
        </section>
      </div>

      {showDeleteModal ? (
        <DeleteProjectModal
          projects={availableProjects}
          onClose={() => setShowDeleteModal(false)}
          onProjectDeleted={handleProjectDeleted}
        />
      ) : null}
    </div>
  )
}
