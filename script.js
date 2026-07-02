/* d:\portfolio\script.js */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('checkbox');
    const themeLabel = document.getElementById('theme-label');
    const customCursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    const body = document.body;
    const hamburger = document.getElementById('hamburger');
    const navLinksList = document.getElementById('nav-links');

    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.id = 'effect-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let isSuperman = false;

    // Theme Switch
    themeToggle.addEventListener('change', (e) => {
        const oldBgColor = getComputedStyle(document.body).backgroundColor;

        // Create comic book halftone transition element
        const wipe = document.createElement('div');
        wipe.classList.add('comic-wipe');

        // Use a stark comic color based on theme (Yellow for Gotham, Blue/Red for Metropolis)
        const comicColor = isSuperman ? '#080810' : '#c41230'; // Opposite color of the current theme for high contrast
        wipe.style.setProperty('--comic-bg', comicColor);
        document.body.appendChild(wipe);

        // Start 'POW' growing animation
        requestAnimationFrame(() => {
            wipe.classList.add('expanding');
        });

        setTimeout(() => {
            // Apply theme change when comic dots cover the screen
            if (e.target.checked) {
                body.classList.add('superman-theme');
                themeLabel.textContent = "LIGHT";
                isSuperman = true;
                document.getElementById('footer-quote').textContent = "\"There is a superhero in all of us, we just need the courage to put on the cape.\"";
            } else {
                body.classList.remove('superman-theme');
                themeLabel.textContent = "DARK";
                isSuperman = false;
                document.getElementById('footer-quote').textContent = "\"The night is darkest just before the dawn.\"";
            }
            createBurst(width / 2, height / 2, isSuperman);

            // Retract/Fade the comic wipe
            wipe.classList.remove('expanding');
            wipe.classList.add('contracting');

            setTimeout(() => {
                wipe.remove();
            }, 500);
        }, 600); // Wait for the 'POW' expansion
    });

    // Custom Cursor tracking
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';

        // Add trail dot
        addTrailDot(cursorX, cursorY);
    });

    // Animate Follower (smooth lerp)
    function updateFollower() {
        let dx = cursorX - followerX;
        let dy = cursorY - followerY;
        followerX += dx * 0.15;
        followerY += dy * 0.15;
        followerFollower();
        requestAnimationFrame(updateFollower);
    }
    
    function followerFollower() {
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
    }
    updateFollower();

    // Hover effects for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .theme-switch, #chatbot-fab, input, textarea, label');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            customCursor.classList.add('cursor-hover');
            cursorFollower.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            customCursor.classList.remove('cursor-hover');
            cursorFollower.classList.remove('cursor-hover');
        });
    });

    // Click effect (Burst)
    document.addEventListener('mousedown', (e) => {
        createBurst(e.clientX, e.clientY, isSuperman);
    });

    // Particle System
    let particles = [];
    let trails = [];

    class Particle {
        constructor(x, y, isSuperman) {
            this.x = x;
            this.y = y;
            this.isSuperman = isSuperman;
            this.size = Math.random() * 5 + 3;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.05 + 0.02;

            if (isSuperman) {
                // Superman color palette (Red, Blue, Gold/Yellow)
                const rand = Math.random();
                this.color = rand > 0.6 ? '#c41230' : (rand > 0.2 ? '#0a4a8f' : '#ffc900');
            } else {
                // Batman color palette (Yellow, Black/Dark, White)
                const rand = Math.random();
                this.color = rand > 0.5 ? '#f0c330' : (rand > 0.2 ? '#22223b' : '#ffffff');
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
        }

        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (!this.isSuperman) {
                // Batman shape (simple triangle/bat representation)
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size * 1.5, this.y + this.size);
                ctx.lineTo(this.x - this.size * 1.5, this.y + this.size);
            } else {
                // Superman shape (diamonds/shield approximation)
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size, this.y);
                ctx.lineTo(this.x, this.y + this.size);
                ctx.lineTo(this.x - this.size, this.y);
            }
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class Trail {
        constructor(x, y, isSuperman) {
            this.x = x;
            this.y = y;
            this.size = isSuperman ? 4 : 3;
            this.life = 1;
            this.decay = 0.05;
            this.color = isSuperman ? 'rgba(196, 18, 48, 0.4)' : 'rgba(240, 195, 48, 0.35)';
        }
        update() {
            this.life -= this.decay;
            this.size *= 0.9;
        }
        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function createBurst(x, y, isSuperman) {
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(x, y, isSuperman));
        }
    }

    function addTrailDot(x, y) {
        trails.push(new Trail(x, y, isSuperman));
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw trails
        for (let i = trails.length - 1; i >= 0; i--) {
            trails[i].update();
            trails[i].draw(ctx);
            if (trails[i].life <= 0) {
                trails.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Brush Effect Tracking for Profile Pic
    const profilePicsWrapper = document.querySelector('.profile-wrapper');
    if (profilePicsWrapper) {
        profilePicsWrapper.addEventListener('mousemove', (e) => {
            const rect = profilePicsWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            profilePicsWrapper.style.setProperty('--mouse-x', `${x}px`);
            profilePicsWrapper.style.setProperty('--mouse-y', `${y}px`);
        });
        profilePicsWrapper.addEventListener('mouseleave', () => {
             profilePicsWrapper.style.setProperty('--mouse-x', `-200px`);
             profilePicsWrapper.style.setProperty('--mouse-y', `-200px`);
        });
    }

    // Scroll Animation (Fade in elements)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => {
        observer.observe(el);
    });

    // Navbar Scrolled style
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightNav();
    });

    // Highlight Navbar link on scroll
    const sections = document.querySelectorAll('header, section');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNav() {
        let scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < (section.offsetTop + section.offsetHeight)) {
                let currentId = section.getAttribute('id');
                // Adjust for #hero / #about mapping
                if (currentId === 'hero') currentId = 'about';
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Mobile Navbar Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinksList.classList.toggle('open');
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinksList.classList.remove('open');
        });
    });

    // Typing Animation
    const roles = [
        "Full Stack Web Platforms",
        "Deep Learning Models",
        "Embedded Systems",
        "Scalable Architectures"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingTextEl = document.getElementById('typing-text');

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typingTextEl.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingTextEl.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 1500; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 300; // Pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }
    
    if (typingTextEl) {
        type();
    }

    // Stats Counter Animation
    const statNums = document.querySelectorAll('.stat-num');
    let countersStarted = false;

    function startCounters() {
        statNums.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const isFloat = stat.classList.contains('cgpa-num');
            let current = 0;
            const duration = 2000; // ms
            const stepTime = 30; // ms
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                if (isFloat) {
                    stat.textContent = current.toFixed(2);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, stepTime);
        });
    }

    // Trigger counters when section is in view
    const heroSection = document.getElementById('hero');
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                startCounters();
                countersStarted = true;
            }
        });
    }, { threshold: 0.1 });

    if (heroSection) {
        heroObserver.observe(heroSection);
    }

    // ================================================================
    //  CHATBOT
    // ================================================================
    const chatFab = document.getElementById('chatbot-fab');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chatbot-close');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatInput = document.getElementById('chatbot-input');
    const chatSend = document.getElementById('chatbot-send');
    const chatChips = document.getElementById('chatbot-chips');
    const fabAvatar = document.getElementById('chatbot-fab-avatar');
    const headerAvatar = document.getElementById('chatbot-header-avatar');
    const chatBotName = document.getElementById('chatbot-name');

    let chatOpen = false;
    let greeted = false;

    // -- Knowledge base --
    const KB = [
        {
            patterns: ['who are you', 'what are you', 'tell me about yourself', 'introduce', 'hello', 'hi', 'hey', 'start', 'namaste', 'howdy', 'greetings'],
            response: "👋 Hey! I'm <strong>Pranesh V's</strong> personal AI assistant — built right into this portfolio! Ask me about his skills, projects, patents, experience, or how to get in touch. What would you like to know? 🦇"
        },
        {
            patterns: ['education', 'college', 'university', 'b.tech', 'btech', 'degree', 'student', 'study', 'studying', 'institution', 'vsb', 'sengunthar', 'hsc', 'sslc', 'school'],
            response: "🎓 Pranesh is a B.Tech <strong>Information Technology</strong> student at <strong>V.S.B Engineering College</strong> (2023–2027) with a current CGPA of <strong>7.93</strong>. Coursework spans Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, Software Engineering, and Web Tech."
        },
        {
            patterns: ['skill', 'skills', 'tech stack', 'technologies', 'languages', 'know', 'expertise', 'specializ', 'proficient', 'capable'],
            response: "🛠️ Here's Pranesh's technical arsenal:\n\n• <strong>Languages:</strong> Python, Java, JavaScript, C, SQL\n• <strong>Web & Frameworks:</strong> React.js, Node.js, Express.js, HTML5, CSS3, REST APIs, WebSockets\n• <strong>AI & Data:</strong> Computer Vision, OpenCV, Deep Learning, RAG / LLMs, Hadoop, MapReduce, HDFS\n• <strong>Tools & Platforms:</strong> Git, GitHub, VS Code, Postman, Linux, Kali Linux, Arduino IDE\n• <strong>Embedded / IoT:</strong> ESP32, LoRa, GSM Modules"
        },
        {
            patterns: ['java', 'python', 'javascript', 'sql', 'programming', 'code', 'coding', 'language'],
            response: "💻 Pranesh is highly proficient in <strong>Python</strong> (used in AI, RAG, and CV projects) and <strong>Java</strong> (focusing heavily on DSA), followed by <strong>JavaScript</strong> for full-stack React/Node.js web development."
        },
        {
            patterns: ['ai', 'machine learning', 'ml', 'computer vision', 'cv', 'deep', 'neural', 'model', 'ollama', 'deepseek', 'rag', 'vector'],
            response: "🤖 AI, Machine Learning, and Computer Vision are Pranesh's core domains! He has built:\n\n• <strong>Hawk AI</strong> — Face recognition-based smart attendance using Smart Boards.\n• <strong>ClarifAI</strong> — A high-accuracy conference/event assistant using RAG (Retrieval-Augmented Generation) & Endee vector databases.\n• <strong>Space Debris Management System</strong> — Predictive analytics tracking debris orbits.\n• <strong>Project Shield</strong> — Embedded ML sensor alerts for grid break detection."
        },
        {
            patterns: ['patent', 'patents', 'filed', 'invention', 'inventions'],
            response: "🏆 Pranesh has filed <strong>two Indian Patents</strong>:\n\n1. <strong>Space Debris Management System (2024):</strong> Computational orbital model utilizing predictive analytics to catalog and prevent satellite collisions.\n2. <strong>Hawk AI — Automated Attendance (2025):</strong> Smart board camera deep learning solution that automates attendance via real-time face recognition."
        },
        {
            patterns: ['cybersecurity', 'security', 'hacking', 'kali', 'ethical hacking', 'kali linux', 'ddos', 'phishing', 'attack'],
            response: "🛡️ Pranesh has expertise in <strong>Ethical Hacking</strong> and system audits using Kali Linux. He is experienced in analyzing cybersecurity vulnerabilities and designing robust network topologies."
        },
        {
            patterns: ['internship', 'intern', 'experience', 'work', 'job', 'industry', 'wild bugs', 'freelancing', 'wildbugs', 'freelance'],
            response: "💼 Pranesh's professional experience includes:\n\n• <strong>Freelance Web Developer at Wild Bugs (2025 - Present):</strong> Designed and developed their official interactive landing page (<a href='https://wild-bugs.vercel.app/' target='_blank' style='color:inherit;text-decoration:underline'>wild-bugs.vercel.app</a>) using React.js, Tailwind CSS, and Vercel.\n• <strong>Full Stack Development Intern (2024):</strong> Developed responsive web modules, built RESTful APIs, and worked with cross-functional teams in Agile workflows."
        },
        {
            patterns: ['project', 'projects', 'work', 'built', 'created', 'made', 'developed', 'what have you done'],
            response: "🚀 Some of Pranesh's key projects include:\n\n1. <strong>Hawk AI</strong> — Smart Board face recognition attendance.\n2. <strong>Investigator</strong> — Multi-asset tracking and simulation dashboard with live APIs and AI mentor.\n3. <strong>ClarifAI</strong> — RAG semantic document query system.\n4. <strong>House</strong> — Immersive Harry Potter-themed competitive coding editor.\n5. <strong>Project Shield</strong> — IoT line breakage detection for disaster response.\n\nAsk me about any specific one! 🦇⚡"
        },
        {
            patterns: ['investigator', 'investig', 'portfolio tracker', 'stock', 'crypto', 'mutual fund', 'paper trad', 'websocket', 'mentor'],
            response: "📈 <strong>Investigator</strong> is a React & Node.js platform enabling:\n\n• Multi-asset portfolio tracking (Stocks, Crypto, Mutual Funds, commodities).\n• Interactive dashboard performance visualizations via Chart.js.\n• Real-time investment simulation with live market data.\n• Contextual AI investment advice & risk assessments."
        },
        {
            patterns: ['hawk ai', 'hawk', 'attendance', 'monitoring', 'cv monitoring', 'automated', 'computer vision', 'monitoring system', 'smart board'],
            response: "🎥 <strong>Hawk AI (Patent Filed 2025)</strong>:\n\nAn automated classroom monitoring system running entirely off existing smart board cameras with zero extra hardware. Uses convolutional neural networks (CNNs) for real-time face detection, recognition, and automated DB logs."
        },
        {
            patterns: ['clarifai', 'clarif', 'rag', 'vector database', 'semantic search', 'event'],
            response: "🔍 <strong>ClarifAI</strong> is a production-ready RAG application:\n\n• Acts as an event/conference coordinator AI assistant.\n• Employs an Endee vector database to index and search schedules, rulebooks, and FAQs.\n• Returns context-grounded, citation-mapped natural language replies with zero hallucinations."
        },
        {
            patterns: ['house', 'potter', 'wizard', 'code editor', 'judge0', 'online judge'],
            response: "🧙‍♂️ <strong>House</strong> is a dynamically themed Harry Potter competitive coding platform:\n\n• Fully immersive house-based selector (Gryffindor, Slytherin, etc.) with animated environments.\n• Real-time compiler integrating the Judge0 API.\n• Supports live leaderboards, contest timers, and lore-driven UX copywriting."
        },
        {
            patterns: ['project shield', 'shield', 'line breakage', 'ksebl', 'esp32', 'lora', 'gsm'],
            response: "⚡ <strong>Project Shield (Grid Guardians)</strong>:\n\nAn intelligent disaster mitigation platform for electrical grids:\n• Integrates ESP32 microcontroller sensors.\n• Uses ML anomaly detection to report LT power line breaks instantly.\n• Features automated GSM/LoRa alerts and remote circuit safety isolation."
        },
        {
            patterns: ['leadership', 'leader', 'coordinator', 'sih', 'smart india hackathon', 'symposium', 'kanal', 'event', 'manage'],
            response: "🏆 Leadership highlights:\n\n• <strong>Department Coordinator — SIH (Smart India Hackathon):</strong> Facilitated communications, team matching, and project mentorship.\n• <strong>Coordinator & Editor — Kanal'26:</strong> Led operations and planning for this technical symposium under high pressure."
        },
        {
            patterns: ['contact', 'email', 'reach', 'connect', 'hire', 'hiring', 'available', 'linkedin', 'github', 'social', 'leetcode', 'resume', 'cv', 'phone', 'mobile', 'call'],
            response: "📬 Connect with Pranesh V:\n\n• 📧 <a href='mailto:esppranesh@gmail.com' style='color:inherit;text-decoration:underline'>esppranesh@gmail.com</a>\n• 📞 +91 8807149866\n• 🐙 <a href='https://github.com/White-fang10/Portfolio' target='_blank' style='color:inherit;text-decoration:underline'>GitHub</a>\n• 💼 <a href='https://www.linkedin.com/in/pranesh-v-0451b0314' target='_blank' style='color:inherit;text-decoration:underline'>LinkedIn</a>\n• 💻 <a href='https://leetcode.com/u/praneshvenkidusamy/' target='_blank' style='color:inherit;text-decoration:underline'>LeetCode</a>\n• 📄 <a href='https://drive.google.com/file/d/1g83NPNC1Ti2-DgVSGLEd9N0yW2lpXK8S/view?usp=drivesdk' target='_blank' style='color:inherit;text-decoration:underline'>View Resume</a>"
        },
        {
            patterns: ['github', 'repository', 'code', 'open source', 'repo'],
            response: "🐙 Explore Pranesh's code at <a href='https://github.com/White-fang10/Portfolio' target='_blank' style='color:inherit;text-decoration:underline'>github.com/White-fang10/Portfolio</a>. You'll find source files for Investigator, ClarifAI, House, and more!"
        },
        {
            patterns: ['thank', 'thanks', 'thx', 'great', 'awesome', 'cool', 'nice', 'wow', 'perfect', 'good'],
            response: "😊 Happy to help! Feel free to ask me anything else about Pranesh, his patents, or his tech stacks. Don't hesitate to reach out to him via LinkedIn! 🦇⚡"
        },
        {
            patterns: ['bye', 'goodbye', 'see you', 'later', 'ciao', 'exit'],
            response: "👋 Goodbye! Enjoy exploring the rest of Pranesh's portfolio. 🦇"
        }
    ];

    const FALLBACK = "🤔 I'm not fully sure about that detail. Try asking about Pranesh's <strong>patents</strong>, <strong>skills</strong>, <strong>projects</strong>, <strong>internship</strong>, or how to <strong>contact</strong> him!";

    function findResponse(text) {
        const lower = text.toLowerCase();
        for (const entry of KB) {
            if (entry.patterns.some(p => lower.includes(p))) {
                return entry.response;
            }
        }
        return FALLBACK;
    }

    function appendMessage(html, role) {
        const bubble = document.createElement('div');
        bubble.className = `chat-msg ${role}`;
        bubble.innerHTML = html;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.id = 'chat-typing';
        el.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return el;
    }

    function botReply(text) {
        const typing = showTyping();
        const delay = 600 + Math.min(text.length * 5, 900);
        setTimeout(() => {
            typing.remove();
            appendMessage(findResponse(text), 'bot');
        }, delay);
    }

    function sendMessage(text) {
        text = text.trim();
        if (!text) return;
        appendMessage(text, 'user');
        chatInput.value = '';
        botReply(text);
    }

    // Avatar & label helpers
    function updateChatTheme() {
        const sup = document.body.classList.contains('superman-theme');
        const img = sup ? 'superman-bot.png' : 'batman-bot.png';
        const name = sup ? 'Man of Steel AI' : 'Dark Knight AI';
        fabAvatar.src = img;
        headerAvatar.src = img;
        chatBotName.textContent = name;
    }

    // Open / Close
    function openChat() {
        chatWindow.classList.remove('chatbot-hidden');
        chatOpen = true;
        chatInput.focus();
        if (!greeted) {
            greeted = true;
            setTimeout(() => {
                appendMessage("👋 Hey! I'm <strong>Pranesh's AI assistant</strong>. Ask me about his projects, skills, patents, or how to reach him!", 'bot');
            }, 350);
        }
    }

    function closeChat() {
        chatWindow.classList.add('chatbot-hidden');
        chatOpen = false;
        chatFab.classList.remove('chat-fly-away');
        void chatFab.offsetWidth; // reflow to restart animation
        chatFab.classList.add('chat-fly-away');
        setTimeout(() => chatFab.classList.remove('chat-fly-away'), 700);
    }

    chatFab.addEventListener('click', () => chatOpen ? closeChat() : openChat());
    chatClose.addEventListener('click', closeChat);

    chatSend.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(chatInput.value); });

    // Quick-reply chips
    chatChips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.textContent.replace(/^[^\s]+\s/, '').trim(); // strip emoji
            sendMessage(query);
        });
    });

    // Sync avatar when theme toggles
    themeToggle.addEventListener('change', () => {
        setTimeout(updateChatTheme, 650);
    });

    // Init avatar
    updateChatTheme();

    // Landing animation on page load
    setTimeout(() => {
        chatFab.style.opacity = '1';
        chatFab.classList.add('chat-landing');
        setTimeout(() => chatFab.classList.remove('chat-landing'), 950);
    }, 1200);

    // Make chatbot elements respond to custom cursor AND stay visible
    const chatbotInteractiveEls = [chatFab, chatClose, chatSend, ...chatChips.querySelectorAll('.chip')];
    chatbotInteractiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            customCursor.classList.add('cursor-hover');
            cursorFollower.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            customCursor.classList.remove('cursor-hover');
            cursorFollower.classList.remove('cursor-hover');
        });
    });

    // Ensure cursor is always visible when moving over the chat window
    chatWindow.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';
    });
    chatFab.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';
    });
});
