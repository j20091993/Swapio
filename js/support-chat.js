/* Swapio — Fake live support chat (site-scoped assistant) */

const SUPPORT_CHAT = {
  agentName: 'Swapio Support',
  welcomeDelay: 900,
  typingMin: 700,
  typingMax: 1800,
};

const OFF_TOPIC_REPLY =
  "I'm here to help with Swapio — gift card swaps, payouts, fees, and how the site works. I can't help with personal account details here. For that, email support@swapio.cc with your order code (SWP-XXXXXX).";

const QUICK_REPLIES = [
  'How does Swapio work?',
  'What payout methods do you offer?',
  'Which gift cards are accepted?',
  'How long do payouts take?',
];

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s$%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function formatBrandList(limit = 12) {
  const brands = SWAPIO.giftCards.slice(0, limit);
  return `${brands.join(', ')}, and more`;
}

function generateSupportReply(message) {
  const text = normalizeText(message);

  if (!text) {
    return 'Ask me anything about Swapio — how swaps work, payout methods, fees, or accepted brands.';
  }

  const personalPatterns = [
    'my order', 'my account', 'my email', 'my password', 'my card number',
    'my payout', 'track my', 'where is my', 'status of my', 'login issue',
    'sign in', 'sign up', 'reset password', 'my submission', 'my swap',
    'order code swp', 'swp-', 'phone number', 'address', 'ssn', 'social security',
    'credit card', 'debit card', 'bank account number', 'routing number',
  ];

  if (includesAny(text, personalPatterns)) {
    return OFF_TOPIC_REPLY;
  }

  const offTopicPatterns = [
    'weather', 'recipe', 'joke', 'poem', 'stock', 'crypto price', 'bitcoin price',
    'who are you', 'what is ai', 'write code', 'homework', 'dating', 'relationship',
    'politics', 'president', 'movie', 'song', 'sport', 'football', 'basketball',
    'valorant', 'riot shop', 'fortnite vbucks', 'roblox hack',
  ];

  if (includesAny(text, offTopicPatterns)) {
    return "I can only answer questions about Swapio and swapping gift cards for cash. Try asking about our process, fees, payout methods, or accepted brands.";
  }

  if (includesAny(text, ['hello', 'hi ', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
    return "Hi there! I'm Swapio Support. I can walk you through how swaps work, payout options, fees, and accepted brands. What would you like to know?";
  }

  if (includesAny(text, ['thank', 'thanks', 'thx', 'appreciate'])) {
    return "You're welcome! If you have more Swapio questions, I'm here. Ready to swap? Start on the homepage or visit /sell-gift-card/.";
  }

  if (includesAny(text, ['contact', 'email', 'reach', 'human', 'real person', 'talk to someone'])) {
    return `For direct help, email ${SWAPIO.supportEmail} or use our Reach Us page at /contact. Include your order code (SWP-XXXXXX) if you have an active swap.`;
  }

  if (includesAny(text, ['fee', 'percent', '5%', '95%', 'how much', 'rate', 'offer', 'payout amount'])) {
    return `Swapio pays ${SWAPIO.payoutPercent}% of your card balance — a flat ${SWAPIO.serviceFeePercent}% service fee shown upfront before you submit. A $100 card pays out $${SWAPIO.payoutPercent}.`;
  }

  if (includesAny(text, ['payout', 'paypal', 'cash app', 'zelle', 'venmo', 'bitcoin', 'bank transfer', 'ach', 'get paid', 'payment method'])) {
    return `We support six payout methods: ${SWAPIO.payoutMethods.join(', ')}. Choose your preferred method when starting a swap. Most payouts land within hours after verification.`;
  }

  if (includesAny(text, ['how long', 'timing', 'time', 'hours', 'fast', 'speed', 'when do i get', 'wait'])) {
    return 'Most swaps are verified and paid within hours. After submitting, you receive an order code (SWP-XXXXXX) to track your swap. Complex cases may take up to 24 hours.';
  }

  if (includesAny(text, ['safe', 'scam', 'legit', 'trust', 'secure', 'verify', 'verification'])) {
    return 'Swapio verifies every card before payout. All submissions use encrypted HTTPS, and your exact cash offer is shown before you commit. We never sell your personal information.';
  }

  if (includesAny(text, ['minimum', 'maximum', 'limit', 'balance', '$10', '$5000', '10 dollar', '5000'])) {
    return 'Accepted card balances range from $10 to $5,000. Enter your balance on the homepage to see your exact cash offer before submitting.';
  }

  if (includesAny(text, ['brand', 'accept', 'which card', 'what card', 'amazon', 'apple', 'steam', 'visa', 'gift card'])) {
    return `We accept 60+ brands including ${formatBrandList()}. Use the brand search on the homepage to confirm yours.`;
  }

  if (includesAny(text, ['how does', 'how it work', 'how do i', 'process', 'steps', 'start', 'submit', 'swap'])) {
    return 'Four steps: (1) Choose your gift card brand and balance, (2) see your 95% cash offer, (3) submit card and payout details securely, (4) get paid after verification — usually within hours. Start at /sell-gift-card/ or the homepage swap box.';
  }

  if (includesAny(text, ['order code', 'swp', 'track', 'reference', 'confirmation'])) {
    return 'After submitting, you receive a unique order code like SWP-XXXXXX. Save it to reference your swap. For order-specific help, email support@swapio.cc with that code.';
  }

  if (includesAny(text, ['account', 'dashboard', 'log in', 'login', 'sign up', 'signup', 'register'])) {
    return 'You can create a free account to track submissions in your dashboard at /dashboard.html. Logging in is optional — you can swap without an account and use your order code to follow up.';
  }

  if (includesAny(text, ['what is swapio', 'about swapio', 'who is swapio', 'swapio'])) {
    return 'Swapio turns unused gift cards into real cash. Sellers receive 95% of card value via PayPal, Cash App, Zelle, Venmo, Bitcoin, or bank transfer. 60+ brands accepted with transparent fees and fast payouts.';
  }

  if (includesAny(text, ['guide', 'faq', 'article', 'help'])) {
    return 'Check our Guide at /guide, FAQ at /faq, and Articles at /articles/ for detailed walkthroughs on selling gift cards safely and getting the best cash value.';
  }

  return "I'm not sure about that one. I can help with Swapio swaps, payout methods, fees, timing, accepted brands, and safety. For personal order help, email support@swapio.cc.";
}

function getSupportChatHtml() {
  return `
    <div id="support-chat-root" class="support-chat-root" aria-live="polite">
      <button
        type="button"
        id="support-chat-toggle"
        class="support-chat-toggle"
        aria-expanded="false"
        aria-controls="support-chat-panel"
        aria-label="Open support chat"
      >
        <svg class="support-chat-toggle-icon support-chat-toggle-icon--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <svg class="support-chat-toggle-icon support-chat-toggle-icon--close hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span class="support-chat-toggle-pulse" aria-hidden="true"></span>
      </button>

      <div id="support-chat-panel" class="support-chat-panel hidden" role="dialog" aria-label="Swapio support chat">
        <div class="support-chat-header">
          <div class="support-chat-header-info">
            <img src="${SWAPIO.appleTouchIconPath}" alt="" class="support-chat-avatar" width="36" height="36">
            <div>
              <p class="support-chat-agent">${SUPPORT_CHAT.agentName}</p>
              <p class="support-chat-status"><span class="support-chat-online-dot" aria-hidden="true"></span> Online now</p>
            </div>
          </div>
          <button type="button" id="support-chat-close" class="support-chat-close" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div id="support-chat-messages" class="support-chat-messages" role="log" aria-relevant="additions"></div>

        <div class="support-chat-quick-replies" id="support-chat-quick-replies">
          ${QUICK_REPLIES.map((label) => `<button type="button" class="support-chat-quick-btn" data-quick="${label}">${label}</button>`).join('')}
        </div>

        <form id="support-chat-form" class="support-chat-form">
          <input
            type="text"
            id="support-chat-input"
            class="support-chat-input"
            placeholder="Ask about Swapio..."
            autocomplete="off"
            maxlength="500"
            aria-label="Message"
          >
          <button type="submit" class="support-chat-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;
}

function appendChatMessage(container, { text, sender, isTyping = false }) {
  const row = document.createElement('div');
  row.className = `support-chat-message support-chat-message--${sender}${isTyping ? ' support-chat-message--typing' : ''}`;

  if (isTyping) {
    row.innerHTML = `
      <div class="support-chat-bubble support-chat-bubble--agent">
        <span class="support-chat-typing" aria-label="Support is typing">
          <span></span><span></span><span></span>
        </span>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="support-chat-bubble support-chat-bubble--${sender === 'user' ? 'user' : 'agent'}">${escapeChatHtml(text)}</div>
    `;
  }

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

function escapeChatHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function randomTypingDelay() {
  return SUPPORT_CHAT.typingMin + Math.random() * (SUPPORT_CHAT.typingMax - SUPPORT_CHAT.typingMin);
}

function setChatOpen(isOpen) {
  const toggle = document.getElementById('support-chat-toggle');
  const panel = document.getElementById('support-chat-panel');
  const iconOpen = toggle?.querySelector('.support-chat-toggle-icon--open');
  const iconClose = toggle?.querySelector('.support-chat-toggle-icon--close');
  if (!toggle || !panel) return;

  panel.classList.toggle('hidden', !isOpen);
  panel.classList.toggle('support-chat-panel--open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Close support chat' : 'Open support chat');
  iconOpen?.classList.toggle('hidden', isOpen);
  iconClose?.classList.toggle('hidden', !isOpen);

  if (isOpen) {
    document.getElementById('support-chat-input')?.focus();
  }
}

function initSupportChat() {
  if (document.getElementById('support-chat-root')) return;

  document.body.insertAdjacentHTML('beforeend', getSupportChatHtml());

  const toggle = document.getElementById('support-chat-toggle');
  const closeBtn = document.getElementById('support-chat-close');
  const panel = document.getElementById('support-chat-panel');
  const messages = document.getElementById('support-chat-messages');
  const form = document.getElementById('support-chat-form');
  const input = document.getElementById('support-chat-input');
  const quickReplies = document.getElementById('support-chat-quick-replies');

  let welcomed = false;
  let responding = false;

  const sendAgentReply = (text) => {
    const typingRow = appendChatMessage(messages, { sender: 'agent', isTyping: true });

    setTimeout(() => {
      typingRow.remove();
      appendChatMessage(messages, { sender: 'agent', text });
      responding = false;
      input.disabled = false;
      input.focus();
    }, randomTypingDelay());
  };

  const handleUserMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || responding) return;

    appendChatMessage(messages, { sender: 'user', text: trimmed });
    input.value = '';
    input.disabled = true;
    responding = true;

    const reply = generateSupportReply(trimmed);
    sendAgentReply(reply);
  };

  const maybeWelcome = () => {
    if (welcomed) return;
    welcomed = true;
    setTimeout(() => {
      sendAgentReply("Hi! I'm Swapio Support. Ask me about how swaps work, payout methods, fees, or accepted brands — I'm happy to help.");
    }, SUPPORT_CHAT.welcomeDelay);
  };

  toggle?.addEventListener('click', () => {
    const isOpen = panel?.classList.contains('support-chat-panel--open');
    setChatOpen(!isOpen);
    if (!isOpen) maybeWelcome();
  });

  closeBtn?.addEventListener('click', () => setChatOpen(false));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserMessage(input.value);
  });

  quickReplies?.querySelectorAll('[data-quick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!panel.classList.contains('support-chat-panel--open')) {
        setChatOpen(true);
        maybeWelcome();
      }
      handleUserMessage(btn.dataset.quick);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel?.classList.contains('support-chat-panel--open')) {
      setChatOpen(false);
    }
  });
}