async function checkAuth() {
  const res = await fetch("/api/auth/me", {
    credentials: "include"
  });

  if (!res.ok) {
    window.location.href = "/login.html";
  }
}

async function startYouTube() {
  const res = await fetch("/api/youtube-start", {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();
  alert(JSON.stringify(data));
}

async function logout() {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include"
  });

  window.location.href = "/login.html";
}

document.getElementById("ytStart").addEventListener("click", startYouTube);
document.getElementById("logout").addEventListener("click", logout);

checkAuth();