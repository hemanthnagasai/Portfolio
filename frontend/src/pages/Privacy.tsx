import { useContext, useEffect } from "react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import Leaf from "@/components/kit/Leaf";

// Written to describe what this site actually does, not what a generic
// template says. The analytics section renders only when analytics are
// genuinely switched on, so the page can't drift out of truth.
const analyticsEnabled = !!import.meta.env.REACT_APP_GOATCOUNTER;

export default function Privacy() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Privacy — Hemanth Naga Sai Chakka",
    "What this site collects, what it doesn't, and who else sees it. In plain language.",
  );

  useEffect(() => {
    setDimension("gateway");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <Leaf
      title="Privacy"
      heading={["Privacy."]}
      intro="This is a personal portfolio, not a business. I'm not selling anything, and I'm not building a profile of you. Here's exactly what happens when you visit."
      note="Updated July 2026"
      testId="privacy-page"
      backTestId="privacy-back-link"
      footer={[
        { to: "/how-i-built-this", label: "How this site was built" },
        { to: "/", label: "Back to the gateway" },
      ]}
    >
      <div className="leaf-prose">
          <section>
            <h2>The short version</h2>
            <p>
              <strong>No cookies. No ad tech. No accounts. No selling anything to anyone.</strong>{" "}
              The site keeps a few small notes in your own browser so it doesn't repeat itself, and
              a handful of services see technical data in the ordinary course of serving the page.
              That's it.
            </p>
          </section>

          <section>
            <h2>What's stored on your device</h2>
            <p>
              Not cookies — just browser storage, which never gets sent to my server. It's purely
              so the site behaves sensibly:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              <li>
                <code>lp_first_visit_ts</code>, <code>lp_visited_worlds</code> — when you first
                arrived and which worlds you've opened, so a hidden page can unlock once you've
                actually explored.
              </li>
              <li>
                <code>intro_seen</code> — so the opening sequence doesn't replay every time.
              </li>
              <li>
                <code>trace_left</code> — remembers you've already left a word in the guestbook.
              </li>
            </ul>
            <p className="mt-3">
              Clearing your browser data removes all of it, and nothing breaks if you do.
            </p>
          </section>

          <section>
            <h2>What the server sees</h2>
            <p>
              Standard web server logs — IP address, browser, which page you asked for, and when.
              This is how every website on the internet works; without it the server can't send you
              anything. It's also what lets me rate-limit abuse. These logs live with my host and
              rotate away on their own.
            </p>
          </section>

          <section>
            <h2>Error monitoring</h2>
            <p>
              If something breaks while you're here, an error report goes to <strong>Sentry</strong>{" "}
              so I can fix it. That report includes the error itself, the page you were on, your
              browser and operating system, and your IP address. I use it to find bugs — nothing
              else — and I don't attempt to identify anyone from it.
            </p>
          </section>

          {analyticsEnabled && (
            <section>
              <h2>Analytics</h2>
              <p>
                Visit counts come from <strong>GoatCounter</strong>, which is deliberately
                privacy-first: <strong>no cookies, no cross-site tracking, and no personal data
                collected</strong>. It records that a page was viewed and roughly where in the world
                from — never who you are. That's why there's no cookie banner on this site: there's
                nothing to consent to.
              </p>
            </section>
          )}

          <section>
            <h2>The chatbot</h2>
            <p>
              The "Ask Hemanth" chat sends your message, and the recent messages in that
              conversation, to <strong>Google's Gemini API</strong> to generate a reply.{" "}
              <strong>I don't store your conversation</strong> — there's no chat log, no database
              table, nothing kept after the reply is sent. Refresh the page and it's gone. Google
              processes the request under their own terms.
            </p>
            <p className="mt-3">
              Please don't type anything sensitive into it. It's a portfolio chatbot, not a secure
              channel.
            </p>
          </section>

          <section>
            <h2>The guestbook</h2>
            <p>
              If you leave a word on the Emotional page, that single word is stored and shown
              publicly to other visitors, along with the time it was left.{" "}
              <strong>No IP address, no name, nothing linking it to you</strong> — the database
              genuinely holds only the word and a timestamp. The word is checked by Gemini for
              abuse before it's saved. If you'd like a word removed, email me and it's gone.
            </p>
          </section>

          <section>
            <h2>Who else is involved</h2>
            <ul className="mt-1 space-y-2 list-none">
              <li>
                <strong>Render</strong> — hosts the site and keeps the server logs above.
              </li>
              <li>
                <strong>Google Fonts</strong> — the typefaces load from Google's servers, which
                means Google sees your IP address when the page loads. Worth naming plainly, since
                most sites don't.
              </li>
              <li>
                <strong>Google Gemini</strong> — powers the chatbot and the guestbook moderation.
              </li>
              <li>
                <strong>Sentry</strong> — receives error reports.
              </li>
              {analyticsEnabled && (
                <li>
                  <strong>GoatCounter</strong> — anonymous visit counts.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h2>Your say</h2>
            <p>
              Since I hold almost nothing about you, there's usually nothing to hand over or
              delete. But if you want a guestbook word removed, want to know what's in an error
              report, or just have a question — email me at{" "}
              <a
                href="mailto:virathemu9@gmail.com"
              >
                virathemu9@gmail.com
              </a>{" "}
              and I'll sort it out. No process, no form. Just me.
            </p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>
              If what the site collects changes, this page changes with it — the date at the top
              tells you when it was last true.
            </p>
          </section>
      </div>
    </Leaf>
  );
}
