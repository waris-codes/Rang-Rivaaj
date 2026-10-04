(function () {
  "use strict";

  const COLOURS = {
    teal:   { name: "Indus teal",    hex: "#0f7c80" },
    red:    { name: "Ajrak red",     hex: "#a4232e" },
    sand:   { name: "Thar sand",     hex: "#c9a66b" },
    green:  { name: "Mehndi green",  hex: "#5b7f2b" },
    brown:  { name: "Chai brown",    hex: "#7a4b2a" },
    orange: { name: "Kinnow orange", hex: "#e8791c" }
  };
  const ADULT = ["S", "M", "L", "XL"];
  const KIDS = ["2-3Y", "4-5Y", "6-7Y", "8-9Y"];
  const DELIVERY = 250;
  const FREE_OVER = 5000;
  const CATS = ["All", "Men", "Women", "Kids"];

  const P = (id, name, cat, price, colour, type, sizes, rating, reviews, desc) =>
    ({ id, name, cat, price, colour, type, sizes, rating, reviews, desc, image: "images/" + id + ".jpg" });

  const PRODUCTS = [
    P(1, "Indus Kurta", "Men", 4200, "teal", "kurta", ADULT, 4.7, 42, "A straight-cut cotton kurta with a short button placket. Light enough for Karachi summers and easy to dress up for Eid."),
    P(2, "Thar Tee", "Men", 1800, "sand", "tee", ADULT, 4.5, 63, "A relaxed everyday t-shirt in soft combed cotton. Pairs with jeans or a shalwar."),
    P(3, "Ajrak Hoodie", "Men", 4800, "red", "hoodie", ADULT, 4.8, 29, "A mid-weight hoodie with a kangaroo pocket and drawstring hood, in a deep ajrak red."),
    P(4, "Mehndi Kurti", "Women", 3600, "green", "kurta", ADULT, 4.6, 51, "A straight kurti with a buttoned neckline, cut for comfort through a long day."),
    P(5, "Chai Dupatta", "Women", 2400, "brown", "dupatta", ["One size"], 4.4, 18, "A lightweight dupatta in a warm chai brown that goes with most kurtis. About 2.5 m long."),
    P(6, "Kinnow Tee", "Women", 1900, "orange", "tee", ADULT, 4.6, 37, "A bright, easy-fit t-shirt in soft cotton. The colour of a Sargodha kinnow."),
    P(7, "Little Indus Kurta", "Kids", 2200, "teal", "kurta", KIDS, 4.9, 24, "A kids' kurta with a button front and room to grow. Soft cotton that survives the playground."),
    P(8, "Sprout Hoodie", "Kids", 2900, "green", "hoodie", KIDS, 4.7, 16, "A warm kids' hoodie with a front pocket. Easy to pull on, easy to wash."),
    P(9, "Sindhri Kurta", "Men", 3900, "orange", "kurta", ADULT, 4.5, 21, "A summer kurta in a mango-orange shade. Breathable cotton with a classic collarless neck."),
    P(10, "Sea Breeze Hoodie", "Women", 4500, "teal", "hoodie", ADULT, 4.8, 33, "A cosy hoodie in Indus teal for cool evenings by the sea."),
    P(11, "Ajrak Dupatta", "Women", 2800, "red", "dupatta", ["One size"], 4.7, 27, "A statement dupatta in ajrak red. Adds colour to a plain kurti."),
    P(12, "Thar Kids Tee", "Kids", 1400, "sand", "tee", KIDS, 4.6, 40, "A simple kids' t-shirt in a sandy shade. Soft on the skin, easy to wash.")
  ];

  const SIZE_GUIDE = {
    adult: { head: ["Size", "Chest (in)", "Length (in)"], rows: [["S", "36-38", "27"], ["M", "38-40", "28"], ["L", "40-42", "29"], ["XL", "42-44", "30"]] },
    kids: { head: ["Size", "Height (cm)"], rows: [["2-3Y", "92-104"], ["4-5Y", "104-116"], ["6-7Y", "116-128"], ["8-9Y", "128-140"]] }
  };

  const $ = (id) => document.getElementById(id);
  const app = $("app");
  const money = (n) => "Rs " + n.toLocaleString("en-PK");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const load = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };

  const state = { cat: "All", colour: null, sort: "featured", q: "", heroColour: "teal", wishOnly: false };
  let cart = load("rr-cart").filter((l) => byId(l.id));
  let wish = load("rr-wish").filter((id) => byId(id));
  let pdp = { id: null, size: null, qty: 1 };
  let drawerView = "cart";
  let lastOrder = null;
  let toastTimer = null;

  function garment(type, hex) {
    let body = "";
    if (type === "tee") {
      body = '<path d="M62 30 L86 20 Q100 38 114 20 L138 30 L178 70 L154 96 L140 84 L140 214 L60 214 L60 84 L46 96 L22 70 Z" fill="currentColor"/><path d="M86 20 Q100 38 114 20" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3"/>';
    } else if (type === "hoodie") {
      body = '<path d="M60 38 L84 28 Q100 46 116 28 L140 38 L180 80 L156 106 L142 92 L142 218 L58 218 L58 92 L44 106 L20 80 Z" fill="currentColor"/><path d="M78 30 Q100 6 122 30 Q100 56 78 30 Z" fill="rgba(0,0,0,.18)"/><path d="M72 150 L128 150 L136 190 L64 190 Z" fill="rgba(0,0,0,.14)"/><path d="M94 52 L94 84 M106 52 L106 84" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"/>';
    } else if (type === "kurta") {
      body = '<path d="M62 28 L86 18 Q100 36 114 18 L138 28 L172 66 L150 90 L138 78 L144 228 L56 228 L62 78 L50 90 L28 66 Z" fill="currentColor"/><path d="M100 36 L100 112" stroke="rgba(0,0,0,.25)" stroke-width="3"/><circle cx="100" cy="56" r="2.6" fill="rgba(255,255,255,.7)"/><circle cx="100" cy="76" r="2.6" fill="rgba(255,255,255,.7)"/><circle cx="100" cy="96" r="2.6" fill="rgba(255,255,255,.7)"/><path d="M56 228 L144 228" stroke="rgba(255,255,255,.35)" stroke-width="5"/>';
    } else {
      body = '<path d="M30 40 Q70 20 100 40 T170 40 L170 200 Q130 220 100 200 T30 200 Z" fill="currentColor"/><path d="M30 60 Q70 40 100 60 T170 60" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="4"/><path d="M30 184 Q70 164 100 184 T170 184" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="4"/>';
    }
    return '<svg viewBox="0 0 200 240" aria-hidden="true" style="color:' + hex + '">' + body + "</svg>";
  }

  function pic(p, cls) {
    const hex = COLOURS[p.colour].hex;
    return '<div class="' + (cls || "pic") + '" style="--c:' + hex + '">' + garment(p.type, hex) +
      '<img src="' + p.image + '" alt="' + esc(p.name) + '" loading="lazy"></div>';
  }
  document.addEventListener("error", (e) => { if (e.target && e.target.tagName === "IMG") e.target.remove(); }, true);

  function stars(r) { const n = Math.round(r); return "\u2605".repeat(n) + "\u2606".repeat(5 - n); }

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 1800);
  }

  function card(p) {
    const w = wish.includes(p.id);
    return '<article class="card"><a class="pic-link" href="#/product/' + p.id + '" aria-label="View ' + esc(p.name) + '">' + pic(p) + "</a>" +
      '<button class="heart" data-action="wish" data-id="' + p.id + '" aria-pressed="' + w + '" aria-label="' + (w ? "Remove " : "Add ") + esc(p.name) + (w ? " from" : " to") + ' wishlist">' + (w ? "\u2665" : "\u2661") + "</button>" +
      '<div class="body"><h3><a href="#/product/' + p.id + '">' + esc(p.name) + '</a></h3><div class="meta">' + p.cat + ", " + COLOURS[p.colour].name + '</div><div class="price">' + money(p.price) + "</div></div></article>";
  }

  /* ---------- Views ---------- */
  function homeView() {
    const c = COLOURS[state.heroColour];
    const sw = Object.keys(COLOURS).map((k) =>
      '<button class="sw" style="--c:' + COLOURS[k].hex + '" data-action="hero" data-k="' + k + '" aria-pressed="' + (state.heroColour === k) + '" aria-label="' + COLOURS[k].name + '"></button>').join("");
    const tiles = ["Men", "Women", "Kids"].map((cat, i) => {
      const hex = COLOURS[["teal", "green", "orange"][i]].hex;
      return '<button class="tile" style="--c:' + hex + '" data-action="cat" data-cat="' + cat + '"><h3>' + cat + "</h3><span>" + PRODUCTS.filter((p) => p.cat === cat).length + " styles</span></button>";
    }).join("");
    app.innerHTML =
      '<section class="hero"><div class="wrap hero-grid"><div>' +
      "<h1>Pick a colour. Wear it everywhere.</h1>" +
      '<p class="lede">Everyday clothing for men, women and kids, dyed in six colours from Sindh and the coast. Cash on delivery across Pakistan.</p>' +
      '<div class="swatches" role="group" aria-label="Choose a colour">' + sw + "</div>" +
      '<button class="btn" data-action="shop-colour" id="shopColour">Shop ' + c.name + "</button></div>" +
      '<div class="stage" id="stage" style="--c:' + c.hex + '">' + garment("kurta", c.hex) + '<span class="tag" id="stageTag">' + c.name + "</span></div></div></section>" +
      '<section class="section"><div class="wrap"><div class="section-head"><h2>Shop by category</h2></div><div class="tiles">' + tiles + "</div></div></section>" +
      '<section class="section"><div class="wrap"><div class="section-head"><h2>New arrivals</h2><a href="#/shop">See all clothing</a></div><div class="grid">' +
      PRODUCTS.slice(-4).map(card).join("") + "</div></div></section>" +
      '<section class="info"><div class="wrap"><div><h3>Cash on delivery</h3><p>Pay when your order arrives. No card needed.</p></div><div><h3>Delivery in 3 to 5 days</h3><p>Rs 250 flat. Free on orders above Rs 5,000.</p></div><div><h3>Easy size exchange</h3><p>Wrong size? Exchange it within 7 days.</p></div></div></section>';
    document.title = "Rang Rivaaj | Clothing Store";
  }

  function filtered() {
    const q = state.q.toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (!state.wishOnly || wish.includes(p.id)) &&
      (state.cat === "All" || p.cat === state.cat) &&
      (!state.colour || p.colour === state.colour) &&
      (!q || (p.name + " " + p.cat + " " + COLOURS[p.colour].name + " " + p.type).toLowerCase().includes(q)));
    if (state.sort === "low") list = list.slice().sort((a, b) => a.price - b.price);
    if (state.sort === "high") list = list.slice().sort((a, b) => b.price - a.price);
    return list;
  }

  function shopView() {
    const chips = CATS.map((c) => '<button class="chip" data-action="chip" data-cat="' + c + '" aria-pressed="' + (state.cat === c) + '">' + c + "</button>").join("");
    app.innerHTML =
      '<div class="wrap section"><div class="shop-head"><h1>' + (state.wishOnly ? "Your wishlist" : "Shop") + '</h1><div class="controls">' + chips + "</div>" +
      '<select class="sort" id="sort" aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>' +
      '<div class="notes" id="notes"></div><div class="grid" id="grid"></div></div>';
    $("sort").value = state.sort;
    renderGrid();
    document.title = (state.wishOnly ? "Wishlist" : "Shop") + " | Rang Rivaaj";
  }

  function renderGrid() {
    const grid = $("grid"); if (!grid) return;
    const notes = [];
    if (state.colour) notes.push('<span><i class="dot" style="--c:' + COLOURS[state.colour].hex + '"></i>' + COLOURS[state.colour].name + ' <button data-action="clear-colour">Clear</button></span>');
    if (state.q) notes.push('<span>Results for "' + esc(state.q) + '" <button data-action="clear-search">Clear</button></span>');
    $("notes").innerHTML = notes.join("");
    document.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === state.cat)));
    const list = filtered();
    if (!list.length) {
      grid.innerHTML = '<p class="empty">' + (state.wishOnly && !wish.length ? "Your wishlist is empty. Tap the heart on any item to save it here." : "No items match. Try another category, colour or search.") + "</p>";
      return;
    }
    grid.innerHTML = list.map(card).join("");
  }

  function productView(id) {
    const p = byId(id);
    if (!p) return notFound();
    pdp = { id: p.id, size: p.sizes.length === 1 ? p.sizes[0] : null, qty: 1 };
    const c = COLOURS[p.colour], w = wish.includes(p.id);
    const guide = p.type === "dupatta" ? null : (p.cat === "Kids" ? SIZE_GUIDE.kids : SIZE_GUIDE.adult);
    const guideHtml = guide
      ? "<table><thead><tr>" + guide.head.map((h) => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" + guide.rows.map((r) => "<tr>" + r.map((x) => "<td>" + x + "</td>").join("") + "</tr>").join("") + "</tbody></table><p>Measurements are approximate. Between sizes? Choose the larger one.</p>"
      : "<p>One size, about 2.5 m long and 1 m wide.</p>";
    const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    app.innerHTML =
      '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/shop" data-action="crumb-cat" data-cat="' + p.cat + '">' + p.cat + "</a> / " + esc(p.name) + "</nav>" +
      '<div class="pdp"><div>' + pic(p) + "</div><div>" +
      "<h1>" + esc(p.name) + '</h1><div class="rating"><b aria-hidden="true">' + stars(p.rating) + "</b> " + p.rating.toFixed(1) + " (" + p.reviews + " sample reviews)</div>" +
      '<div class="price">' + money(p.price) + '</div><p class="desc">' + esc(p.desc) + "</p>" +
      '<p class="sub"><i class="dot" style="--c:' + c.hex + '"></i>' + c.name + "</p>" +
      '<div class="label"><span>Size</span></div><div class="sizes" role="group" aria-label="Choose a size">' +
      p.sizes.map((s) => '<button class="size" data-action="size" data-size="' + s + '" aria-pressed="' + (pdp.size === s) + '">' + s + "</button>").join("") + "</div>" +
      '<div class="err" id="sizeErr" role="alert"></div>' +
      '<div class="buy"><div class="qty"><button data-action="pdp-dec" aria-label="Decrease quantity">&minus;</button><span id="pdpQty" aria-live="polite">1</span><button data-action="pdp-inc" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn" data-action="add">Add to cart</button>' +
      '<button class="wish-btn" data-action="wish" data-id="' + p.id + '" aria-pressed="' + w + '" aria-label="' + (w ? "Remove from" : "Add to") + ' wishlist">' + (w ? "\u2665" : "\u2661") + "</button></div>" +
      '<div class="detail-acc"><details><summary>Size guide</summary>' + guideHtml + "</details>" +
      "<details><summary>Delivery and returns</summary><p>Delivery in 3 to 5 working days for Rs 250, free above Rs 5,000. Pay cash on delivery. Exchange your size within 7 days if the item is unworn.</p></details>" +
      "<details><summary>Care</summary><p>Machine wash cold with similar colours. Dry in the shade to keep the colour deep.</p></details></div>" +
      "</div></div>" +
      '<section class="section"><div class="section-head"><h2>You may also like</h2></div><div class="grid">' + related.map(card).join("") + "</div></section></div>";
    document.title = p.name + " | Rang Rivaaj";
  }

  function aboutView() {
    app.innerHTML = '<div class="wrap page"><h1>About Rang Rivaaj</h1>' +
      "<p>Rang Rivaaj started with a simple idea: everyday clothes should come in the colours people actually see around them. Our six shades are named after places and things from Sindh and the coast: the Indus, ajrak, the Thar desert, mehndi, chai and kinnow.</p>" +
      "<h2>What we make</h2><p>Kurtas, kurtis, t-shirts, hoodies and dupattas for men, women and kids. Simple cuts, soft cotton, and colours that last wash after wash.</p>" +
      '<h2>How we work</h2><p>Orders are confirmed by phone and delivered across Pakistan. You pay cash on delivery, and you can exchange your size within 7 days.</p>' +
      '<p><a class="btn" href="#/shop">Shop the collection</a></p></div>';
    document.title = "About | Rang Rivaaj";
  }

  function returnsView() {
    app.innerHTML = '<div class="wrap page"><h1>Delivery and returns</h1>' +
      "<h2>Delivery</h2><ul><li>Delivery takes 3 to 5 working days across Pakistan.</li><li>Delivery costs Rs 250. It is free on orders above Rs 5,000.</li><li>We call to confirm your address before dispatch.</li></ul>" +
      "<h2>Payment</h2><p>Cash on delivery. Please keep the exact amount ready if you can.</p>" +
      "<h2>Exchanges</h2><ul><li>Exchange your size within 7 days of delivery.</li><li>Items must be unworn, unwashed and have their tags attached.</li><li>Contact us first with your order number.</li></ul></div>";
    document.title = "Delivery and returns | Rang Rivaaj";
  }

  function contactView() {
    app.innerHTML = '<div class="wrap page"><h1>Contact us</h1><p>Questions about sizes, delivery or an order? Send us a message and we will reply within one working day.</p>' +
      '<div id="contactBox"><label class="field"><span>Your name</span><input id="cName" autocomplete="name"></label><div class="err" id="cNameErr"></div>' +
      '<label class="field"><span>Email</span><input id="cEmail" type="email" autocomplete="email"></label><div class="err" id="cEmailErr"></div>' +
      '<label class="field"><span>Message</span><textarea id="cMsg" rows="5"></textarea></label><div class="err" id="cMsgErr"></div>' +
      '<p><button class="btn" data-action="contact">Send message</button></p></div></div>';
    document.title = "Contact | Rang Rivaaj";
  }

  function notFound() {
    app.innerHTML = '<div class="wrap page"><h1>Page not found</h1><p>We could not find that page. It may have moved.</p><p><a class="btn" href="#/shop">Go to the shop</a></p></div>';
    document.title = "Not found | Rang Rivaaj";
  }

  /* ---------- Router ---------- */
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const name = parts[0] || "home";
    state.wishOnly = name === "wishlist";
    if (name === "home") homeView();
    else if (name === "shop" || name === "wishlist") shopView();
    else if (name === "product") productView(Number(parts[1]));
    else if (name === "about") aboutView();
    else if (name === "returns") returnsView();
    else if (name === "contact") contactView();
    else notFound();
    document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("data-nav") === name));
    window.scrollTo(0, 0);
  }
  function goShop() { if (location.hash === "#/shop") route(); else location.hash = "#/shop"; }
  window.addEventListener("hashchange", route);

  function updateCounts() {
    $("cartCount").textContent = cart.reduce((s, l) => s + l.qty, 0);
    $("wishCount").textContent = wish.length;
  }
  function toggleWish(id) {
    const i = wish.indexOf(id);
    if (i === -1) { wish.push(id); toast("Saved to wishlist"); } else { wish.splice(i, 1); toast("Removed from wishlist"); }
    save("rr-wish", wish); updateCounts();
    document.querySelectorAll('[data-action="wish"][data-id="' + id + '"]').forEach((b) => {
      const on = wish.includes(id);
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "\u2665" : "\u2661";
    });
    if (state.wishOnly) renderGrid();
  }
  function addToCart(id, size, qty) {
    const found = cart.find((l) => l.id === id && l.size === size);
    if (found) found.qty += qty; else cart.push({ id, size, qty });
    save("rr-cart", cart); updateCounts();
  }
  function totals() {
    const sub = cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
    const ship = sub === 0 || sub >= FREE_OVER ? 0 : DELIVERY;
    return { sub, ship, total: sub + ship };
  }
  function summaryHtml() {
    const t = totals();
    return '<div class="sum-row"><span>Subtotal</span><span>' + money(t.sub) + '</span></div><div class="sum-row"><span>Delivery</span><span>' + (t.ship ? money(t.ship) : "Free") + '</span></div><div class="sum-row total"><span>Total</span><span>' + money(t.total) + "</span></div>";
  }

  function renderDrawer() {
    const body = $("drawerBody"), foot = $("drawerFoot");
    if (drawerView === "cart") {
      $("drawerTitle").textContent = "Your cart";
      if (!cart.length) {
        body.innerHTML = '<p class="empty">Your cart is empty. Add something from the shop.</p>';
        foot.innerHTML = '<button class="btn ghost" data-action="keep">Keep shopping</button>';
        return;
      }
      body.innerHTML = cart.map((l, i) => {
        const p = byId(l.id);
        return '<div class="line-item">' + pic(p, "thumb") + '<div><div class="name">' + esc(p.name) + '</div><div class="sub">Size ' + esc(l.size) + ", " + money(p.price) + "</div>" +
          '<div class="qty"><button data-action="dec" data-i="' + i + '" aria-label="Decrease quantity">&minus;</button><span>' + l.qty + '</span><button data-action="inc" data-i="' + i + '" aria-label="Increase quantity">+</button></div></div>' +
          '<div><div class="name">' + money(p.price * l.qty) + '</div><button class="rm" data-action="rm" data-i="' + i + '">Remove</button></div></div>';
      }).join("");
      foot.innerHTML = summaryHtml() + '<button class="btn" data-action="checkout">Checkout</button>';
    } else if (drawerView === "checkout") {
      $("drawerTitle").textContent = "Delivery details";
      body.innerHTML =
        '<label class="field"><span>Full name</span><input id="fName" autocomplete="name"></label><div class="err" id="eName"></div>' +
        '<label class="field"><span>Mobile number</span><input id="fPhone" inputmode="tel" placeholder="03XX XXXXXXX" autocomplete="tel"></label><div class="err" id="ePhone"></div>' +
        '<label class="field"><span>City</span><input id="fCity" autocomplete="address-level2"></label><div class="err" id="eCity"></div>' +
        '<label class="field"><span>Full address</span><textarea id="fAddr" rows="3" autocomplete="street-address"></textarea></label><div class="err" id="eAddr"></div>' +
        '<p class="sub">Payment: cash on delivery.</p>';
      foot.innerHTML = summaryHtml() + '<button class="btn" data-action="place">Place order</button><button class="btn ghost" data-action="back">Back to cart</button>';
    } else {
      $("drawerTitle").textContent = "Order placed";
      body.innerHTML = '<div class="done"><h3>Thank you, ' + esc(lastOrder.name) + '.</h3><p>Your order number is <strong>' + lastOrder.no + "</strong> and it has been placed. Delivery to " + esc(lastOrder.city) + " usually takes 3 to 5 working days..</p></div>";
      foot.innerHTML = '<button class="btn" data-action="keep">Continue shopping</button>';
    }
  }
  function openDrawer(v) {
    drawerView = v || "cart"; renderDrawer();
    $("drawer").classList.add("on"); $("overlay").classList.add("on"); $("drawer").setAttribute("aria-hidden", "false");
    $("closeCart").focus();
  }
  function closeDrawer() {
    $("drawer").classList.remove("on"); $("overlay").classList.remove("on"); $("drawer").setAttribute("aria-hidden", "true");
    $("openCart").focus();
  }

  const setErr = (id, msg) => { $(id).textContent = msg; return !msg; };
  const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

  function placeOrder() {
    const name = $("fName").value.trim(), phone = $("fPhone").value.replace(/[\s-]/g, ""), city = $("fCity").value.trim(), addr = $("fAddr").value.trim();
    let ok = true;
    ok = setErr("eName", name ? "" : "Enter your full name.") && ok;
    ok = setErr("ePhone", /^03\d{9}$/.test(phone) ? "" : "Enter an 11-digit mobile number starting with 03.") && ok;
    ok = setErr("eCity", city ? "" : "Enter your city.") && ok;
    ok = setErr("eAddr", addr.length >= 10 ? "" : "Enter your full address (house, street, area).") && ok;
    if (!ok) return;
    lastOrder = { name, phone, city, no: "RR-" + Math.floor(100000 + Math.random() * 900000) };
    cart = []; save("rr-cart", cart); updateCounts();
    drawerView = "done"; renderDrawer();
  }
  function sendContact() {
    const n = $("cName").value.trim(), e = $("cEmail").value.trim(), m = $("cMsg").value.trim();
    let ok = true;
    ok = setErr("cNameErr", n ? "" : "Enter your name.") && ok;
    ok = setErr("cEmailErr", validEmail(e) ? "" : "Enter a valid email address.") && ok;
    ok = setErr("cMsgErr", m.length >= 10 ? "" : "Write at least a short sentence (10 characters).") && ok;
    if (!ok) return;
    $("contactBox").innerHTML = '<div class="ok"><strong>Thank you, ' + esc(n) + '.</strong>Your message has been received. We usually reply within one working day.</div>';
  }
  function newsletter() {
    const e = $("newsEmail").value.trim(), msg = $("newsMsg");
    if (!validEmail(e)) { msg.textContent = "Enter a valid email address."; return; }
    msg.textContent = "Thanks for signing up. You are on the list."; $("newsEmail").value = "";
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.getAttribute("data-action");
    const i = Number(el.getAttribute("data-i"));
    switch (a) {
      case "hero": {
        state.heroColour = el.getAttribute("data-k");
        const c = COLOURS[state.heroColour];
        document.querySelectorAll(".sw").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
        $("stage").style.setProperty("--c", c.hex);
        $("stage").querySelector("svg").outerHTML = garment("kurta", c.hex);
        $("stageTag").textContent = c.name; $("shopColour").textContent = "Shop " + c.name;
        break;
      }
      case "shop-colour": state.colour = state.heroColour; state.cat = "All"; state.q = ""; $("search").value = ""; goShop(); break;
      case "cat": state.cat = el.getAttribute("data-cat"); state.colour = null; goShop(); break;
      case "crumb-cat": state.cat = el.getAttribute("data-cat"); state.colour = null; break;
      case "chip": state.cat = el.getAttribute("data-cat"); renderGrid(); break;
      case "clear-colour": state.colour = null; renderGrid(); break;
      case "clear-search": state.q = ""; $("search").value = ""; renderGrid(); break;
      case "wish": toggleWish(Number(el.getAttribute("data-id"))); break;
      case "size":
        pdp.size = el.getAttribute("data-size"); $("sizeErr").textContent = "";
        document.querySelectorAll(".size").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
        break;
      case "pdp-inc": pdp.qty = Math.min(10, pdp.qty + 1); $("pdpQty").textContent = pdp.qty; break;
      case "pdp-dec": pdp.qty = Math.max(1, pdp.qty - 1); $("pdpQty").textContent = pdp.qty; break;
      case "add":
        if (!pdp.size) { $("sizeErr").textContent = "Choose a size first."; break; }
        addToCart(pdp.id, pdp.size, pdp.qty); toast("Added to cart"); break;
      case "inc": cart[i].qty = Math.min(10, cart[i].qty + 1); save("rr-cart", cart); updateCounts(); renderDrawer(); break;
      case "dec": cart[i].qty -= 1; if (cart[i].qty <= 0) cart.splice(i, 1); save("rr-cart", cart); updateCounts(); renderDrawer(); break;
      case "rm": cart.splice(i, 1); save("rr-cart", cart); updateCounts(); renderDrawer(); break;
      case "checkout": drawerView = "checkout"; renderDrawer(); break;
      case "back": drawerView = "cart"; renderDrawer(); break;
      case "keep": closeDrawer(); break;
      case "place": placeOrder(); break;
      case "contact": sendContact(); break;
      case "newsletter": newsletter(); break;
    }
  });
  document.addEventListener("change", (e) => { if (e.target.id === "sort") { state.sort = e.target.value; renderGrid(); } });
  $("search").addEventListener("input", (e) => {
    state.q = e.target.value.trim();
    if (!/^#\/(shop|wishlist)/.test(location.hash)) { state.cat = "All"; state.colour = null; location.hash = "#/shop"; } else renderGrid();
  });
  $("openCart").addEventListener("click", () => openDrawer("cart"));
  $("closeCart").addEventListener("click", closeDrawer);
  $("overlay").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  updateCounts();
  route();
})();
