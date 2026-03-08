/* d:\portfolio\script.js */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('checkbox');
    const themeLabel = document.getElementById('theme-label');
    const customCursor = document.getElementById('custom-cursor');
    const body = document.body;

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
        const comicColor = isSuperman ? '#262626' : '#ed1d24'; // Opposite color of the current theme for high contrast "POW"
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
                themeLabel.textContent = "LIGHT MODE";
                isSuperman = true;
            } else {
                body.classList.remove('superman-theme');
                themeLabel.textContent = "DARK MODE";
                isSuperman = false;
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

    // Custom Cursor
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';

        // Add trail dot
        addTrailDot(e.clientX, e.clientY);
    });

    // Hover effects for links and buttons
    const links = document.querySelectorAll('a, button, .theme-switch, #chatbot-fab');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(2)';
            customCursor.style.backgroundColor = isSuperman ? 'var(--secondary-color)' : 'var(--primary-color)';
        });
        link.addEventListener('mouseleave', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            customCursor.style.backgroundColor = isSuperman ? 'var(--primary-color)' : 'var(--primary-color)';
        });
    });

    // Click effect (Burst)
    document.addEventListener('mousedown', (e) => {
        customCursor.classList.add('click-effect');
        setTimeout(() => customCursor.classList.remove('click-effect'), 200);
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

            // Themes: Superman has Red/Blue. Batman has Yellow/Dark Gray
            if (isSuperman) {
                this.color = Math.random() > 0.5 ? '#ed1d24' : '#005b9f';
                if (Math.random() > 0.8) this.color = '#ffc900';
            } else {
                this.color = Math.random() > 0.5 ? '#f0c330' : '#444444';
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
                // Batman shape (simple triangle/bat approx)
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size * 1.5, this.y + this.size);
                ctx.lineTo(this.x - this.size * 1.5, this.y + this.size);
            } else {
                // Superman shape (diamonds)
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
            this.color = isSuperman ? 'rgba(237, 29, 36, 0.5)' : 'rgba(240, 195, 48, 0.4)';
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

    // Scroll Animation (Fade in elements)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.skill-card, .project-card, .leadership-card');
    hiddenElements.forEach((el) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });

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
            response: "👋 Hey! I'm <strong>Pranesh V's</strong> personal AI assistant — built right into this portfolio! Ask me about his skills, projects, education, or how to get in touch. What would you like to know? 🦇"
        },
        {
            patterns: ['education', 'college', 'university', 'b.tech', 'btech', 'degree', 'student', 'study', 'studying', 'institution', 'sbec', 'sengunthar'],
            response: "🎓 Pranesh is a <strong>B.Tech Information Technology</strong> student. His coursework spans core CS, Big Data, AI/ML, Distributed Systems, and Cybersecurity — giving him a well-rounded technical foundation."
        },
        {
            patterns: ['skill', 'skills', 'tech stack', 'technologies', 'languages', 'know', 'expertise', 'specializ', 'proficient', 'capable'],
            response: "🛠️ Here's Pranesh's arsenal:\n\n• <strong>Programming:</strong> Java (DSA — trees, linked lists, strings), Python\n• <strong>Big Data:</strong> Hadoop, HDFS, MapReduce, Lamport's & Ricart-Agrawala algorithms\n• <strong>AI/ML:</strong> Computer Vision, local model deployment (DeepSeek via Ollama)\n• <strong>Cybersecurity:</strong> Ethical Hacking with Kali Linux\n• <strong>Testing:</strong> Black/White box, path & performance testing"
        },
        {
            patterns: ['java', 'python', 'programming', 'code', 'coding', 'language'],
            response: "💻 Pranesh codes primarily in <strong>Java</strong> (with a deep focus on Data Structures & Algorithms — binary trees, linked lists, string manipulation) and <strong>Python</strong> (used extensively in AI/ML projects)."
        },
        {
            patterns: ['hadoop', 'mapreduce', 'hdfs', 'big data', 'distributed', 'lamport', 'ricart'],
            response: "📦 Pranesh has hands-on experience with <strong>Hadoop, HDFS, and MapReduce</strong> for large-scale data processing. He also studied distributed algorithms like <strong>Lamport's Clocks</strong> and <strong>Ricart-Agrawala</strong> for mutual exclusion."
        },
        {
            patterns: ['ai', 'machine learning', 'ml', 'computer vision', 'cv', 'deep', 'neural', 'model', 'ollama', 'deepseek'],
            response: "🤖 AI & ML is one of Pranesh's strongest domains! He has built:\n\n• CV-powered automated classroom monitoring\n• Local AI model deployment with <strong>DeepSeek via Ollama</strong>\n• Guardian AI for traffic accident detection\n• AI Crop Recommendation system\n\nHe optimizes models for real hardware constraints."
        },
        {
            patterns: ['cybersecurity', 'security', 'hacking', 'kali', 'ethical hacking', 'kali linux', 'ddos', 'phishing', 'attack'],
            response: "🛡️ Pranesh has a solid Cybersecurity foundation:\n\n• <strong>Ethical Hacking</strong> using Kali Linux\n• Researched & proposed mitigation for <strong>DDoS & Phishing attacks</strong>\n• Software testing across black-box, white-box, path & performance methodologies"
        },
        {
            patterns: ['project', 'projects', 'work', 'built', 'created', 'made', 'developed', 'what have you done'],
            response: "🚀 Pranesh has built some impressive projects:\n\n1. <strong>InvestiGator</strong> — Multi-asset portfolio tracker + paper trader (Java, WebSockets, REST APIs)\n2. <strong>CV Monitoring System</strong> — AI-powered classroom attendance & engagement\n3. <strong>Project Shield / Grid Guardians</strong> — IoT + ML for LT line breakage detection (KSEBL)\n4. <strong>DeepFake Awareness</strong> — Research & presentations on AI ethics\n5. <strong>Smart EV Energy Optimizer</strong> — AI-driven EV sustainable energy system\n6. <strong>DDoS & Phishing Mitigation</strong> — Cybersecurity vulnerability analysis\n\nAsk me about any specific one! 🦇"
        },
        {
            patterns: ['investigator', 'investig', 'portfolio tracker', 'stock', 'crypto', 'mutual fund', 'paper trad', 'websocket'],
            response: "📈 <strong>InvestiGator</strong> is a full-stack financial app Pranesh built:\n\n• Tracks <strong>Crypto, Stocks, Mutual Funds, Commodities & FDs</strong>\n• Includes a <strong>live-data paper trading simulator</strong>\n• Bridges personal wealth management with financial literacy\n• Built with Java, WebSockets, REST APIs, and Databases"
        },
        {
            patterns: ['classroom', 'attendance', 'monitoring', 'cv monitoring', 'automated', 'computer vision', 'monitoring system'],
            response: "🎥 <strong>CV & ML-Powered Automated Monitoring</strong>:\n\nPranesh is spearheading an AI system that uses Computer Vision and Machine Learning to:\n• Automate <strong>attendance tracking</strong>\n• Monitor <strong>classroom engagement</strong>\n\nThis project showcases his applied AI/ML skills at a production level."
        },
        {
            patterns: ['grid guardian', 'shield', 'esp32', 'iot', 'ksebl', 'line breakage', 'disaster', 'power'],
            response: "⚡ <strong>Project Shield — Grid Guardians</strong>:\n\nAn intelligent disaster management platform built for <strong>KSEBL</strong> (Kerala State Electricity Board):\n• ESP32 IoT sensors for real-time field data\n• ML-based LT power line breakage detection\n• Automated emergency alerting system"
        },
        {
            patterns: ['deepfake', 'deep fake', 'fake', 'ethics', 'ai ethics', 'awareness', 'research'],
            response: "🎭 <strong>DeepFake Awareness Project</strong>:\n\nPranesh conducted comprehensive research on DeepFake technology and delivered presentations on:\n• The <strong>ethical implications</strong> of AI-generated media\n• <strong>Responsible usage</strong> guidelines for AI tools\n• Societal impact of synthetic media"
        },
        {
            patterns: ['ev', 'electric vehicle', 'energy', 'smart energy', 'sustainable', 'optimizer'],
            response: "🔋 <strong>Smart Energy Optimizer for EVs</strong>:\n\nPranesh engineered an AI-driven solution to:\n• <strong>Optimize energy consumption</strong> in electric vehicles\n• Focus on sustainable technology initiatives\n• Apply predictive AI models to real-world green tech"
        },
        {
            patterns: ['leadership', 'leader', 'coordinator', 'sih', 'smart india hackathon', 'symposium', 'kanal', 'event', 'manage'],
            response: "🏆 Pranesh has strong leadership credentials:\n\n• <strong>Dept. Coordinator — SIH (Smart India Hackathon)</strong>: Facilitated team formation, project ideation, and managed departmental operations for this national-level event.\n• <strong>Kanal'26 — Coordinator & Department Editor</strong>: Organized a technical symposium, demonstrating teamwork, event management, and leadership under pressure."
        },
        {
            patterns: ['contact', 'email', 'reach', 'connect', 'hire', 'hiring', 'available', 'linkedin', 'github', 'social', 'leetcode', 'resume', 'cv'],
            response: "📬 You can reach Pranesh through:\n\n• <a href='https://github.com/White-fang10' target='_blank' style='color:inherit;text-decoration:underline'>🐙 GitHub</a>\n• <a href='https://www.linkedin.com/in/pranesh-v-0451b0314' target='_blank' style='color:inherit;text-decoration:underline'>💼 LinkedIn</a>\n• <a href='https://leetcode.com/u/praneshvenkidusamy/' target='_blank' style='color:inherit;text-decoration:underline'>💻 LeetCode</a>\n• <a href='https://drive.google.com/file/d/1qC_5D1Uj1sW_ARTZdGv0n0olYie8w-Qt/view?usp=sharing' target='_blank' style='color:inherit;text-decoration:underline'>📄 View Resume</a>"
        },
        {
            patterns: ['github', 'repository', 'code', 'open source', 'repo'],
            response: "🐙 Check out Pranesh's GitHub at <a href='https://github.com/White-fang10' target='_blank' style='color:inherit;text-decoration:underline'>github.com/White-fang10</a> — you'll find his project source code and contributions there!"
        },
        {
            patterns: ['thank', 'thanks', 'thx', 'great', 'awesome', 'cool', 'nice', 'wow', 'perfect', 'good'],
            response: "😊 You're welcome! Feel free to ask me anything else about Pranesh. He'd love to hear from you too — don't hesitate to reach out via LinkedIn or GitHub! 🦇⚡"
        },
        {
            patterns: ['bye', 'goodbye', 'see you', 'later', 'ciao', 'exit'],
            response: "👋 Take care! If you ever want to know more about Pranesh's work, I'll be right here. 🦇"
        }
    ];

    const FALLBACK = "🤔 Hmm, I'm not sure about that one. Try asking about Pranesh's <strong>skills</strong>, <strong>projects</strong>, <strong>education</strong>, or <strong>contact info</strong>!";

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
                appendMessage("👋 Hey! I'm <strong>Pranesh's AI assistant</strong>. Ask me about his projects, skills, or how to reach him!", 'bot');
            }, 350);
        }
    }

    function closeChat() {
        chatWindow.classList.add('chatbot-hidden');
        chatOpen = false;
        // Fly-away animation on FAB when closing
        chatFab.classList.remove('chat-fly-away');
        void chatFab.offsetWidth; // reflow to restart animation
        chatFab.classList.add('chat-fly-away');
        setTimeout(() => chatFab.classList.remove('chat-fly-away'), 750);
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
        // Run after toggle has applied the class (slight delay)
        setTimeout(updateChatTheme, 650);
    });

    // Init avatar
    updateChatTheme();

    // ---- Landing animation on page load ----
    // Delay slightly so assets are ready
    setTimeout(() => {
        chatFab.style.opacity = '1';
        chatFab.classList.add('chat-landing');
        setTimeout(() => chatFab.classList.remove('chat-landing'), 950);
    }, 1200);

    // Make chatbot elements respond to custom cursor AND stay visible
    const chatbotInteractiveEls = [chatFab, chatClose, chatSend, ...chatChips.querySelectorAll('.chip')];
    chatbotInteractiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(2)';
        });
        el.addEventListener('mouseleave', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // Ensure cursor is always visible when moving over the chat window
    chatWindow.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });
    chatFab.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });

});
