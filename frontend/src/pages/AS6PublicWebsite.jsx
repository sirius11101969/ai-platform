import { Link } from "react-router-dom";
import as6Logo from "../assets/as6-logo.webp";
import as6Robot from "../assets/as6-robot.png";
import "./AS6PublicWebsite.css";

const products = [
  ["CRM", "Pipeline, leads, follow-ups, and customer context inside one operating workspace."],
  ["AI Assistant", "Executive assistant for next actions, task focus, and daily operating rhythm."],
  ["Revenue", "Forecasting, deal risk, and revenue control for founders and sales teams."],
  ["Analytics", "Business signals, operating health, and decision history in one view."],
  ["Automation", "Human-approved automations for repetitive sales and operations work."],
  ["Documents", "Commercial documents, proposals, and company memory connected to workflows."],
];

const advantages = [
  ["One operating layer", "AS6 connects CRM, tasks, AI actions, revenue, and decisions without turning the public site into the app."],
  ["Built for business owners", "The product starts from clarity: what is happening, what matters, and what to do next."],
  ["Workspace-first architecture", "The application lives under /app, while CRM remains a dedicated workspace under /as6-crm."],
];

export const as6BlogPosts = [
  {
    slug: "ai-operating-system-for-business",
    title: "AI Operating System for Business",
    excerpt: "Why companies need an operating layer that combines CRM, decisions, revenue, and AI actions.",
    category: "Architecture",
    date: "2026-07-06",
    image: "linear-gradient(135deg, rgba(36, 228, 255, .86), rgba(122, 92, 255, .72))",
  },
  {
    slug: "crm-inside-as6-one",
    title: "CRM inside AS6 ONE",
    excerpt: "How CRM becomes a workspace in a wider business operating system instead of a separate silo.",
    category: "CRM",
    date: "2026-07-06",
    image: "linear-gradient(135deg, rgba(50, 245, 169, .8), rgba(37, 99, 235, .74))",
  },
  {
    slug: "human-approved-automation",
    title: "Human-approved automation",
    excerpt: "Automation should recommend, prepare, and execute only through clear ownership and approval.",
    category: "Governance",
    date: "2026-07-06",
    image: "linear-gradient(135deg, rgba(255, 159, 28, .82), rgba(255, 61, 143, .7))",
  },
];

function PublicNav() {
  return (
    <header className="as6-public-nav">
      <Link className="as6-public-brand" to="/">
        <img src={as6Logo} alt="AS6" />
        <span>AS6</span>
      </Link>
      <nav aria-label="AS6 public navigation">
        <a href="/#products">Products</a>
        <Link to="/blog">Blog</Link>
        <Link to="/docs">Docs</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <div className="as6-public-actions">
        <Link to="/as6-crm">CRM</Link>
        <Link className="as6-public-cta" to="/app">Open App</Link>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="as6-public-footer">
      <strong>AS6</strong>
      <span>AI Operating System for Business</span>
      <Link to="/app">Open App</Link>
    </footer>
  );
}

function BlogCard({ post }) {
  return (
    <Link className="as6-blog-card" to={`/blog/${post.slug}`}>
      <div className="as6-blog-card__image" style={{ background: post.image }}>
        <span>{post.category}</span>
      </div>
      <div>
        <small>{post.date}</small>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    </Link>
  );
}

