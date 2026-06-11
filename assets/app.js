const root = document.getElementById("root");

if (root) {
  root.innerHTML = `
    <main class="fallback">
      <h1>Cathie Wood ARK Tracker</h1>
      <p>
        The static shell is loading, but the built React assets have not been published to the root GitHub Pages source yet.
        Run the Deploy GitHub Pages workflow, or switch Pages build source to GitHub Actions.
      </p>
    </main>
  `;
}
