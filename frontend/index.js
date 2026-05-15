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
        if (w.querySelector('span')) {
          const accent = w.querySelector('.accent');
          if (accent) {
            const txt = accent.textContent;
            accent.innerHTML = '';
            [...txt].forEach(ch => {
              const sp = document.createElement('span');
              sp.className = 'ltr';
              sp.textContent = ch === ' ' ? ' ' : ch;
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
          sp.textContent = ch === ' ' ? ' ' : ch;
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
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to('#heroEyebrow', { opacity: 1, y: 0, duration: 1.2 }, 0)
        .to('.hero-headline .ltr', {
          y: 0, opacity: 1, rotation: 0,
          duration: 1.4,
          stagger: { each: 0.025, from: 'start' },
          ease: 'back.out(1.4)'
        }, 0.15)
        .from('#heroImage', { rotation: 14, scale: 0.5, y: 100 }, 0.3)
        .to('#heroImage', { opacity: 1, scale: 1, rotation: -2, duration: 1.8, ease: 'expo.out' }, 0.3)
        .to('#heroSub', { opacity: 1, y: 0, duration: 1.2 }, 1.6)
        .to('#heroCtas', { opacity: 1, y: 0, duration: 1.2 }, 1.8)
        .to('#heroMeta', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 2)
        .add(() => {
          document.getElementById('hlCircle')?.classList.add('in');
          document.getElementById('hlUnder')?.classList.add('in');
        }, 2.2);
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        document.getElementById('preloader')?.classList.add('gone');
        kickHero();
      }, 1400);
    });

    /* Scroll reveals */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduced) {

      gsap.fromTo('#aboutImage',
        { clipPath: 'circle(0% at 50% 50%)', scale: 0.92 },
        {
          clipPath: 'circle(75% at 50% 50%)', scale: 1,
          duration: 1.8, ease: 'expo.out',
          scrollTrigger: { trigger: '#aboutImage', start: 'top 85%', once: true }
        }
      );
      gsap.fromTo('#aboutImage .img', { y: -40 }, {
        y: 40, ease: 'none',
        scrollTrigger: { trigger: '#aboutImage', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });

      ScrollTrigger.create({
        trigger: '#menuCarousel',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.menu-carousel .menu-card',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }
          );
        }
      });

      gsap.utils.toArray('.review-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 1, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
          {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            duration: 1.4,
            delay: (i % 3) * 0.12,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 92%', once: true }
          }
        );
        gsap.fromTo(card.querySelectorAll('.quote, .author, .stars-svg'),
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 1.2,
            stagger: 0.08,
            delay: 0.4 + (i % 3) * 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 92%', once: true }
          }
        );
      });

      gsap.utils.toArray('.section-head h2').forEach(h => {
        gsap.fromTo(h, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1,
          duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: h, start: 'top 88%', once: true }
        });
      });
      gsap.utils.toArray('.section-head p, .section-head .eyebrow').forEach(p => {
        gsap.fromTo(p, { y: 20, opacity: 0 }, {
          y: 0, opacity: 1,
          duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 90%', once: true }
        });
      });

      gsap.utils.toArray('.about-text .feature').forEach((f, i) => {
        gsap.fromTo(f, { x: 30, opacity: 0 }, {
          x: 0, opacity: 1,
          duration: 1, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: f, start: 'top 92%', once: true }
        });
      });

      ScrollTrigger.create({
        trigger: '#hlCircle',
        start: 'top 90%',
        once: true,
        onEnter: () => document.getElementById('hlCircle')?.classList.add('in')
      });
    }

    /* === INTEGRAÇÃO API — Produtos em Destaque === */
    async function carregarDestaque() {
      try {
        const response = await fetch(CONFIG.url('destaque'));
        if (!response.ok) return;

        const produtos = await response.json();
        const carousel = document.getElementById('menuCarousel');
        if (!carousel) return;

        // Remove cards mockados
        carousel.querySelectorAll('.menu-card').forEach(c => c.remove());

        produtos.forEach(p => {
          const preco = typeof p.preco === 'number' ? p.preco : 0;
          const card = document.createElement('div');
          card.className = 'menu-card';
          card.innerHTML = `
            <div class="menu-card-inner">
              <div class="face">
                <div class="img-wrap">
                  <span class="badge hot">Destaque</span>
                  <div class="img" style="background-image: url('${p.foto || 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80'}');"></div>
                </div>
                <div class="body">
                  <h3 class="name">${p.nome}</h3>
                  <p class="desc">${p.descricao || ''}</p>
                  <div class="price-row">
                    <span class="price">R$ ${preco.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <a href="cardapio/cardapio.html" class="btn btn-primary" style="margin-top:16px">
                    Ver cardápio <span class="arr">→</span>
                  </a>
                </div>
                <button class="flip-cue" aria-label="Ver detalhes">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              <div class="face back">
                <h3>${p.nome}</h3>
                <p>${p.descricao || 'Ingredientes selecionados com muito cuidado.'}</p>
                <a href="cardapio/cardapio.html" class="order-back">
                  Pedir agora
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>`;
          carousel.appendChild(card);
        });

        // Reativar flip nos novos cards
        carousel.querySelectorAll('.flip-cue').forEach(cue => {
          cue.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cue.closest('.menu-card')?.classList.toggle('flipped');
          });
        });

        // Reativar tilt 3D nos novos cards
        const isFine = window.matchMedia('(pointer: fine)').matches;
        if (isFine && !reduced) {
          carousel.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
              const r = card.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - 0.5;
              const y = (e.clientY - r.top) / r.height - 0.5;
              card.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
          });
        }

      } catch (error) {
        console.error('Erro ao carregar destaques:', error);
      }
    }

    document.addEventListener('DOMContentLoaded', carregarDestaque);

    /* Menu carousel — auto-advance + filter */
    (function () {
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
    })();

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

    /* Custom cursor follow */
    (function () {
      const isFine = window.matchMedia('(pointer: fine)').matches;
      if (!isFine || reduced) return;
      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      if (!dot || !ring) return;
      let mx = window.innerWidth/2, my = window.innerHeight/2;
      let rx = mx, ry = my;
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      });
      function follow() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(follow);
      }
      follow();
      const sel = 'a, button, .menu-card, .review-card, .cat-pill, .contact-row, .story-step';
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', () => { ring.classList.add('hover'); dot.classList.add('hover'); });
        el.addEventListener('mouseleave', () => { ring.classList.remove('hover'); dot.classList.remove('hover'); });
      });
    })();

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

    /* Section title bar-sweep reveal */
    if (typeof IntersectionObserver !== 'undefined' && !reduced) {
      const sweepObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('sweep');
            sweepObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('.section-head h2, .story-header h2').forEach(el => sweepObs.observe(el));
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

    /* Replay animations button */
    (function () {
      const btn = document.getElementById('replayBtn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        btn.classList.add('spin');
        setTimeout(() => btn.classList.remove('spin'), 1500);

        // Reset hero letters
        document.querySelectorAll('.hero-headline .ltr').forEach(l => {
          l.style.opacity = '0';
          l.style.transform = 'translateY(105%)';
        });
        ['heroEyebrow','heroSub','heroCtas','heroMeta'].forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; }
        });
        const heroImg = document.getElementById('heroImage');
        if (heroImg) { heroImg.style.opacity = '0'; heroImg.style.transform = 'rotate(14deg) scale(0.5) translateY(100px)'; }
        document.getElementById('hlCircle')?.classList.remove('in');
        document.getElementById('hlUnder')?.classList.remove('in');

        // Scroll back to top and replay hero
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (typeof gsap !== 'undefined') gsap.killTweensOf('*');
          kickHero();
          // Re-fire all scroll triggers from current scroll position
          if (window.ScrollTrigger) {
            ScrollTrigger.getAll().forEach(st => {
              try {
                st.disable(false);
                st.enable(false);
                st.refresh();
              } catch (e) {}
            });
          }
        }, 600);
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
      const targets = [4.8, 25, 12];
      const formatters = [
        (v) => v.toFixed(1).replace('.', ','),
        (v) => Math.round(v) + ' min',
        (v) => Math.round(v) + ' telões'
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


    /* Floating circles parallax on scroll */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduced) {
      gsap.utils.toArray('.float-circle').forEach((el, i) => {
        gsap.to(el, {
          y: (i % 2 ? -120 : 120),
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
        });
      });

      // About features stagger
      gsap.utils.toArray('.about-text .feature').forEach((f, i) => {
        gsap.to(f, {
          opacity: 1, x: 0,
          duration: 1.1, delay: i * 0.12, ease: 'expo.out',
          scrollTrigger: { trigger: f, start: 'top 92%', once: true }
        });
      });

      // Marquee enter (rotate slight on scroll)
      gsap.to('#marquee1', {
        rotation: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#marquee1', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      gsap.to('#marquee2', {
        rotation: -1,
        ease: 'none',
        scrollTrigger: { trigger: '#marquee2', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });

      // Hand-drawn underlines on additional spots
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
      }, { threshold: 0.4 });
      document.querySelectorAll('.hl-mini').forEach(el => observer.observe(el));
    }
