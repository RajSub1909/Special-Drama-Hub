/* =====================================================
   SECRET DRAMA HUB
   Authentication + Dashboard
   ===================================================== */

const SUPABASE_URL = "https://njutjrrlzvtcaiqarlfp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_CvfbSLnl7lqfu2W3lArZTg_vWdCR-sh";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


/* ================= DATA =================
   Temporary frontend data.
   Later this will come from Supabase.
*/

const dramas = [
  {
    id: 1,
    title: "Our Secret Story",
    genre: "Romance",
    year: "2026",
    rating: "9.4",
    emoji: "❤️",
    description:
      "A beautiful story about two people, unexpected moments and memories that become impossible to forget.",
    episodes: 12
  },

  {
    id: 2,
    title: "Midnight Promise",
    genre: "Romance • Mystery",
    year: "2026",
    rating: "9.1",
    emoji: "🌙",
    description:
      "A mysterious promise changes everything when two hearts meet after midnight.",
    episodes: 10
  },

  {
    id: 3,
    title: "Forever Us",
    genre: "Romance • Drama",
    year: "2025",
    rating: "9.6",
    emoji: "💖",
    description:
      "Sometimes the person you least expect becomes the most important chapter of your life.",
    episodes: 16
  },

  {
    id: 4,
    title: "Hidden Feelings",
    genre: "Romance",
    year: "2025",
    rating: "8.9",
    emoji: "🌹",
    description:
      "Feelings remain hidden until one unexpected moment reveals everything.",
    episodes: 14
  },

  {
    id: 5,
    title: "Love After Rain",
    genre: "Romance • Life",
    year: "2024",
    rating: "9.0",
    emoji: "🌧️",
    description:
      "A warm story about healing, second chances and finding happiness again.",
    episodes: 12
  },

  {
    id: 6,
    title: "Two Hearts",
    genre: "Romance • Drama",
    year: "2026",
    rating: "9.3",
    emoji: "💕",
    description:
      "Two different worlds. One unexpected connection.",
    episodes: 8
  },

  {
    id: 7,
    title: "The Last Message",
    genre: "Drama • Mystery",
    year: "2025",
    rating: "8.8",
    emoji: "💌",
    description:
      "One message arrives years later and changes the entire story.",
    episodes: 11
  },

  {
    id: 8,
    title: "Only You",
    genre: "Romance",
    year: "2026",
    rating: "9.5",
    emoji: "✨",
    description:
      "A story about choosing the same person, again and again.",
    episodes: 15
  }
];


/* ================= DOM ================= */

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const loginButton = document.getElementById("login-button");

const logoutButton = document.getElementById("logout-button");

const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");

const featuredGrid = document.getElementById("featured-grid");
const latestGrid = document.getElementById("latest-grid");
const allGrid = document.getElementById("all-grid");

const searchSection = document.getElementById("search-section");
const searchResults = document.getElementById("search-results");
const searchTitle = document.getElementById("search-title");
const noResults = document.getElementById("no-results");

const allSection = document.getElementById("all-section");

const detailsModal = document.getElementById("details-modal");
const detailsContent = document.getElementById("details-content");


/* ================= SECURITY HELPERS ================= */

/*
  Never inject user-provided text directly as HTML.

  For this demo data is trusted, but we still escape text
  before putting it inside generated markup.
*/

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ================= UI ================= */

function showApp() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  renderFeatured();
  renderLatest();

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
}


function showLogin() {
  appScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
}


/* ================= LOGIN ================= */

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  if (!email || !password) {
    loginMessage.textContent =
      "Please enter your email and password.";
    return;
  }

  loginButton.disabled = true;
  loginMessage.textContent = "Checking your login...";

  try {

    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      loginMessage.textContent =
        "Wrong email or password ❤️";

      loginButton.disabled = false;
      return;
    }

    loginMessage.textContent =
      "Welcome back ❤️";

    setTimeout(() => {
      loginButton.disabled = false;
      showApp();
    }, 350);

  } catch (error) {

    console.error(error);

    loginMessage.textContent =
      "Something went wrong. Please try again.";

    loginButton.disabled = false;
  }
});


/* ================= SESSION CHECK ================= */

async function checkSession() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    showApp();
  } else {
    showLogin();
  }
}


/* ================= LOGOUT ================= */

logoutButton.addEventListener("click", async () => {

  logoutButton.disabled = true;

  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
  }

  logoutButton.disabled = false;

  showLogin();

  loginMessage.textContent = "";
  loginForm.reset();
});


/* ================= DRAMA CARD ================= */

function dramaCard(drama) {

  return `
    <article
      class="drama-card"
      data-drama-id="${escapeHTML(drama.id)}"
      tabindex="0"
      role="button"
      aria-label="Open ${escapeHTML(drama.title)}"
    >

      <div class="poster">
        ${escapeHTML(drama.emoji)}
      </div>

      <div class="card-info">

        <h3>${escapeHTML(drama.title)}</h3>

        <p>${escapeHTML(drama.genre)}</p>

        <div class="card-meta">
          <span>⭐ ${escapeHTML(drama.rating)}</span>
          <span>${escapeHTML(drama.episodes)} Episodes</span>
        </div>

      </div>

    </article>
  `;
}


/* ================= FEATURED ================= */

