// frontend/Navbar/navbar.js
// Reusable navbar loader for Record Vault pages
// Usage in any page:
//   1. Place <div id="navbar"></div> where you want the navbar.
//   2. Add <script src="../Navbar/navbar.js"></script> before </body>.

(function loadNavbar() {
  const mount = document.getElementById('navbar');
  if (!mount) return;

  fetch('../Navbar/navbar.html')
    .then(response => {
      if (!response.ok) throw new Error(`Navbar fetch error: ${response.status}`);
      return response.text();
    })
    .then(html => {
      mount.innerHTML = html;
      mount.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
      });
    })
    .catch(err => console.error('Navbar load failed:', err));
})();
