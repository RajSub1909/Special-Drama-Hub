/* =====================================================
   SECRET DRAMA HUB
   Supabase + Real Drama Database + YouTube Player
   ===================================================== */

const SUPABASE_URL = "https://njutjrrlzvtcaiqarlfp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_CvfbSLnl7lqfu2W3lArZTg_vWdCR-sh";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


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


/* ================= DATA ================= */

let dramas = [];
let episodesCache = new Map();
let currentUser = null;


/* ================= SECURITY ================= */

function escapeHTML(value) {
  return String(value ?? "")
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

  loadDramaData();

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

  loginMessage.textContent =
    "Checking your login...";

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


/* ================= SESSION ================= */

async function checkSession() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {

    currentUser = session.user;

    showApp();

  } else {

    currentUser = null;

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


/* =====================================================
   LOAD REAL DRAMAS FROM SUPABASE
   ===================================================== */

async function loadDramaData() {

  featuredGrid.innerHTML =
    `<p class="loading-message">Loading dramas... 🎬</p>`;

  latestGrid.innerHTML = "";

  try {

    const { data, error } =
      await supabaseClient
        .from("dramas")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    dramas = data || [];

    if (dramas.length === 0) {

      featuredGrid.innerHTML =
        `<p class="loading-message">
          No dramas added yet.
        </p>`;

      return;
    }

    renderFeatured();

    renderLatest();

  } catch (error) {

    console.error("Drama loading error:", error);

    featuredGrid.innerHTML =
      `<p class="loading-message">
        Unable to load dramas. Please refresh.
      </p>`;
  }
}


/* =====================================================
   DRAMA CARD
   ===================================================== */

function dramaCard(drama) {

  const poster = drama.poster_url
    ? `
      <img
        src="${escapeHTML(drama.poster_url)}"
        alt="${escapeHTML(drama.title)} poster"
        loading="lazy"
      >
    `
    : `
      <div class="poster-placeholder">
        🎬
      </div>
    `;

  return `
    <article
      class="drama-card"
      data-drama-id="${escapeHTML(drama.id)}"
      tabindex="0"
      role="button"
      aria-label="Open ${escapeHTML(drama.title)}"
    >

      <div class="poster">
        ${poster}
      </div>

      <div class="card-info">

        <h3>${escapeHTML(drama.title)}</h3>

        <p>${escapeHTML(drama.genre || "Drama")}</p>

        <div class="card-meta">

          ${
            drama.rating
              ? `<span>⭐ ${escapeHTML(drama.rating)}</span>`
              : ""
          }

          <span>
            ${escapeHTML(drama.release_year || "")}
          </span>

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


/* =====================================================
   LOAD LATEST EPISODES
   ===================================================== */

async function renderLatest() {

  latestGrid.innerHTML =
    `<p class="loading-message">Loading latest episodes...</p>`;

  try {

    const { data, error } =
      await supabaseClient
        .from("episodes")
        .select(`
          id,
          episode_number,
          title,
          created_at,
          drama_id,
          dramas (
            id,
            title,
            genre
          )
        `)
        .order("created_at", {
          ascending: false
        })
        .limit(6);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {

      latestGrid.innerHTML =
        `<p class="loading-message">
          No episodes available yet.
        </p>`;

      return;
    }

    latestGrid.innerHTML =
      data.map(episode => {

        const drama = episode.dramas;

        return `
          <article
            class="episode-card"
            data-drama-id="${escapeHTML(episode.drama_id)}"
          >

            <span class="episode-number">
              EPISODE ${escapeHTML(episode.episode_number)}
            </span>

            <h3>
              ${escapeHTML(drama?.title || "Drama")}
            </h3>

            <p>
              ${escapeHTML(episode.title || "Watch episode")}
            </p>

          </article>
        `;

      }).join("");

  } catch (error) {

    console.error("Latest episodes error:", error);

    latestGrid.innerHTML =
      `<p class="loading-message">
        Unable to load episodes.
      </p>`;
  }
}


/* =====================================================
   OPEN DRAMA
   ===================================================== */

async function openDrama(dramaId) {
  try {
    detailsContent.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:40px;">🎬</div>
        <p>Loading episodes...</p>
      </div>
    `;

    detailsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Get drama
    const { data: drama, error: dramaError } =
      await supabaseClient
        .from("dramas")
        .select("*")
        .eq("id", dramaId)
        .single();

    if (dramaError) throw dramaError;

    // Get real episodes
    const { data: episodes, error: episodeError } =
      await supabaseClient
        .from("episodes")
        .select("*")
        .eq("drama_id", dramaId)
        .order("episode_number", { ascending: true });

    if (episodeError) throw episodeError;

    detailsContent.innerHTML = `

      <div class="detail-header">

        <div class="detail-poster">
          ${
            drama.poster_url
              ? `<img
                  src="${escapeHTML(drama.poster_url)}"
                  alt="${escapeHTML(drama.title)}"
                  style="width:100%;height:100%;object-fit:cover;border-radius:20px;"
                >`
              : "🎬"
          }
        </div>

        <div class="detail-info">

          <span class="section-kicker">
            ${escapeHTML(drama.genre || "Drama")}
          </span>

          <h2 id="details-title">
            ${escapeHTML(drama.title)}
          </h2>

          <p>
            ${escapeHTML(
              drama.description || "Watch all episodes."
            )}
          </p>

          <div class="card-meta">
            <span>⭐ ${escapeHTML(drama.rating || "N/A")}</span>
            <span>${escapeHTML(drama.year || "")}</span>
            <span>${episodes.length} Episodes</span>
          </div>

        </div>

      </div>

      <div class="episode-list">

        ${
          episodes.length
            ? episodes.map(episode => `
              
              <div class="episode-row">

                <div>
                  <strong>
                    Episode ${escapeHTML(episode.episode_number)}
                  </strong>

                  <p style="color:#888;margin-top:4px;font-size:12px;">
                    ${escapeHTML(
                      episode.title || drama.title
                    )}
                  </p>
                </div>

                <button
                  class="play-button"
                  data-video-id="${escapeHTML(
                    episode.youtube_video_id
                  )}"
                  data-episode="${escapeHTML(
                    episode.episode_number
                  )}"
                  data-drama="${escapeHTML(drama.title)}"
                >
                  ▶ Play
                </button>

              </div>

            `).join("")
            : `
              <p style="text-align:center;padding:30px;color:#aaa;">
                No episodes available yet.
              </p>
            `
        }

      </div>
    `;

  } catch (error) {

    console.error("Drama loading error:", error);

    detailsContent.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:40px;">⚠️</div>
        <h3>Unable to load drama</h3>
        <p style="color:#aaa;margin-top:10px;">
          Please try again.
        </p>
      </div>
    `;
  }
}

/* =====================================================
   YOUTUBE PLAYER
   ===================================================== */

function playEpisode(videoId, episodeNumber, dramaTitle) {

  if (!videoId) {

    alert("Video is not available.");

    return;
  }

  detailsContent.innerHTML = `

    <div class="video-player-wrapper">

      <div class="video-header">

        <button
          class="back-to-episodes"
          data-action="back-to-episodes"
        >
          ← Episodes
        </button>

        <span>
          ${escapeHTML(dramaTitle)}
          • Episode ${escapeHTML(episodeNumber)}
        </span>

      </div>

      <div class="youtube-player">

        <iframe
          src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1"
          title="${escapeHTML(
            dramaTitle
          )} Episode ${escapeHTML(
            episodeNumber
          )}"
          frameborder="0"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share
          "
          allowfullscreen
        ></iframe>

      </div>

    </div>
  `;
}


/* =====================================================
   CLOSE MODAL
   ===================================================== */

function closeModal() {

  detailsModal.classList.add("hidden");

  document.body.style.overflow = "";
}


/* =====================================================
   SEARCH
   ===================================================== */

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

      drama.title
        ?.toLowerCase()
        .includes(query) ||

      drama.genre
        ?.toLowerCase()
        .includes(query) ||

      drama.description
        ?.toLowerCase()
        .includes(query)
    );

  searchSection.classList.remove("hidden");

  searchTitle.textContent =
    `Results for "${searchInput.value.trim()}"`;

  searchResults.innerHTML =
    results
      .map(dramaCard)
      .join("");

  noResults.classList.toggle(
    "hidden",
    results.length !== 0
  );
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


/* =====================================================
   CLICK HANDLER
   ===================================================== */

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


  const playButton =
    event.target.closest(".play-button");

  if (playButton) {

    playEpisode(
      playButton.dataset.videoId,
      playButton.dataset.episode,
      playButton.dataset.drama
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

      return;
    }


    if (action === "home") {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }


    if (action === "show-all") {

      renderAll();

      return;
    }


    if (action === "back-to-episodes") {

      const title =
        document.querySelector(
          "#details-title"
        );

      if (title) {

        const drama =
          dramas.find(
            item =>
              item.title ===
              title.textContent
          );

        if (drama) {
          openDrama(drama.id);
        }
      }

      return;
    }
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
  }

});


/* =====================================================
   KEYBOARD
   ===================================================== */

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    closeModal();
  }

});


/* =====================================================
   AUTH STATE
   ===================================================== */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (
      event === "SIGNED_IN" &&
      session
    ) {

      showApp();
    }

    if (event === "SIGNED_OUT") {

      showLogin();
    }

  }
);


/* =====================================================
   START
   ===================================================== */

checkSession();
