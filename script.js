const SUPABASE_URL = "https://njutjrrlzvtcaiqarlfp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CvfbSLnl7lqfu2W3lArZTg_vWdCR-sh";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Checking your login...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Wrong email or password ❤️";
    return;
  }

  loginMessage.textContent = "Login successful ❤️";

  // Temporary message for testing.
  // We will replace this with the Drama Hub in the next step.
  setTimeout(() => {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        padding:20px;
        font-family:Arial,sans-serif;
        background:#160c1f;
        color:white;
      ">
        <div>
          <div style="font-size:60px;">❤️</div>
          <h1>Welcome to your Drama World</h1>
          <p style="margin-top:12px;color:#ccc;">
            Login successful! 🎬
          </p>
        </div>
      </div>
    `;
  }, 500);
});