function renderFeatured() {

  featuredGrid.innerHTML =
    dramas
      .slice(0, 4)
      .map(dramaCard)
      .join("");
}


/* ================= ALL ================= */

function renderAll() {

  allGrid.innerHTML =
    dramas
      .map(dramaCard)
      .join("");

  allSection.classList.remove("hidden");

  allSection.scrollIntoView({
    behavior: "smooth"
  });
}


/* ================= LATEST EPISODES ================= */

function renderLatest() {

  const latest = dramas
    .slice(0, 6)
    .map((drama, index) => ({
      drama,
      episode: drama.episodes - index
    }));

  latestGrid.innerHTML =
    latest
      .map(({ drama, episode }) => {

        return `
          <article
            class="episode-card"
            data-drama-id="${escapeHTML(drama.id)}"
          >

            <span class="episode-number">
              EPISODE ${escapeHTML(episode)}
            </span>

            <h3>${escapeHTML(drama.title)}</h3>

            <p>
              ${escapeHTML(drama.genre)}
              • New episode available
            </p>

          </article>
        `;
      })
      .join("");
}


/* ================= DETAILS ================= */

function openDrama(dramaId) {

  const drama =
    dramas.find(item => item.id === Number(dramaId));

  if (!drama) return;

  const episodes = Array.from(
    { length: drama.episodes },
    (_, index) => index + 1
  );

  detailsContent.innerHTML = `

    <div class="detail-header">

      <div class="detail-poster">
        ${escapeHTML(drama.emoji)}
      </div>

      <div class="detail-info">

        <span class="section-kicker">
          ${escapeHTML(drama.genre)}
        </span>

        <h2 id="details-title">
          ${escapeHTML(drama.title)}
        </h2>

        <p>
          ${escapeHTML(drama.description)}
        </p>

        <div class="card-meta">
          <span>⭐ ${escapeHTML(drama.rating)}</span>
          <span>${escapeHTML(drama.year)}</span>
          <span>${escapeHTML(drama.episodes)} Episodes</span>
        </div>

      </div>

    </div>

    <div class="episode-list">

      ${episodes.map(number => `

        <div class="episode-row">

          <div>
            <strong>
              Episode ${number}
            </strong>

            <p style="color:#888;margin-top:4px;font-size:12px;">
              ${escapeHTML(drama.title)}
            </p>
          </div>

          <button
            class="play-button"
            data-episode="${number}"
            data-drama="${escapeHTML(drama.title)}"
          >
            ▶ Play
          </button>

        </div>

      `).join("")}

    </div>
  `;

  detailsModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";
}


/* ================= CLOSE MODAL ================= */

function closeModal() {

  detailsModal.classList.add("hidden");

  document.body.style.overflow = "";
}


/* ================= SEARCH ================= */

function performSearch() {

  const query =
    searchInput.value.trim().toLowerCase();

  clearSearch.classList.toggle(
    "hidden",
    query.length === 0
  );

  if (!query) {

    searchSection.classList.add("hidden");
    return;
  }

  const results =
    dramas.filter(drama =>
      drama.title.toLowerCase().includes(query) ||
      drama.genre.toLowerCase().includes(query) ||
      drama.description.toLowerCase().includes(query)
    );

  searchSection.classList.remove("hidden");

  searchTitle.textContent =
    `Results for "${searchInput.value.trim()}"`;

  searchResults.innerHTML =
    results.map(dramaCard).join("");

  noResults.classList.toggle(
    "hidden",
    results.length !== 0
  );

  searchSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


searchInput.addEventListener(
  "input",
  performSearch
);


clearSearch.addEventListener("click", () => {

  searchInput.value = "";

  clearSearch.classList.add("hidden");

  searchSection.classList.add("hidden");

  searchInput.focus();
});


/* ================= CLICK HANDLER ================= */

document.addEventListener("click", (event) => {

  const dramaCardElement =
    event.target.closest(".drama-card");

  if (dramaCardElement) {

    openDrama(
      dramaCardElement.dataset.dramaId
    );

    return;
  }


  const episodeCard =
    event.target.closest(".episode-card");

  if (episodeCard) {

    openDrama(
      episodeCard.dataset.dramaId
    );

    return;
  }


  const actionElement =
    event.target.closest("[data-action]");

  if (actionElement) {

    const action =
      actionElement.dataset.action;

    if (action === "close-modal") {
      closeModal();
    }

    if (action === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    if (action === "show-all") {
      renderAll();
    }

    return;
  }


  const scrollElement =
    event.target.closest("[data-scroll]");

  if (scrollElement) {

    const target =
      document.getElementById(
        scrollElement.dataset.scroll
      );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth"
      });
    }

    return;
  }


  const playButton =
    event.target.closest(".play-button");

  if (playButton) {

    const drama =
      playButton.dataset.drama;

    const episode =
      playButton.dataset.episode;

    alert(
      `Episode ${episode} of "${drama}" is ready.\n\nVideo player will be connected in the next phase.`
    );
  }
});


/* ================= KEYBOARD ================= */

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {
    closeModal();
  }

});


/* ================= AUTH STATE ================= */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_IN" && session) {
      showApp();
    }

    if (event === "SIGNED_OUT") {
      showLogin();
    }
  }
);


/* ================= START ================= */

checkSession();
