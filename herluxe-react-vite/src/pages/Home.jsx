import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../resources/mockStore";

export default function Home() {
  const products = getProducts();
  const [newsletter, setNewsletter] = useState(false);

  return (
    <div className="page home-page">
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="hero" id="new-arrivals">
          <div className="hero-copy">
            <p className="eyebrow">New season · Soft focus beauty</p>
            <h1>
              Feel good in<br />
              <em>your own skin.</em>
            </h1>
            <p className="hero-description">
              Curated makeup and skincare essentials that bring out your natural
              glow — without asking you to be anyone else.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#makeup">
                Shop the edit <i className="fa-solid fa-arrow-right"></i>
              </a>
              <Link className="text-link" to="/about">
                Our story <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </Link>
            </div>
            <div className="hero-notes">
              <span>
                <i className="fa-solid fa-check"></i> Skin-loving formulas
              </span>
              <span>
                <i className="fa-solid fa-check"></i> Thoughtfully selected
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-art-glow"></div>
            <div className="hero-stamp">
              HER<br />LUXE
            </div>
            <div className="hero-image-frame">
              <img
                src="/images/display.png"
                alt="HerLuxe featured beauty product"
              />
            </div>
            <div className="hero-product-note">
              <span>01 / 04</span>
              <strong>
                Everyday<br />
                radiance
              </strong>
              <small>Makeup edit</small>
            </div>
            <div className="hero-float-card">
              <span>Editor's pick</span>
              <strong>
                Rose veil<br />
                cream blush
              </strong>
              <b>$24.00</b>
            </div>
          </div>
        </section>

        {/* BRAND STRIP */}
        <section className="brand-strip">
          <div>
            <i className="fa-solid fa-leaf"></i>
            <span>
              Clean beauty<br />
              <small>made simple</small>
            </span>
          </div>
          <div>
            <i className="fa-solid fa-sparkles"></i>
            <span>
              Small rituals<br />
              <small>big confidence</small>
            </span>
          </div>
          <div>
            <i className="fa-solid fa-box-open"></i>
            <span>
              Carefully packed<br />
              <small>with love</small>
            </span>
          </div>
          <div>
            <i className="fa-solid fa-heart"></i>
            <span>
              Made for you<br />
              <small>every single day</small>
            </span>
          </div>
        </section>

        {/* MAKEUP SECTION */}
        <section className="section-shell collection-section" id="makeup">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The edit</p>
              <h2>
                Little luxuries,<br />
                <em>made for every day.</em>
              </h2>
            </div>
            <Link className="text-link" to="/products">
              View all products <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* SKINCARE FEATURE SECTION */}
        <section className="feature-band" id="skincare">
          <div className="feature-image">
            <img src="/images/staff.png" alt="HerLuxe beauty ritual" />
          </div>
          <div className="feature-copy">
            <p className="eyebrow">A better beauty ritual</p>
            <h2>
              Your skin,<br />
              <em>your softest statement.</em>
            </h2>
            <p>
              Start with the basics. Keep what works. Make room for the little
              moments that help you feel like yourself.
            </p>
            <Link className="button button-outline" to="/about">
              Discover HerLuxe
            </Link>
            <div className="feature-stat">
              <strong>100%</strong>
              <span>
                made to fit into<br />
                real life
              </span>
            </div>
          </div>
        </section>

        {/* BEST SELLERS SECTION */}
        <section className="section-shell best-sellers" id="best-sellers">
          <div className="section-heading centered">
            <div>
              <p className="eyebrow">Loved by you</p>
              <h2>Best sellers</h2>
            </div>
            <p className="section-caption">
              The pieces our community reaches for<br />
              again and again.
            </p>
          </div>
          <div className="best-seller-layout">
            <div className="editorial-tile">
              <span className="editorial-number">02</span>
              <p>
                Beauty is not<br />
                <em>one-size-fits-all.</em>
              </p>
              <Link to="/about">
                Read our philosophy <i className="fa-solid fa-arrow-up-right"></i>
              </Link>
            </div>
            <div className="mini-product-list">
              {products.slice(4, 7).map((product, index) => (
                <Link
                  className="mini-product"
                  key={product.id}
                  to={`/products?id=${product.id}`}
                >
                  <div
                    className={`mini-product-art art-${
                      ["one", "two", "three"][index]
                    }`}
                  >
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div>
                    <p>{product.category}</p>
                    <h3>{product.name}</h3>
                    <span>
                      {product.shortDescription} · ${product.price}
                    </span>
                  </div>
                  <span className="mini-plus">
                    <i className="fa-solid fa-plus"></i>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTE SECTION */}
        <section className="quote-section">
          <div className="quote-mark">“</div>
          <blockquote>
            Beauty should feel like a small, beautiful thing you do for
            yourself.
          </blockquote>
          <p>— HerLuxe journal</p>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="newsletter-section" id="bag">
          <div>
            <p className="eyebrow">Stay in the glow</p>
            <h2>
              Notes from<br />
              <em>HerLuxe.</em>
            </h2>
          </div>
          <div>
            <p>
              New launches, beauty notes and a little more softness in your
              inbox.
            </p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                setNewsletter(true);
              }}
            >
              <input
                type="email"
                placeholder="Your email address"
                required
              />
              <button type="submit">
                {newsletter ? (
                  "You’re on the list"
                ) : (
                  <>
                    Join us <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
            <small>By subscribing, you agree to receive HerLuxe updates.</small>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}