(function () {
  const el = document.getElementById("deploy-info");
  if (!el) return;

  const branch = process.env.VERCEL_GIT_COMMIT_REF || "unknown";
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || "unknown";

  const short = commit.slice(0, 7);
  el.textContent = `branch: ${branch} · commit: ${short}`;
  el.title = commit;
})();

