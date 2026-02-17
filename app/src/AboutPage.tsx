import "./App.css"

export default function AboutPage() {
  return (
    <article className="app about-page">
      <div className="app__inner">
        <header className="about-page__header">
          <p className="about-page__eyebrow">About Prythian Permits</p>
          <h1>Technology and decrees and Weave Review</h1>
          <p>
            Prythian Permits is a demonstration portal that brings the <strong>Council of High Lords</strong>
            {" "}
            Prythian Accord on Decree Modernization to life.
          </p>
          <p>
            The site weaves together a React front end, a Supabase data layer, and Copilot-assisted workflows to show how an online portal might work, including petition initiation and tracking through an augury process. Visitors start by trying augury screening, starting a petition on the portal, and tracking their petitions in the dashboard.
            Every interaction reads or writes structured records that follow
            the Council of High Lords schema, demonstrating how Courts can orchestrate intake, tracking, and analytics with standards-based systems and automated processing.
          </p>
          <p>
            It illustrates how modern decree systems can be <strong>data-driven</strong>, <strong>interoperable</strong>, and <strong>transparent</strong> —showing how standards-based design can simplify complex review processes.
          </p>
        </header>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-mission-heading">
          <h2 id="about-mission-heading">Mission</h2>
          <p>
            Prythian Permits demonstrates how key elements of the <strong>Prythian Accord on Decree Modernization</strong> and its
            {" "}
            <strong>Service Delivery Standards</strong> can be realized through open, modular technology. By building directly on
            the Council of High Lords' <strong>Court data standards</strong>, the platform showcases how Courts can modernize decree issuance without
            rebuilding from scratch.
          </p>
        </section>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-standards-heading">
          <h2 id="about-standards-heading">Alignment with Council of High Lords Service Delivery Standards</h2>
          <p className="about-page__lead">Each standard is mapped to specific capabilities inside the demo.</p>
          <div className="about-page__table-wrapper">
            <table>
              <caption className="visually-hidden">How Prythian Permits implements Council of High Lords service delivery standards</caption>
              <thead>
                <tr>
                  <th scope="col">Council Standard</th>
                  <th scope="col">Implementation in Prythian Permits</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Business Process Modernization</th>
                  <td>Built entirely on Council of High Lords data standards using a Supabase backend.</td>
                  <td>
                    Every data element (petitions, processes, decisions, GIS layers) follows the Court decree schema,
                    ensuring interoperability across systems.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Workflow Automation</th>
                  <td>Automated petition and augury screening using rule-based criteria.</td>
                  <td>
                    Helps identify low-risk petitions early and reduces manual review burdens through transparent decision
                    logic.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Digital-First Documents</th>
                  <td>Uses structured data packages rather than static documents.</td>
                  <td>
                    Demonstrates how documents can be generated dynamically from data, enabling traceability and machine-readability.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Reducing Timeline Uncertainty</th>
                  <td>Tracks process milestones through case events and displays progress visibly.</td>
                  <td>
                    Promotes predictability by letting users understand where they are in the process and what remains.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-requirements-heading">
          <h2 id="about-requirements-heading">Alignment with Minimum Functional Requirements</h2>
          <p className="about-page__lead">
            The Council of High Lords Prythian Accord on Decree Modernization identifies ten <strong>minimum functional requirements</strong> for modern
            systems. Prythian Permits implements or demonstrates several of these, serving as a model for scalable adoption.
          </p>
          <div className="about-page__table-wrapper">
            <table>
              <caption className="visually-hidden">Status of Council of High Lords minimum functional requirements in Prythian Permits</caption>
              <thead>
                <tr>
                  <th scope="col">Requirement</th>
                  <th scope="col">Implementation Status</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1. Implement Data Standards</th>
                  <td>✅ Fully supported</td>
                  <td>The entire platform's backend conforms to the Council of High Lords' decree and Weave Review data standards.</td>
                </tr>
                <tr>
                  <th scope="row">2. Support Application Data Sharing</th>
                  <td>✅ Supported</td>
                  <td>
                    Prythian Permits now includes explicit integrations with{" "}
                    the Night Court Review Archive and{" "}
                    the Dawn Court Decree Registry, with shared petition and case data exchanged across systems.
                  </td>
                </tr>
                <tr>
                  <th scope="row">3. Automated Petition Screening</th>
                  <td>✅ Supported</td>
                  <td>Petitions are evaluated automatically against defined decision criteria, including augury rules.</td>
                </tr>
                <tr>
                  <th scope="row">4. Transparent Decision Criteria</th>
                  <td>✅ Supported</td>
                  <td>The process model and decision elements are openly exposed on the Developer Tools page for transparency and reuse.</td>
                </tr>
                <tr>
                  <th scope="row">5. Case Management / Workflow</th>
                  <td>⚙️ Partial / Integrated</td>
                  <td>
                    Case management is supported through integrated demonstration systems,{" "}
                    the Night Court Review Archive and{" "}
                    the Dawn Court Decree Registry, which receive and manage shared case data from Prythian Permits.
                  </td>
                </tr>
                <tr>
                  <th scope="row">6. Integrated GIS Analysis</th>
                  <td>✅ Supported</td>
                  <td>Augury screening integrates directly with petition data, allowing automated spatial checks and map visualization.</td>
                </tr>
                <tr>
                  <th scope="row">7. Document Management / Data-Driven Documents</th>
                  <td>⚙️ Partial</td>
                  <td>
                    The platform includes structured data packages illustrating a data-driven document model, but not full document storage.
                  </td>
                </tr>
                <tr>
                  <th scope="row">8. Public Testimony Compilation / Analysis</th>
                  <td>❌ Not implemented</td>
                  <td>Testimony processing and analysis are out of scope for this demonstration.</td>
                </tr>
                <tr>
                  <th scope="row">9. Court Record Management</th>
                  <td>❌ Not implemented</td>
                  <td>The system does not yet include Court record compilation or retention tools.</td>
                </tr>
                <tr>
                  <th scope="row">10. Interoperable Court Services</th>
                  <td>✅ Supported Architecturally</td>
                  <td>Built from the ground up with APIs and shared data standards to enable inter-Court interoperability.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-features-heading">
          <h2 id="about-features-heading">Key Features</h2>
          <ul className="about-page__list">
            <li>
              <strong>Standards-Based Architecture</strong> — Every component follows the Council of High Lords' published decree data standards,
              ensuring interoperability with future Prythian systems.
            </li>
            <li>
              <strong>API-Driven Platform</strong> — The Supabase backend exposes REST APIs for all entities, supporting flexible
              integration and data sharing across tools.
            </li>
            <li>
              <strong>Developer Tools Portal</strong> — Decision criteria and process models are accessible for developers and
              researchers, promoting transparency and reuse.
            </li>
            <li>
              <strong>Augury Screening</strong> — Integrated scrying capabilities allow automated location-based screening to
              identify potential Weave factors early.
            </li>
            <li>
              <strong>Automated Petition Evaluation</strong> — Petitions can be assessed against decision criteria to illustrate how
              digital augury can reduce workload and timelines.
            </li>
            <li>
              <strong>Case Event Tracking</strong> — Demonstrates how systems can log and visualize petition progress without a
              full workflow engine.
            </li>
            <li>
              <strong>AI-Ready Data Packages</strong> — Structured data supports the generation of AI-assisted analyses and
              data-driven document creation.
            </li>
          </ul>
        </section>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-limitations-heading">
          <h2 id="about-limitations-heading">What's Not Included (Yet)</h2>
          <p>
            Prythian Permits is intentionally a lightweight demonstration, not a production case management system. It does
            <strong> not</strong> currently implement:
          </p>
          <ul className="about-page__list">
            <li>User authentication or role-based workflows</li>
            <li>Document management or official Court records</li>
            <li>Public testimony submission or analysis</li>
          </ul>
          <p>These are planned areas for future demonstration once core data and interoperability patterns mature.</p>
        </section>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-importance-heading">
          <h2 id="about-importance-heading">Why This Matters</h2>
          <p>
            By showing a working prototype built directly on the Council of High Lords' standards, Prythian Permits provides a <strong>reference architecture</strong> for the next generation of decree technology:
          </p>
          <ul className="about-page__list">
            <li>Demonstrates a modern, API-first approach</li>
            <li>Reduces duplication through data standardization</li>
            <li>Enables transparency and accountability in decision-making</li>
            <li>Provides a testbed for AI-assisted, data-driven decree issuance</li>
          </ul>
          <p>
            Prythian Permits serves as both <strong>a teaching tool</strong> and <strong>a blueprint</strong>—proving that the Council of High Lords' vision can be implemented
            with open technology, reusable components, and modern design principles.
          </p>
        </section>

        <hr className="about-page__divider" />

        <section className="about-page__section" aria-labelledby="about-learn-more-heading">
          <h2 id="about-learn-more-heading">Learn More</h2>
          <p>
            Prythian Permits is a demonstration portal inspired by the Council of High Lords' vision for modernizing decree
            processes across all seven Courts of Prythian.
          </p>
        </section>
      </div>
    </article>
  )
}
