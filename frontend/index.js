/* ============================================================
   CARREGAR CARDÁPIO REAL DA API
   ============================================================ */
const API_URL_LP = 'http://localhost:8080';

// Mapeia o id da categoria do banco -> data-cat usado nos pills da LP
const CAT_MAP = { 1: 'burguer', 2: 'combo', 3: 'porcao', 4: 'bebida' };

function resolverFotoLP(foto) {
  if (!foto) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85';
  if (foto.startsWith('http')) return foto;
  if (foto.startsWith('/uploads')) return API_URL_LP + foto;
  return foto;
}

function formatarPrecoLP(preco) {
  return 'R$ ' + Number(preco).toFixed(2).replace('.', ',');
}

async function carregarCardapioLP() {
  const carousel = document.getElementById('menuCarousel');
  if (!carousel) return;

  try {
    const resp = await fetch(`${API_URL_LP}/produtos`);
    if (!resp.ok) throw new Error('Falha ao buscar produtos');
    const produtos = await resp.json();

    if (!produtos.length) {
      carousel.innerHTML = '<div class="empty-state">Cardápio em atualização. Peça pelo WhatsApp!</div>';
      return;
    }

    carousel.innerHTML = produtos.map(p => {
      const catId = p.categoria ? p.categoria.id : null;
      const dataCat = CAT_MAP[catId] || 'burguer';
      const foto = resolverFotoLP(p.foto);
      const desc = p.descricao || '';
      return `
        <article class="menu-card" data-cat="${dataCat}">
          <div class="img-wrap">
            <div class="img" style="background-image: url('${foto}');"></div>
          </div>
          <div class="body">
            <h3>${p.nome}</h3>
            <p>${desc}</p>
            <div class="row">
              <span class="price">${formatarPrecoLP(p.preco)}</span>
              <a href="https://wa.me/5541997096628" target="_blank" rel="noopener" class="order-btn">
                Pedir
                <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </article>`;
    }).join('');

    // Aplica o filtro inicial: mostra só a categoria do pill ativo (burguer)
    const ativo = document.querySelector('.cat-pill.active');
    if (ativo) {
      const cat = ativo.dataset.cat;
      carousel.querySelectorAll('.menu-card').forEach(c => {
        c.style.display = (c.dataset.cat === cat) ? '' : 'none';
      });
    }
    initMenuCarousel();
  } catch (err) {
    console.error('Erro ao carregar cardápio:', err);
    carousel.innerHTML = '<div class="empty-state">Não foi possível carregar o cardápio. Verifique se o servidor está rodando.</div>';
  }
}