function BlogList({ limit }) {
  const posts = limit ? as6BlogPosts.slice(0, limit) : as6BlogPosts;
  return (
    <div className="as6-blog-grid">
      {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
    </div>
  );
}

export function AS6PublicHomePage() {
  return (
    <div className="as6-public-site">
      <PublicNav />
      <main>
        <section className="as6-public-hero">
          <div className="as6-public-hero__copy">
            <span>AI Operating System for Business</span>
            <h1>AS6 turns business operations into one intelligent workspace.</h1>
            <p>
              A premium AI operating system for CRM, revenue, analytics, automation, documents,
              and executive decisions.
            </p>
            <div className="as6-public-hero__actions">
              <Link className="as6-public-primary" to="/app">Open App</Link>
              <Link className="as6-public-secondary" to="/as6-crm">Open CRM</Link>
            </div>
          </div>
          <div className="as6-public-orbit" aria-hidden="true">
            <img src={as6Robot} alt="" />
            <div><b>AS6 CORE</b><span>Business OS online</span></div>
          </div>
        </section>

        <section className="as6-public-section" id="products">
          <div className="as6-public-section__head">
            <span>Products</span>
            <h2>One system for the company cockpit.</h2>
          </div>
          <div className="as6-product-grid">
            {products.map(([title, copy]) => (
              <article key={title}>
                <span>{title.slice(0, 2).toUpperCase()}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="as6-public-section as6-public-band">
          <div className="as6-public-section__head">
            <span>Advantages</span>
            <h2>Designed for clarity, ownership, and execution.</h2>
          </div>
          <div className="as6-advantage-grid">
            {advantages.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="as6-public-section">
          <div className="as6-public-section__head">
            <span>Blog</span>
            <h2>Notes on building an AI business operating system.</h2>
            <Link to="/blog">View all posts</Link>
          </div>
          <BlogList limit={3} />
        </section>

        <section className="as6-public-cta-band">
          <h2>Run the company from AS6 ONE.</h2>
          <p>Use the public website for discovery and the application workspace for operations.</p>
          <Link to="/app">Open App</Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

export function AS6BlogPage() {
  const slug = typeof window === "undefined" ? "" : window.location.pathname.replace(/^\/blog\/?/, "").split("/")[0];
  const post = slug ? as6BlogPosts.find((item) => item.slug === slug) : null;

  if (slug && post) {
    return (
      <div className="as6-public-site">
        <PublicNav />
        <main className="as6-public-page">
          <article className="as6-post">
            <div className="as6-post__image" style={{ background: post.image }} />
            <span>{post.category} · {post.date}</span>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <p>
              This local demo article establishes the SEO-ready blog slug structure.
              A future content engine can replace the local array without changing public routes.
            </p>
            <Link to="/blog">Back to Blog</Link>
          </article>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="as6-public-site">
      <PublicNav />
      <main className="as6-public-page">
        <section className="as6-public-page__header">
          <span>Blog</span>
          <h1>AS6 Blog</h1>
          <p>Product notes, architecture decisions, and operating-system thinking for business AI.</p>
        </section>
        <BlogList />
      </main>
      <PublicFooter />
    </div>
  );
}

const pageContent = {
  docs: {
    eyebrow: "Docs",
    title: "AS6 Documentation",
    copy: "Architecture, product concepts, and operating guides for AS6 ONE, CRM, automation, and governance.",
    items: ["Getting started", "AS6 ONE workspace", "CRM workspace", "Automation governance"],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Plans for every operating rhythm.",
    copy: "Start with the public foundation, then scale into AS6 ONE, CRM, analytics, and automation.",
    items: ["Starter", "Business", "Enterprise", "Architecture review"],
  },
  about: {
    eyebrow: "About",
    title: "AS6 is a business operating system.",
    copy: "AS6 connects decision making, customer operations, revenue control, and AI assistance in one workspace.",
    items: ["Founder operating layer", "AI-assisted execution", "Human approval by default", "Route-owned architecture"],
  },
  contact: {
    eyebrow: "Contact",
    title: "Talk to AS6.",
    copy: "Use AS6 to align CRM, revenue, documents, analytics, and automation around one operating model.",
    items: ["Product demo", "Architecture consultation", "CRM migration", "Enterprise onboarding"],
  },
};

export function AS6PublicInfoPage({ type }) {
  const page = pageContent[type] || pageContent.docs;
  return (
    <div className="as6-public-site">
      <PublicNav />
      <main className="as6-public-page">
        <section className="as6-public-page__header">
          <span>{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.copy}</p>
        </section>
        <div className="as6-info-grid">
          {page.items.map((item) => (
            <article key={item}>
              <h3>{item}</h3>
              <p>Public website foundation content. This route is ready for dedicated content in the next stage.</p>
            </article>
          ))}
        </div>
        <section className="as6-public-cta-band compact">
          <h2>Move from website to workspace.</h2>
          <Link to="/app">Open App</Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
