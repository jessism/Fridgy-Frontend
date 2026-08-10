import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../features/auth/context/AuthContext';
import appLogo from '../assets/images/Logo.png';
import dishImage1 from '../assets/images/Landing page hero circle/pexels-annevandervalk-18585656.jpg';
import dishImage2 from '../assets/images/Landing page hero circle/pexels-charlene-2161046612-37409101.jpg';
import dishImage3 from '../assets/images/Landing page hero circle/pexels-fox-58267-35285814.jpg';
import dishImage4 from '../assets/images/Landing page hero circle/pexels-gizem-gokce-1072613075-38343253.jpg';
import dishImage5 from '../assets/images/Landing page hero circle/pexels-joy_-lee-273537-14742312.jpg';
import dishImage6 from '../assets/images/Landing page hero circle/pexels-laura-oliveira-2156849568-34429481.jpg';
import dishImage7 from '../assets/images/Landing page hero circle/pexels-max-griss-16866522-37180268.jpg';
import dishImage8 from '../assets/images/Landing page hero circle/pexels-maxbond-8366627.jpg';
import dishImage9 from '../assets/images/Landing page hero circle/pexels-nadin-sh-78971847-13749941.jpg';
import dishImage10 from '../assets/images/Landing page hero circle/pexels-nour-alhoda-2151678059-32535020.jpg';
import dishImage11 from '../assets/images/Landing page hero circle/pexels-nour-alhoda-2151678059-36718511.jpg';
import dishImage12 from '../assets/images/Landing page hero circle/pexels-pexels-user-1368186290-25884476.jpg';
import dishImage13 from '../assets/images/Landing page hero circle/pexels-punam-oishy-415017245-34624025.jpg';
import dishImage14 from '../assets/images/Landing page hero circle/pexels-richard-l-2150581203-34871730.jpg';
import dishImage15 from '../assets/images/Landing page hero circle/pexels-thomas-parker-1272388137-38412480.jpg';
import phoneLeftImage from '../assets/product mockup/Hero_Meals.jpeg';
import phoneRightImage from '../assets/product mockup/Hero_Inventory.jpeg';
import step1Video from '../assets/product mockup/Track inventory new.mp4';
import step2Video from '../assets/product mockup/Snap groceries.mp4';
import step3Video from '../assets/product mockup/instruction.mp4';
import sharedListVideo from '../assets/product mockup/shared-list.mp4';
import mealPlanningVideo from '../assets/product mockup/meal-planning.mp4';
import reminderVideo from '../assets/product mockup/Reminder.mp4';
import expirationImage from '../assets/product mockup/Expiration.jpeg';
import googleCalendarIcon from '../assets/icons/Google calendar.png';
import appleCalendarIcon from '../assets/icons/Apple Calendar.png';
import googleCalendarVideo from '../assets/product mockup/Google calendar.mp4';
import './NewLandingPage3.css';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const DISH_IMAGES = [
  dishImage1, dishImage2, dishImage3, dishImage4, dishImage5,
  dishImage6, dishImage7, dishImage8, dishImage9, dishImage10,
  dishImage11, dishImage12, dishImage13, dishImage14, dishImage15,
];
const WHEEL_CARD_COUNT = 20;