// Carrega assim que a página abre
carregarCardapioLP();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Lenis smooth scroll */
    let lenis;
    if (typeof Lenis !== 'undefined' && !reduced) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
      });
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    }

    /* GSAP setup */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* Nav scroll state */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 24) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });

    /* Split words into letters once for letter-physics animation */
    (function splitLetters() {
      document.querySelectorAll('.hero-headline .word').forEach(w => {
        // Skip if already has nested elements (e.g. accent span, hl-circle, hl-under)
        if (w.querySelector('span')) {
          // For words containing children, split text content of children too
          const accent = w.querySelector('.accent');
          if (accent) {
            const txt = accent.textContent;
            accent.innerHTML = '';
            [...txt].forEach(ch => {
              const sp = document.createElement('span');
              sp.className = 'ltr';
              sp.textContent = ch === ' ' ? ' ' : ch;
              accent.appendChild(sp);
            });
          }
          return;
        }
        const txt = w.textContent;
        w.innerHTML = '';
        [...txt].forEach(ch => {
          const sp = document.createElement('span');
          sp.className = 'ltr';
          sp.textContent = ch === ' ' ? ' ' : ch;
          w.appendChild(sp);
        });
      });
    })();

    /* Hero entrance */
    function kickHero() {
      if (typeof gsap === 'undefined' || reduced) {
        document.querySelectorAll('.hero-headline .ltr').forEach(l => { l.style.opacity = 1; l.style.transform = 'none'; });
        ['heroEyebrow','heroSub','heroCtas','heroMeta','heroImage'].forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.style.opacity = 1; el.style.transform = 'none'; }
        });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.7 }, 0)
        .to('.hero-headline .ltr', {
          y: 0, opacity: 1, rotation: 0,
          duration: 0.9,
          stagger: { each: 0.018, from: 'start' },
          ease: 'power3.out'
        }, 0.1)
        .from('#heroImage', { scale: 0.96, y: 24 }, 0.15)
        .to('#heroImage', { opacity: 1, scale: 1, rotation: -2, duration: 1.0, ease: 'power2.out' }, 0.15)
        .to('#heroSub', { opacity: 1, y: 0, duration: 0.7 }, 0.7)
        .to('#heroCtas', { opacity: 1, y: 0, duration: 0.7 }, 0.85)
        .to('#heroMeta', { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 1.0)
        .add(() => {
          document.getElementById('hlCircle')?.classList.add('in');
          document.getElementById('hlUnder')?.classList.add('in');
        }, 1.4);
    }

    window.addEventListener('load', () => {
      // Hide preloader after load
      setTimeout(() => {
        document.getElementById('preloader')?.classList.add('gone');
        kickHero();
      }, 1400);
    });

    /* Scroll reveals */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduced) {

      // About image — simple fade + slight scale
      gsap.fromTo('#aboutImage',
        { opacity: 0, scale: 0.98, y: 18 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#aboutImage', start: 'top 85%', once: true }
        }
      );
      gsap.fromTo('#aboutImage .img', { y: -16 }, {
        y: 16, ease: 'none',
        scrollTrigger: { trigger: '#aboutImage', start: 'top bottom', end: 'bottom top', scrub: 1.4 }
      });
      // (idle rotation removed — only mouse parallax remains)

      // Menu cards — gentle fade-in stagger when carousel enters viewport
      ScrollTrigger.create({
        trigger: '#menuCarousel',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.menu-carousel .menu-card',
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }
          );
        }
      });

      // Reviews — entrance fade-in for head + stage (cards animate continuously via RAF, see initReviewsScroll)
      ScrollTrigger.create({
        trigger: '#reviewsHead',
        start: 'top 88%',
        once: true,
        onEnter: () => document.getElementById('reviewsHead')?.classList.add('in')
      });
      ScrollTrigger.create({
        trigger: '#reviewsStage',
        start: 'top 90%',
        once: true,
        onEnter: () => document.getElementById('reviewsStage')?.classList.add('in')
      });

      // (phone scroll parallax removed — now using CSS keyframes for continuous float)

      // Section heading words reveal
      gsap.utils.toArray('.section-head h2').forEach(h => {
        gsap.fromTo(h, { y: 14, opacity: 0 }, {
          y: 0, opacity: 1,
          duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: h, start: 'top 88%', once: true }
        });
      });
      gsap.utils.toArray('.section-head p, .section-head .eyebrow').forEach(p => {
        gsap.fromTo(p, { y: 10, opacity: 0 }, {
          y: 0, opacity: 1,
          duration: 0.6, delay: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: p, start: 'top 90%', once: true }
        });
      });

      // About text features stagger
      gsap.utils.toArray('.about-text .feature').forEach((f, i) => {
        gsap.fromTo(f, { y: 12, opacity: 0 }, {
          y: 0, opacity: 1,
          duration: 0.6, delay: i * 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: f, start: 'top 92%', once: true }
        });
      });

      // Hero handdrawn highlights when in view
      ScrollTrigger.create({
        trigger: '#hlCircle',
        start: 'top 90%',
        once: true,
        onEnter: () => document.getElementById('hlCircle')?.classList.add('in')
      });
    }

    /* Menu carousel — auto-advance + filter */
    function initMenuCarousel() {
      const carousel = document.getElementById('menuCarousel');
      if (!carousel) return;
      const cards = carousel.querySelectorAll('.menu-card');
      const prev = document.getElementById('cwPrev');
      const next = document.getElementById('cwNext');
      const pills = document.querySelectorAll('.cat-pill');

      function getStep() {
        const card = [...cards].find(c => c.style.display !== 'none');
        if (!card) return 320;
        const cs = getComputedStyle(carousel);
        const gap = parseFloat(cs.gap) || 24;
        return card.offsetWidth + gap;
      }

      function scrollNext() {
        const max = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft >= max - 10) {
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carousel.scrollBy({ left: getStep(), behavior: 'smooth' });
        }
      }
      function scrollPrev() {
        if (carousel.scrollLeft <= 10) {
          carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
        } else {
          carousel.scrollBy({ left: -getStep(), behavior: 'smooth' });
        }
      }

      prev?.addEventListener('click', () => { scrollPrev(); resetAuto(); });
      next?.addEventListener('click', () => { scrollNext(); resetAuto(); });

      // Auto-advance
      let auto;
      function startAuto() { if (!reduced) auto = setInterval(scrollNext, 4500); }
      function stopAuto() { if (auto) clearInterval(auto); }
      function resetAuto() { stopAuto(); startAuto(); }
      startAuto();

      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);
      carousel.addEventListener('touchstart', stopAuto, { passive: true });

      // Filter by category
      pills.forEach(p => {
        p.addEventListener('click', () => {
          pills.forEach(o => o.classList.remove('active'));
          p.classList.add('active');
          const cat = p.dataset.cat || 'all';
          let visibleCount = 0;
          cards.forEach(c => {
            const match = (cat === 'all' || c.dataset.cat === cat);
            c.style.display = match ? '' : 'none';
            if (match) visibleCount++;
          });
          // Empty state placeholder
          let empty = carousel.querySelector('.empty-state');
          if (visibleCount === 0) {
            if (!empty) {
              empty = document.createElement('div');
              empty.className = 'empty-state';
              empty.textContent = 'Nada nessa categoria por aqui — pede pelo WhatsApp que tem mais.';
              carousel.appendChild(empty);
            }
          } else if (empty) {
            empty.remove();
          }
          // Replay stagger animation
          carousel.classList.remove('filtering');
          void carousel.offsetWidth;
          carousel.classList.add('filtering');
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
          resetAuto();
        });
      });
    }

    /* Anchor smooth scroll */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
          else {
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });

    /* Burger assembly — pieces falling stagger */
    (function () {
      const stage = document.getElementById('assemblyStage');
      const pieces = document.querySelectorAll('.piece');
      const list = document.getElementById('assemblyList');
      if (!stage || !pieces.length) return;

      function trigger() {
        pieces.forEach(p => {
          const delay = parseFloat(p.dataset.delay || 0);
          setTimeout(() => p.classList.add('in'), delay * 1000);
        });
        if (list) {
          list.querySelectorAll('li').forEach((li, i) => {
            setTimeout(() => {
              li.style.transition = 'opacity 0.6s var(--ease), transform 0.6s var(--ease)';
              li.style.opacity = '1';
              li.style.transform = 'translateX(0)';
            }, 200 + i * 120);
          });
        }
      }

      if (typeof IntersectionObserver !== 'undefined' && !reduced) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              trigger();
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.3 });
        obs.observe(stage);
      } else {
        pieces.forEach(p => p.classList.add('in'));
        if (list) list.querySelectorAll('li').forEach(li => { li.style.opacity = '1'; li.style.transform = 'none'; });
      }
    })();

    /* Confetti burst on primary CTA click */
    (function () {
      if (reduced) return;
      const colors = ['#C5392B', '#F09030', '#F7B83A', '#2B1410', '#FFF8EB'];
      function burst(x, y) {
        const num = 14;
        for (let i = 0; i < num; i++) {
          const piece = document.createElement('div');
          piece.className = 'confetti-piece';
          const size = 6 + Math.random() * 10;
          const isCircle = Math.random() < 0.4;
          piece.style.width = size + 'px';
          piece.style.height = size + 'px';
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.borderRadius = isCircle ? '50%' : (Math.random() < 0.5 ? '4px' : '0');
          piece.style.left = x + 'px';
          piece.style.top = y + 'px';
          document.body.appendChild(piece);

          const angle = (Math.PI * 2 * i) / num + (Math.random() - 0.5) * 0.5;
          const velocity = 200 + Math.random() * 250;
          const dx = Math.cos(angle) * velocity;
          const dy = Math.sin(angle) * velocity - 100;
          const rot = (Math.random() - 0.5) * 720;

          if (typeof gsap !== 'undefined') {
            gsap.to(piece, {
              x: dx,
              y: dy,
              rotation: rot,
              duration: 1,
              ease: 'power2.out'
            });
            gsap.to(piece, {
              y: dy + 600,
              opacity: 0,
              duration: 1.2,
              delay: 0.6,
              ease: 'power1.in',
              onComplete: () => piece.remove()
            });
          } else {
            piece.style.transition = 'transform 1s ease-out, opacity 1s ease-in 0.4s';
            piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
            setTimeout(() => piece.remove(), 1500);
          }
        }
      }

      document.querySelectorAll('.btn-primary, .btn-orange').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const r = btn.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2);
        });
      });
    })();

    /* (follow emoji removed for cleaner feel) */

    /* Storytelling — sticky horizontal pin scroll */
    (function () {
      const pin = document.getElementById('storyPin');
      const track = document.getElementById('storyTrack');
      if (!pin || !track) return;
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduced) {
        // fallback: native scroll
        pin.style.height = 'auto';
        pin.style.overflowX = 'auto';
        return;
      }
      const steps = pin.querySelectorAll('.story-step');
      const progDots = document.querySelectorAll('#storyProg span');
      function setupStory() {
        const distance = track.scrollWidth - window.innerWidth + 100;
        if (distance <= 0) return;
        const tl = gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${distance + 200}`,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
              steps.forEach((s, i) => s.classList.toggle('active', i === idx));
              progDots.forEach((d, i) => d.classList.toggle('active', i === idx));
            }
          }
        });
      }
      setTimeout(setupStory, 250);
      window.addEventListener('resize', () => ScrollTrigger.refresh());
    })();

    /* Stars drawing on view */
    if (typeof IntersectionObserver !== 'undefined' && !reduced) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('.stars-svg').forEach(el => obs.observe(el));
    } else {
      document.querySelectorAll('.stars-svg').forEach(el => el.classList.add('in'));
    }

    /* Blur-to-sharp reveal */
    if (typeof IntersectionObserver !== 'undefined' && !reduced) {
      const blurObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            blurObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('.blur-in').forEach(el => blurObs.observe(el));
    } else {
      document.querySelectorAll('.blur-in').forEach(el => el.classList.add('in'));
    }

    /* Menu card cursor-position glow tracking */
    (function () {
      const isFine = window.matchMedia('(pointer: fine)').matches;
      if (!isFine || reduced) return;
      document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      });
    })();

    /* Scroll spy nav */
    (function () {
      const links = document.querySelectorAll('.nav-links a[href^="#"]');
      if (!links.length) return;
      const map = new Map();
      links.forEach(a => {
        const id = a.getAttribute('href').slice(1);
        const sec = document.getElementById(id);
        if (sec) map.set(sec, a);
      });
      const sections = [...map.keys()];
      function update() {
        const sy = window.scrollY + 120;
        let active = null;
        for (const s of sections) {
          if (s.offsetTop <= sy) active = s;
        }
        links.forEach(a => a.classList.remove('active'));
        if (active && map.get(active)) map.get(active).classList.add('active');
      }
      window.addEventListener('scroll', update, { passive: true });
      if (lenis) lenis.on('scroll', update);
      update();
    })();

    /* Number ticker (about) */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduced) {
      document.querySelectorAll('.ticker-num[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        const obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              v: target, duration: 1.6, ease: 'power3.out',
              onUpdate() { el.textContent = Math.round(obj.v); }
            });
          }
        });
      });
    }

    /* Mobile menu (burger) */
    (function () {
      const burger = document.getElementById('navBurger');
      const drawer = document.getElementById('navMobile');
      if (!burger || !drawer) return;
      function toggle(open) {
        const isOpen = open ?? burger.getAttribute('aria-expanded') !== 'true';
        burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) drawer.removeAttribute('hidden');
        else drawer.setAttribute('hidden', '');
      }
      burger.addEventListener('click', () => toggle());
      drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    })();

    /* Reviews — 3 vertical columns, infinite RAF scroll (keelon-style) */
    (function initReviewsScroll() {
      const stage = document.getElementById('reviewsStage');
      if (!stage || reduced) return;
      const cols = [...stage.querySelectorAll('.reviews-col')];

      const animators = cols.map(col => {
        const list = col.querySelector('.reviews-list');
        const speed = parseFloat(col.dataset.speed) || 30; // px/s (negative = up, positive = down)
        // Clone children once for seamless loop
        [...list.children].forEach(child => list.appendChild(child.cloneNode(true)));
        const state = { y: 0, list, speed, halfHeight: 0 };
        const measure = () => {
          state.halfHeight = list.scrollHeight / 2;
          state.y = speed < 0 ? 0 : -state.halfHeight;
        };
        measure();
        return { state, measure };
      });

      let last = performance.now();
      let visible = true;

      const io = new IntersectionObserver(([e]) => visible = e.isIntersecting, { threshold: 0.05 });
      io.observe(stage);

      function tick(now) {
        const dt = Math.min(80, now - last) / 1000;
        last = now;
        if (visible) {
          animators.forEach(({ state }) => {
            state.y += state.speed * dt;
            if (state.speed > 0 && state.y >= 0) state.y -= state.halfHeight;
            else if (state.speed < 0 && state.y <= -state.halfHeight) state.y += state.halfHeight;
            state.list.style.transform = `translate3d(0, ${state.y.toFixed(2)}px, 0)`;
          });
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => animators.forEach(a => a.measure()), 150);
      });
    })();

    /* Menu card flip toggle */
    document.querySelectorAll('.flip-cue').forEach(cue => {
      cue.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cue.closest('.menu-card')?.classList.toggle('flipped');
      });
    });

    /* Scroll progress bar */
    (function () {
      const bar = document.getElementById('scrollProg');
      if (!bar) return;
      function update() {
        const h = document.documentElement;
        const pct = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
      }
      window.addEventListener('scroll', update, { passive: true });
      if (lenis) lenis.on('scroll', update);
      update();
    })();

    /* Hero strip = pure CSS infinite marquee, no JS needed */

    /* Magnetic buttons (desktop only) */
    (function () {
      const isFine = window.matchMedia('(pointer: fine)').matches;
      if (!isFine || reduced) return;
      document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
      });
    })();

    /* Hero mouse parallax */
    (function () {
      const isFine = window.matchMedia('(pointer: fine)').matches;
      if (!isFine || reduced) return;
      const wrap = document.querySelector('.hero-image-wrap');
      const heroImg = document.getElementById('heroImage');
      const leaf = document.querySelector('.hero-image-wrap .floating-leaf');
      const tag = document.querySelector('.hero-image-wrap .price-tag');
      if (!wrap) return;
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        if (heroImg) heroImg.style.transform = `rotate(${-2 + x * 1.5}deg) scale(1) translate(${x * 6}px, ${y * 6}px)`;
        if (leaf) leaf.style.transform = `translate(${x * 18}px, ${y * 14}px) rotate(-15deg)`;
        if (tag) tag.style.transform = `rotate(${12 + x * 2}deg) translate(${x * -10}px, ${y * -8}px)`;
      });
    })();

    /* Counter animations on scroll */
    (function () {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduced) return;
      // hero meta — inject data-counts via JS for stable markup
      const meta = document.getElementById('heroMeta');
      if (!meta) return;
      const items = meta.querySelectorAll('.hero-meta-item strong');
      const targets = [4.9, 17];
      const formatters = [
        (v) => v.toFixed(1).replace('.', ','),
        (v) => Math.round(v) + 'h'
      ];
      items.forEach((el, i) => {
        const t = targets[i];
        if (typeof t === 'undefined') return;
        const obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 95%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              v: t,
              duration: 1.8,
              ease: 'power3.out',
              onUpdate() { el.textContent = formatters[i](obj.v); }
            });
          }
        });
      });
    })();

    /* Menu cards 3D tilt */
    (function () {
      const isFine = window.matchMedia('(pointer: fine)').matches;
      if (!isFine || reduced) return;
      document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    })();

    /* Floating circles parallax on scroll */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduced) {
      gsap.utils.toArray('.float-circle').forEach((el, i) => {
        gsap.to(el, {
          y: (i % 2 ? -120 : 120),
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
        });
      });

      // About features stagger (duplicate-safe — main definition above handles real entrance)
      gsap.utils.toArray('.about-text .feature').forEach((f, i) => {
        gsap.to(f, {
          opacity: 1, x: 0, y: 0,
          duration: 0.55, delay: i * 0.07, ease: 'power2.out',
          scrollTrigger: { trigger: f, start: 'top 92%', once: true }
        });
      });

      // Hand-drawn underlines on additional spots
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
      }, { threshold: 0.4 });
      document.querySelectorAll('.hl-mini').forEach(el => observer.observe(el));
    }