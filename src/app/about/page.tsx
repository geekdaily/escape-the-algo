import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'About | Escape The Algorithm',
  description: 'Learn about Escape The Algorithm and how it helps you discover interesting videos',
};

export default function AboutPage() {
  return (
    <div className="container">
      <main className="main">
        <h1 className="headline">About</h1>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>What is this?</h2>
            <p>
              <strong>Escape The Algorithm</strong> is a simple experiment in serendipity. Instead
              of letting YouTube&apos;s recommendation algorithm decide what you should watch, we
              show you random videos uploaded near your location.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How does it work?</h2>
            <p>
              When you load the page, we find your approximate location based on your IP address.
              Then we search for the 10 most recent videos uploaded within 10 miles of that
              location and pick one at random to show you.
            </p>
            <p>
              If there aren&apos;t enough videos nearby, we gradually expand the search radius up
              to 1000 miles. The goal is to help you discover content you might never have found
              otherwise&mdash;local events, neighborhood creators, small-town stories, and other
              hidden gems.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Why?</h2>
            <p>
              YouTube&apos;s algorithm is designed to maximize engagement, which often means
              showing you more of what you&apos;ve already watched. This creates a filter bubble
              where you see an increasingly narrow slice of content.
            </p>
            <p>
              By surfacing random, local videos, we hope to pop that bubble a little. You might
              find something weird, wonderful, or completely uninteresting&mdash;but at least
              it&apos;s not what the algorithm picked for you.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Privacy</h2>
            <p>
              Your approximate location is determined by your IP address on each visit. We
              don&apos;t store your location or track you across sessions. The only thing stored
              in your browser is a list of videos you&apos;ve already seen, so we can show you
              something new each time.
            </p>
          </section>

          <div className={styles.backLink}>
            <Link href="/">← Back to videos</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <Link href="/">Home</Link>
          <a
            href="https://github.com/geekdaily/escape-the-algo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <p className="tagline">
          made with ❤️ by{' '}
          <a href="https://geekdaily.org/" target="_blank" rel="noopener noreferrer">
            geek!daily
          </a>
        </p>
      </footer>
    </div>
  );
}