const NewLandingPage3 = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [wayItalicized, setWayItalicized] = useState(false);
  const highlightRef = useRef(null);
  const wheelZoneRef = useRef(null);
  const totalTestimonials = 10;
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const cardsVisible = 3;
  const maxPosition = totalTestimonials - cardsVisible;

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => Math.min(prev + 1, maxPosition));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => Math.max(prev - 1, 0));
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(Math.min(index, maxPosition));
  };

  // Check authentication and redirect if logged in
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      console.log('[Landing3] User authenticated, redirecting to home...');
      navigate('/home');
    }
  }, [loading, isAuthenticated, navigate]);

  // Handle scroll to change header background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Italicize "WAY" after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setWayItalicized(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for "in 3 simple steps" highlight effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHighlightVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (highlightRef.current) {
      observer.observe(highlightRef.current);
    }

    return () => {
      if (highlightRef.current) {
        observer.unobserve(highlightRef.current);
      }
    };
  }, []);

  // Dish-photo wheel: shows as an arc in the hero, becomes a rotating
  // circle as the user scrolls through the wheel zone
  useGSAP(() => {
    if (loading) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        allowMotion: '(prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 768px)',
        desktop: '(min-width: 769px)',
      },
      (context) => {
        const { reduceMotion, mobile } = context.conditions;
        const cards = gsap.utils.toArray('.landing-page-v4__wheel-card');
        if (!cards.length) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Final ring overflows the viewport top/bottom (like the
        // reference) while keeping generous open space in the middle
        const radius = mobile ? vw * 0.85 : Math.min(vw * 0.44, 660);
        // The hero arc keeps a fixed large sweep regardless of ring size
        const heroRadius = mobile ? radius * 2 : Math.min(vw * 0.88, 1320);
        // Hero cards ~245px; they settle smaller on the final ring
        const cardStartScale = mobile ? 0.77 : Math.min(1, 245 / (160 * (heroRadius / radius)));
        const cardEndScale = mobile ? 1 : 0.8;

        // Wheel drivers: spin (idle drift) and scrubRot (scroll) move the
        // cards around the rim; morph controls their orientation —
        // 0 = upright like Ferris-wheel gondolas (hero arc),
        // 1 = facing outward on the ring (full circle)
        const wheel = { spin: 0, scrubRot: 0, morph: 0 };
        const baseAngles = cards.map((_, i) => (360 / cards.length) * i);

        cards.forEach((card) => {
          // counteract the rotor's start scale so hero cards stay a
          // reasonable size; tweened down as the wheel shrinks
          gsap.set(card, { xPercent: -50, yPercent: -50, scale: cardStartScale });
        });

        const positionCards = () => {
          const total = wheel.spin + wheel.scrubRot;
          cards.forEach((card, i) => {
            const angle = baseAngles[i] + total;
            const rad = (angle * Math.PI) / 180;
            // shortest-path outward angle so the morph never over-rotates
            const facing = gsap.utils.wrap(-180, 180, angle + 90);
            gsap.set(card, {
              x: Math.cos(rad) * radius,
              y: Math.sin(rad) * radius,
              rotation: wheel.morph * facing,
            });
          });
        };
        positionCards();
        gsap.ticker.add(positionCards);

        // Start the wheel oversized with its centre ABOVE the viewport,
        // so the hero shows the bottom rim of the circle as a hanging
        // garland (arc facing up)
        const startScale = heroRadius / radius;
        // Lowest point of the circle sits at ~95% of the viewport height
        const startY = vh * 0.45 - heroRadius;
        gsap.set('.landing-page-v4__wheel-rotor', { y: startY, scale: startScale });
        gsap.to(cards, { opacity: 1, duration: 0.6, stagger: 0.04 });

        // Constant idle spin (the "flow" in the hero)
        if (!reduceMotion) {
          gsap.to(wheel, {
            spin: 360,
            duration: 90,
            repeat: -1,
            ease: 'none',
          });
        }

        // Scroll-scrubbed: raise the wheel centre into view, add extra
        // rotation, and fade in the centre title
        const tl = gsap.timeline({
          scrollTrigger: {
            // the zone is the useGSAP scope root, so pass the element
            // itself — a scoped selector would only match descendants
            trigger: wheelZoneRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });
        // The reveal finishes ~60% through the zone; the rest is a hold
        // where the completed circle lingers before the next section
        if (!reduceMotion) {
          // Heavier rotation drives the "twist" feel
          tl.to(wheel, { scrubRot: 220, ease: 'none', duration: 1 }, 0);
          // Cards twist from upright (hero) to outward-facing (circle)
          tl.to(wheel, { morph: 1, ease: 'power1.inOut', duration: 0.4 }, 0.2);
          // The centre dives from above the viewport to below the middle
          // while swinging sideways and shrinking — mid-transition the rim
          // sweeps edge-on across the screen (the flip), then you briefly
          // see the ring as a dome from below...
          tl.to(
            '.landing-page-v4__wheel-rotor',
            { x: vw * 0.3, y: vh * 0.22, scale: 1.3, ease: 'power1.inOut', duration: 0.22 },
            0.13
          );
          // ...before it settles into the centred full circle
          tl.to(
            '.landing-page-v4__wheel-rotor',
            { x: 0, y: 0, scale: 1, ease: 'power1.inOut', duration: 0.26 },
            0.36
          );
          // cards ease to their final ring size as the wheel shrinks
          tl.to(cards, { scale: cardEndScale, ease: 'power1.inOut', duration: 0.49 }, 0.13);
        } else {
          tl.to(
            '.landing-page-v4__wheel-rotor',
            { y: 0, scale: 1, ease: 'none', duration: 0.42 },
            0.15
          );
          tl.to(cards, { scale: cardEndScale, ease: 'none', duration: 0.42 }, 0.15);
          tl.to(wheel, { morph: 1, ease: 'none', duration: 0.42 }, 0.15);
        }
        tl.fromTo(
          '.landing-page-v4__wheel-title',
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.15 },
          0.44
        );
        // Feature lines appear one by one on the right, hold together for
        // a stretch, then clear completely before the headline arrives
        const lines = gsap.utils.toArray('.landing-page-v4__wheel-line');
        lines.forEach((line, i) => {
          tl.fromTo(
            line,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.05 },
            0.22 + i * 0.09
          );
        });
        tl.to('.landing-page-v4__wheel-lines', { opacity: 0, duration: 0.06 }, 0.52);

        // Only after the lines are gone: headline pops in, then the phones
        tl.fromTo(
          '.landing-page-v4__wheel-heading',
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 0.08 },
          0.62
        );
        tl.fromTo(
          '.landing-page-v4__wheel-phones',
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.12 },
          0.78
        );

        // matchMedia cleanup: stop the per-frame card positioning
        return () => gsap.ticker.remove(positionCards);
      }
    );
  }, { scope: wheelZoneRef, dependencies: [loading] });

  // Step headings: masked line reveal (SplitText) as each slide scrolls in
  useGSAP(() => {
    if (loading) return;

    const mm = gsap.matchMedia();

    // Pinned panel with overscroll: the steps section pins once fully
    // scrolled, and the meal-planning card slides up over it
    mm.add('(min-width: 769px)', () => {
      // Pin the wheel zone at its end so the finished circle holds
      // while the steps panel slides up over it
      ScrollTrigger.create({
        trigger: '.landing-page-v4__wheel-zone',
        start: 'bottom bottom',
        end: '+=100%',
        pin: true,
        pinSpacing: false,
      });

      ScrollTrigger.create({
        trigger: '.landing-page-v4__steps-section',
        start: 'bottom bottom',
        end: '+=100%',
        pin: true,
        pinSpacing: false,
      });

      // Shared-element flight: the Inventory phone lifts out of the wheel
      // centre and lands exactly in Step 1's phone slot as the steps panel
      // arrives, handing off to the step video
      const wheelPhoneFrame = document.querySelector(
        '.landing-page-v4__wheel-phones .landing-page-v4__phone--right .landing-page-v4__phone-frame'
      );
      const stepSlide = document.querySelector('.landing-page-v4__step-slide');
      const stepPhoneFrame = stepSlide && stepSlide.querySelector('.landing-page-v4__step-phone-frame');
      const flight = document.querySelector('.landing-page-v4__phone-flight');
      if (wheelPhoneFrame && stepPhoneFrame && flight) {
        // All geometry is measured lazily (and re-measured on refresh) so
        // the stand-in lands exactly on the live phones even after fonts
        // and images have shifted the layout
        const startW = () => wheelPhoneFrame.offsetWidth * 0.8;
        const startH = () => wheelPhoneFrame.offsetHeight * 0.8;
        const startX = () => {
          const r = wheelPhoneFrame.getBoundingClientRect();
          return r.left + r.width / 2 - startW() / 2;
        };
        const startY = () => {
          const r = wheelPhoneFrame.getBoundingClientRect();
          return r.top + r.height / 2 - startH() / 2;
        };
        const endX = () => stepPhoneFrame.getBoundingClientRect().left;
        const endY = () =>
          stepPhoneFrame.getBoundingClientRect().top -
          stepSlide.getBoundingClientRect().top;
        const endW = () => stepPhoneFrame.getBoundingClientRect().width;
        const endH = () => stepPhoneFrame.getBoundingClientRect().height;

        const flightTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.landing-page-v4__steps-section',
            start: 'top bottom',
            endTrigger: '.landing-page-v4__step-slide',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        flightTl
          // the front (Meals) phone bows out first
          .to(
            '.landing-page-v4__wheel-phones .landing-page-v4__phone--left',
            { autoAlpha: 0, duration: 0.12 },
            0.02
          )
          // atomic swap: the stand-in appears pixel-identical over the
          // real phone in the same instant the real one hides — only
          // after that does any motion begin
          .set(flight, { x: startX, y: startY, width: startW, height: startH, rotation: 5 }, 0.05)
          .fromTo(flight, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.005 }, 0.05)
          .to(
            '.landing-page-v4__wheel-phones .landing-page-v4__phone--right',
            { autoAlpha: 0, duration: 0.005 },
            0.05
          )
          // straighten in place (5deg tilt -> upright)
          .to(flight, { rotation: 0, ease: 'power1.inOut', duration: 0.09 }, 0.08)
          // glide to the centre of the screen, descending as it goes
          .to(
            flight,
            {
              x: () => window.innerWidth / 2 - startW() / 2,
              y: () => window.innerHeight * 0.52 - startH() / 2,
              ease: 'power1.inOut',
              duration: 0.16,
            },
            0.16
          )
          // long hold in the centre (0.32 - 0.48), then slide right
          // into Step 1's column...
          .to(flight, { x: endX, ease: 'power1.inOut', duration: 0.14 }, 0.48)
          // ...then drop straight down into the slot, growing to size and
          // morphing the frame geometry to match the step phone
          .to(
            flight,
            { y: endY, width: endW, height: endH, ease: 'power1.inOut', duration: 0.33 },
            0.64
          )
          .to(
            '.landing-page-v4__phone-flight-frame',
            { padding: 10, borderRadius: 40, ease: 'power1.inOut', duration: 0.33 },
            0.64
          )
          .to(
            '.landing-page-v4__phone-flight-img',
            { borderRadius: 30, ease: 'power1.inOut', duration: 0.33 },
            0.64
          )
          // keep Step 1's slot empty until the flight lands, then hand off
          .fromTo(stepPhoneFrame, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.96)
          .to(flight, { autoAlpha: 0, duration: 0.03 }, 0.97);
      }

      // Same overscroll between the meal-planning card and the shop card.
      // The pin covers the delay spacer (50vh hold) plus the shop
      // panel's 100vh climb
      ScrollTrigger.create({
        trigger: '.landing-page-v4__feature-block', // first block (meal planning)
        start: 'bottom bottom',
        end: '+=150%',
        pin: true,
        pinSpacing: false,
      });
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.landing-page-v4__steps-title, .landing-page-v4__step-heading').forEach((heading, i) => {
        // The section title and Step 1 arrive during the fast panel
        // slide-over, so their reveals fire at mid-viewport where the
        // eye actually is; the stacked slides keep the earlier trigger
        const start = i <= 1 ? 'top 45%' : 'top 80%';
        SplitText.create(heading, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true, // re-splits on font load / resize
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              ease: 'power4.out',
              stagger: 0.12,
              scrollTrigger: {
                trigger: heading,
                start,
                once: true,
              },
            }),
        });
      });
    });
  }, { dependencies: [loading] });

  const handleGetStarted = () => {
    console.log('[Landing3] Navigating to onboarding');
    navigate('/onboarding');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="landing-page-v4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="landing-page-v4">
      {/* Header */}
      <header className={`landing-page-v4__header ${isScrolled ? 'landing-page-v4__header--scrolled' : ''}`}>
        <div className="landing-page-v4__logo-section">
          <img src={appLogo} alt="Trackabite logo" className="landing-page-v4__logo" />
          <span className="landing-page-v4__brand-name">Trackabite</span>
        </div>
        <div className="landing-page-v4__header-actions">
          <Link to="/signin" className="landing-page-v4__signin-btn">
            Sign in
          </Link>
          <a
            href="https://apps.apple.com/us/app/trackabite-meal-planner/id6759185932"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-page-v4__header-cta"
          >
            START FREE ON IOS
          </a>
        </div>
      </header>

      {/* Wheel Zone: the hero + circle-reveal share one sticky dish wheel */}
      <div className="landing-page-v4__wheel-zone" ref={wheelZoneRef}>
        {/* Sticky wheel layer (stays on screen while the zone scrolls) */}
        <div className="landing-page-v4__wheel-sticky">
          <div className="landing-page-v4__wheel-rotor" aria-hidden="true">
            <div className="landing-page-v4__wheel-spinner">
              {Array.from({ length: WHEEL_CARD_COUNT }).map((_, i) => (
                <img
                  key={i}
                  src={DISH_IMAGES[i % DISH_IMAGES.length]}
                  alt=""
                  className="landing-page-v4__wheel-card"
                />
              ))}
            </div>
          </div>
          <div className="landing-page-v4__wheel-title">
            <h2 className="landing-page-v4__wheel-title-text">
              Eat well.<br />Waste less.
            </h2>
          </div>
          {/* Desktop: feature lines revealed one by one inside the circle
              as it sweeps through the right side of the screen */}
          <div className="landing-page-v4__wheel-lines" aria-hidden="true">
            <p className="landing-page-v4__wheel-line">Keep track of what you have</p>
            <p className="landing-page-v4__wheel-line">Save recipes from anywhere</p>
            <p className="landing-page-v4__wheel-line">Create smart shopping lists</p>
          </div>
          {/* Desktop: headline + phone mockups in the circle centre */}
          <h2 className="landing-page-v4__wheel-heading">
            Experience the Trackabite difference
          </h2>
          <div className="landing-page-v4__wheel-phones" aria-hidden="true">
            <div className="landing-page-v4__phones">
              <div className="landing-page-v4__phone landing-page-v4__phone--left">
                <div className="landing-page-v4__phone-frame">
                  <div className="landing-page-v4__phone-notch"></div>
                  <div className="landing-page-v4__phone-screen">
                    <img
                      src={phoneLeftImage}
                      alt=""
                      className="landing-page-v4__phone-img"
                    />
                  </div>
                </div>
              </div>
              <div className="landing-page-v4__phone landing-page-v4__phone--right">
                <div className="landing-page-v4__phone-frame">
                  <div className="landing-page-v4__phone-notch"></div>
                  <div className="landing-page-v4__phone-screen">
                    <img
                      src={phoneRightImage}
                      alt=""
                      className="landing-page-v4__phone-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Hero Section */}
      <section className="landing-page-v4__hero">
        {/* Giant Background Text */}
        <div className="landing-page-v4__bg-text">
          <h1 className="landing-page-v4__bg-text-line">YOUR DINNER JUST</h1>
          <h1 className="landing-page-v4__bg-text-line landing-page-v4__bg-text-line--second">GOT <span className={`landing-page-v4__way-text ${wayItalicized ? 'landing-page-v4__way-text--italic' : ''}`}>WAY</span> EASIER.</h1>
        </div>

        {/* Subtitle and CTA - centered below title */}
        <div className="landing-page-v4__hero-cta">
          <p className="landing-page-v4__hero-subtitle">
            Save recipes, track what you've got, and let AI do the thinking.
          </p>
          <a href="https://apps.apple.com/us/app/trackabite-meal-planner/id6759185932" target="_blank" rel="noopener noreferrer" className="landing-page-v4__cta-btn">
            START FREE ON IOS
          </a>
        </div>

        {/* Phones Row - Tagline on left, Phones in center */}
        <div className="landing-page-v4__phones-row">
          {/* Left - Tagline */}
          <div className="landing-page-v4__bottom-left">
            <h2 className="landing-page-v4__tagline">
              <span className="landing-page-v4__tagline-line1">Get dinner ideas</span>
              <span className="landing-page-v4__tagline-line2">in <em>seconds.</em></span>
            </h2>
            <p className="landing-page-v4__tagline-subtitle">
              Track, cook, and shop without the mental overload.
            </p>
          </div>

          {/* Phone Mockups */}
          <div className="landing-page-v4__phones">
            <div className="landing-page-v4__phone landing-page-v4__phone--left">
              <div className="landing-page-v4__phone-frame">
                <div className="landing-page-v4__phone-notch"></div>
                <div className="landing-page-v4__phone-screen">
                  <img
                    src={phoneLeftImage}
                    alt="Trackabite - Inventory tracking"
                    className="landing-page-v4__phone-img"
                  />
                </div>
              </div>
            </div>

            <div className="landing-page-v4__phone landing-page-v4__phone--right">
              <div className="landing-page-v4__phone-frame">
                <div className="landing-page-v4__phone-notch"></div>
                <div className="landing-page-v4__phone-screen">
                  <img
                    src={phoneRightImage}
                    alt="Trackabite - AI Recipes"
                    className="landing-page-v4__phone-img"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Feature Callout */}
          <div className="landing-page-v4__bottom-right">
            <div className="landing-page-v4__feature-callout">
              <p className="landing-page-v4__feature-text">
                Track, cook, and shop without the mental overload.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Scroll distance for the wheel reveal */}
        <div className="landing-page-v4__wheel-space"></div>
      </div>

      {/* Flight phone: travels from the wheel centre into Step 1 (desktop) */}
      <div className="landing-page-v4__phone-flight" aria-hidden="true">
        <div className="landing-page-v4__phone-flight-frame">
          <img
            src={phoneRightImage}
            alt=""
            className="landing-page-v4__phone-flight-img"
          />
        </div>
      </div>

      {/* Steps Section - Sticky Scroll */}
      <section className="landing-page-v4__steps-section">
        {/* Section Title */}
        <div className="landing-page-v4__steps-header">
          <h2 className="landing-page-v4__steps-title">
            <span
              ref={highlightRef}
              className={`landing-page-v4__steps-title-highlight ${highlightVisible ? 'landing-page-v4__steps-title-highlight--active' : ''}`}
            >Plan smarter, eat better</span><br />
            in 3 simple steps
          </h2>
        </div>

        {/* Sticky Slides Container */}
        <div className="landing-page-v4__steps-sticky-container">
          {/* Step 1 - Sticky Slide */}
          <div className="landing-page-v4__step-slide">
            <div className="landing-page-v4__step-slide-container landing-page-v4__step-slide-container--dark">
              <div className="landing-page-v4__step-slide-content">
                <div className="landing-page-v4__step-content">
                  <span className="landing-page-v4__step-number">Step 1.</span>
                  <h3 className="landing-page-v4__step-heading">Snap & manage <span className="landing-page-v4__mobile-break">your groceries.</span></h3>
                  <p className="landing-page-v4__step-description">
                    Just snap a photo and let Trackabite sort everything for you.<br /><br />Know exactly what you've got, what's running low, and what's about to go rogue in the back of your fridge.
                  </p>
                </div>
                <div className="landing-page-v4__step-image landing-page-v4__step-image--top-crop">
                  <div className="landing-page-v4__step-phone-frame">
                    <div className="landing-page-v4__step-phone-notch"></div>
                    <div className="landing-page-v4__step-phone-screen">
                      <video
                        src={step1Video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="landing-page-v4__step-phone"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - Sticky Slide */}
          <div className="landing-page-v4__step-slide">
            <div className="landing-page-v4__step-slide-container landing-page-v4__step-slide-container--green">
              <div className="landing-page-v4__step-slide-content">
                <div className="landing-page-v4__step-content">
                  <span className="landing-page-v4__step-number">Step 2.</span>
                  <h3 className="landing-page-v4__step-heading">Save your favorite recipes from <em>anywhere.</em></h3>
                  <p className="landing-page-v4__step-description">
                    Pull recipes from any Instagram Reel & Post, upload your own creations, and keep everything tidy so you can quickly find them when you need dinner ideas.
                  </p>
                </div>
                <div className="landing-page-v4__step-image landing-page-v4__step-image--top-crop">
                  <div className="landing-page-v4__step-phone-frame">
                    <div className="landing-page-v4__step-phone-notch"></div>
                    <div className="landing-page-v4__step-phone-screen">
                      <video
                        src={step2Video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="landing-page-v4__step-phone"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Sticky Slide */}
          <div className="landing-page-v4__step-slide">
            <div className="landing-page-v4__step-slide-container landing-page-v4__step-slide-container--lime">
              <div className="landing-page-v4__step-slide-content">
                <div className="landing-page-v4__step-content">
                  <span className="landing-page-v4__step-number">Step 3.</span>
                  <h3 className="landing-page-v4__step-heading">Follow along with <em>step-by-step</em> instructions.</h3>
                  <p className="landing-page-v4__step-description">
                    No more guessing or scrolling through walls of text.<br /><br />
                    Trackabite walks you through each recipe one step at a time — clear, simple, and easy to follow while you cook.
                  </p>
                </div>
                <div className="landing-page-v4__step-image landing-page-v4__step-image--top-crop">
                  <div className="landing-page-v4__step-phone-frame">
                    <div className="landing-page-v4__step-phone-notch"></div>
                    <div className="landing-page-v4__step-phone-screen">
                      <video
                        src={step3Video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="landing-page-v4__step-phone"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Shared Background */}
      <section className="landing-page-v4__features-section">
        {/* Meal Planning */}
        <div className="landing-page-v4__feature-block">
          <div className="landing-page-v4__feature-block-content">
            <div className="landing-page-v4__feature-phone">
              <div className="landing-page-v4__feature-phone-frame">
                <div className="landing-page-v4__feature-phone-notch"></div>
                <div className="landing-page-v4__feature-phone-screen">
                  <video
                      src={mealPlanningVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="landing-page-v4__feature-phone-img"
                    />
                </div>
              </div>
            </div>
            <div className="landing-page-v4__feature-text">
              <h2 className="landing-page-v4__feature-heading">
                Meal planning made easy.
              </h2>
              <p className="landing-page-v4__feature-description">
                Plan your whole week in minutes and access it anytime, anywhere — so eating well doesn't feel like a full-time job.
              </p>
              <a href="https://apps.apple.com/us/app/trackabite-meal-planner/id6759185932" target="_blank" rel="noopener noreferrer" className="landing-page-v4__feature-cta">
                START FREE ON IOS
              </a>
            </div>
          </div>
        </div>

        {/* Shop Smarter Together */}
        {/* Scroll delay: holds the pinned meal-planning card on screen
            before the shop panel starts sliding over it (desktop) */}
        <div className="landing-page-v4__shop-delay" aria-hidden="true"></div>

        <div className="landing-page-v4__feature-block landing-page-v4__feature-block--shop">
          <div className="landing-page-v4__feature-block-content landing-page-v4__feature-block-content--reversed">
            <div className="landing-page-v4__feature-text">
              <h2 className="landing-page-v4__feature-heading">
                Shop smarter together.
              </h2>
              <p className="landing-page-v4__feature-description">
                Share your shopping list with family in real-time. Everyone stays synced, no duplicate purchases, and grocery trips become a breeze.
              </p>
              <a href="https://apps.apple.com/us/app/trackabite-meal-planner/id6759185932" target="_blank" rel="noopener noreferrer" className="landing-page-v4__feature-cta">
                START FREE ON IOS
              </a>
            </div>
            <div className="landing-page-v4__feature-phone">
              <div className="landing-page-v4__feature-phone-frame">
                <div className="landing-page-v4__feature-phone-notch"></div>
                <div className="landing-page-v4__feature-phone-screen">
                  <video
                    src={sharedListVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="landing-page-v4__feature-phone-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Connected Section */}
        <div className="landing-page-v4__feature-block landing-page-v4__feature-block--grid">
          <h2 className="landing-page-v4__feature-block-title landing-page-v4__feature-block-title--left">
            <span className="landing-page-v4__feature-block-title-small">Always stay</span>
            <span className="landing-page-v4__feature-block-title-large">Connected.</span>
          </h2>

          <div className="landing-page-v4__feature-cards">
            {/* Left Card - Expiry Reminders */}
            <div className="landing-page-v4__feature-card">
              <h3 className="landing-page-v4__feature-card-title">Get expiry reminders</h3>
              <p className="landing-page-v4__feature-card-description">
                Say goodbye to wasted groceries. Trackabite reminds you <em>before</em> things go bad, so you can cook more, save more.
              </p>
              <div className="landing-page-v4__feature-card-phone">
                <div className="landing-page-v4__feature-phone-frame">
                  <div className="landing-page-v4__feature-phone-notch"></div>
                  <div className="landing-page-v4__feature-phone-screen">
                    <img
                      src={expirationImage}
                      alt="Expiry reminders - inventory sorted by expiration"
                      className="landing-page-v4__feature-phone-img"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card - Calendar Integration */}
            <div className="landing-page-v4__feature-card">
              <h3 className="landing-page-v4__feature-card-title">Connect to your <span style={{whiteSpace: 'nowrap'}}>Google or iCalendar</span></h3>
              <p className="landing-page-v4__feature-card-description">
                Keep your week running smoothly. Sync meals to your schedule so dinner becomes simple, predictable, and one less thing to think about.
              </p>
              <div className="landing-page-v4__calendar-icons">
                <img src={googleCalendarIcon} alt="Google Calendar" className="landing-page-v4__calendar-icon" />
                <img src={appleCalendarIcon} alt="Apple Calendar" className="landing-page-v4__calendar-icon" />
              </div>
              <div className="landing-page-v4__feature-card-phone">
                <div className="landing-page-v4__feature-phone-frame">
                  <div className="landing-page-v4__feature-phone-notch"></div>
                  <div className="landing-page-v4__feature-phone-screen">
                    <video
                      src={googleCalendarVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="landing-page-v4__feature-phone-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="landing-page-v4__testimonial">
        <div className="landing-page-v4__testimonial-content">

          {/* Testimonial Header */}
          <div className="landing-page-v4__testimonial-header">
            <h2 className="landing-page-v4__testimonial-headline">
              What <span className="landing-page-v4__testimonial-highlight">Our Users</span> Say
            </h2>
            <p className="landing-page-v4__testimonial-description">
              Real kitchens, real wins — from home cooks who made dinner the easy part of the day.
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="landing-page-v4__testimonial-carousel">
            <div
              className="landing-page-v4__testimonial-track"
              style={{
                transform: `translateX(calc(-${currentTestimonial} * ((100% + 30px) / 3)))`
              }}
            >

              {/* Testimonial 1 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "Didn't think I'd ever get this excited about my fridge, but here we are. Trackabite actually helps me remember what's in there before it goes bad. Love the little reminders - feels like having a smart fridge without the price tag."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Sarah L.</span>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "This app is such a life-saver. My wife and I always buy double of everything - now we just share the grocery list in Trackabite. No more five cartons of milk. Seriously, thank you."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Marcus W.</span>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "Really like how clean and easy the interface is. I started tracking leftovers and it's been surprisingly satisfying. Would love if it connected to grocery stores next - that'd be wild."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Chloe D.</span>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "I'm not exactly a 'food waste warrior,' but this app is turning me into one. It actually feels good to finish stuff before it expires. Plus, the AI recipe ideas are way better than I expected."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Tom R.</span>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "My roommates and I use this every week. It's become our little 'fridge scoreboard.' We compete to see who wastes less food. The shared grocery list feature? 10/10."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Priya K.</span>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "Been using Trackabite for a month. I like how it shows what's expiring soon and gives meal ideas using those ingredients. Feels like my fridge got smarter overnight."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Daniel S.</span>
                </div>
              </div>

              {/* Testimonial 7 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "This app is GENIUS. I used to throw away so much spinach it was embarrassing. Now I actually use what I buy. The design is cute too - feels friendly, not like a boring spreadsheet."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Jenna M.</span>
                </div>
              </div>

              {/* Testimonial 8 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "Great app overall. The AI suggestions are spot on - made a random 'leftover rice stir-fry' last night that turned out amazing. Would be cool if there were seasonal recipe ideas too."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Alex C.</span>
                </div>
              </div>

              {/* Testimonial 9 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "Honestly, Trackabite is my new favorite adulting tool. Keeps my fridge organized, helps me plan meals, and even saves me money. Never thought an app could make me feel proud of my groceries."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Emily T.</span>
                </div>
              </div>

              {/* Testimonial 10 */}
              <div className="landing-page-v4__testimonial-card">
                <p className="landing-page-v4__testimonial-text">
                  "Been using it for a few weeks and it's already part of my routine. I just snap a pic of stuff when I unload groceries. Simple, fast, and super helpful. Totally recommend."
                </p>
                <div className="landing-page-v4__testimonial-footer">
                  <span className="landing-page-v4__testimonial-name">Kevin L.</span>
                </div>
              </div>

            </div>

            {/* Navigation Arrows */}
            <button
              className="landing-page-v4__testimonial-nav landing-page-v4__testimonial-nav--prev"
              onClick={prevTestimonial}
            >
              &#8249;
            </button>
            <button
              className="landing-page-v4__testimonial-nav landing-page-v4__testimonial-nav--next"
              onClick={nextTestimonial}
            >
              &#8250;
            </button>

            {/* Dots Indicator */}
            <div className="landing-page-v4__testimonial-dots">
              {[...Array(maxPosition + 1)].map((_, index) => (
                <span
                  key={index}
                  className={`landing-page-v4__testimonial-dot ${
                    index === currentTestimonial ? 'landing-page-v4__testimonial-dot--active' : ''
                  }`}
                  onClick={() => goToTestimonial(index)}
                ></span>
              ))}
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="landing-page-v4__final-cta">
        <h2 className="landing-page-v4__final-cta-tagline">
          Start eating better today
        </h2>
        <p className="landing-page-v4__final-cta-description">
          Save time, reduce waste, and make everyday meals easier.<br />
          You're just one tap away.
        </p>
        <a href="https://apps.apple.com/us/app/trackabite-meal-planner/id6759185932" target="_blank" rel="noopener noreferrer" className="landing-page-v4__cta-btn">
          START FREE ON IOS
        </a>
      </section>

      {/* Footer */}
      <footer className="landing-page-v4__footer">
        <div className="landing-page-v4__footer-container">
          <div className="landing-page-v4__footer-content">

            {/* Left Column - Branding */}
            <div className="landing-page-v4__footer-brand">
              <div className="landing-page-v4__footer-logo">
                <img src={appLogo} alt="Trackabite logo" className="landing-page-v4__footer-logo-img" />
                <span className="landing-page-v4__footer-brand-name">Trackabite</span>
              </div>
              <p className="landing-page-v4__footer-description">
                Trackabite helps you track what's in your fridge, reduce food waste, and discover recipes — making meal planning effortless.
              </p>
              <a
                href="https://instagram.com/trackabite"
                target="_blank"
                rel="noopener noreferrer"
                className="landing-page-v4__footer-social"
                aria-label="Follow us on Instagram"
              >
                <svg className="landing-page-v4__footer-instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Right Columns - Navigation */}
            <div className="landing-page-v4__footer-nav">

              {/* Product Column */}
              <div className="landing-page-v4__footer-column">
                <h4 className="landing-page-v4__footer-column-title">Product</h4>
                <ul className="landing-page-v4__footer-links">
                  <li><Link to="/product/features">Features</Link></li>
                  <li><Link to="/product/support">Support</Link></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="landing-page-v4__footer-column">
                <h4 className="landing-page-v4__footer-column-title">Resources</h4>
                <ul className="landing-page-v4__footer-links">
                  <li><Link to="/resources/blog">Blog</Link></li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="landing-page-v4__footer-column">
                <h4 className="landing-page-v4__footer-column-title">Company</h4>
                <ul className="landing-page-v4__footer-links">
                  <li><Link to="/about">About</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Footer Bottom */}
          <div className="landing-page-v4__footer-bottom">
            <p className="landing-page-v4__footer-copyright">
              © {new Date().getFullYear()} Trackabite. All rights reserved.
            </p>
            <div className="landing-page-v4__footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage3;
