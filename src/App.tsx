import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Menu as MenuIcon, 
  X, 
  Star,
  Quote,
  Send,
  Sparkles,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MENU_CATEGORIES = [
  {
    id: 'starters',
    name: 'Antipasti',
    items: [
      { name: 'Bruschetta Classica', price: '280 ETB', description: 'Toasted bread with fresh tomatoes, garlic, basil, and extra virgin olive oil.' },
      { name: 'Carpaccio di Manzo', price: '450 ETB', description: 'Thinly sliced raw beef, arugula, parmesan shavings, and lemon dressing.' },
      { name: 'Arancini Siciliani', price: '320 ETB', description: 'Crispy rice balls stuffed with ragu, mozzarella, and peas.' },
    ]
  },
  {
    id: 'mains',
    name: 'Primi & Secondi',
    items: [
      { name: 'Lasagna alla Bolognese', price: '550 ETB', description: 'Homemade pasta layers with rich meat sauce, béchamel, and parmesan. Our signature dish.', popular: true },
      { name: 'Risotto ai Funghi', price: '480 ETB', description: 'Creamy carnaroli rice with wild mushrooms and truffle oil.' },
      { name: 'Costolette di Agnello', price: '750 ETB', description: 'Grilled lamb chops with rosemary, garlic, and seasonal vegetables.' },
      { name: 'Pollo alla Cacciatora', price: '520 ETB', description: 'Traditional hunter-style chicken with tomatoes, olives, and herbs.' },
    ]
  },
  {
    id: 'desserts',
    name: 'Pasticceria & Dolci',
    items: [
      { name: 'Tiramisu Klasiko', price: '350 ETB', description: 'Classic Italian pick-me-up with espresso-soaked ladyfingers and mascarpone.' },
      { name: 'Lemon Delight', price: '320 ETB', description: 'Our famous refreshing lemon sponge with citrus cream and zest. Highly recommended.', special: true },
      { name: 'Bigne della Casa (Puffs)', price: '280 ETB', description: 'Assorted cream puffs filled with delicate Italian pastry cream.' },
      { name: 'Millefeuille Cake', price: '550 ETB', description: 'Crispy layers of puff pastry with diplomat cream.' },
      { name: 'Diplomatic Cake', price: '600 ETB', description: 'A sophisticated blend of sponge, puff pastry, and cream.' },
    ]
  }
];

const REVIEWS = [
  { name: "Sara T.", text: "The lasagna is honestly the best I've had in Addis. Authentic flavors and lovely atmosphere.", rating: 5 },
  { name: "Michael D.", text: "A hidden gem in Kazanchis. Great service and the lemon dessert is a must-try!", rating: 4 },
  { name: "Elena G.", text: "Perfect for a date night. The staff is very attentive and the wine selection is impressive.", rating: 5 }
];

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('mains');
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Benvenuti! I am your Belvedere concierge. Would you like a recommendation for dinner or perhaps something from our bakery?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsNavOpen(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `You are an elegant and helpful concierge for "Belvedere Restaurant" in Kazanchis, Addis Ababa. 
          The restaurant specializes in authentic Italian cuisine with an artisan bakery.
          Specialties: Lasagna alla Bolognese (best in town), Lemon Delight (famous dessert), Bigne, Millefeuille, and Diplomatic Cake.
          Location: Kazanchis, Kirkos, Kebele 75, Addis Ababa.
          Tone: Sophisticated, welcoming, and knowledgeable about Italian-Ethiopian dining.
          Keep responses concise and inviting.`
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I apologize, I'm having trouble connecting to my culinary notes. Please visit us to experience our flavors directly!" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm momentarily unavailable. Please check our menu or call us at +251 911 316533." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-gold selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-paper/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNavOpen(true)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden"
            >
              <MenuIcon className={`w-6 h-6 ${!scrolled && 'text-white'}`} />
            </button>
            <div className={`hidden lg:flex gap-8 text-sm uppercase tracking-[0.2em] font-medium ${scrolled ? 'text-ink' : 'text-white'}`}>
              <button onClick={() => scrollTo('about')} className="hover:text-gold transition-colors">About</button>
              <button onClick={() => scrollTo('menu')} className="hover:text-gold transition-colors">Menu</button>
              <button onClick={() => scrollTo('gallery')} className="hover:text-gold transition-colors">Gallery</button>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className={`text-3xl lg:text-4xl font-serif tracking-tighter leading-none cursor-pointer transition-colors ${scrolled ? 'text-ink' : 'text-white'}`} onClick={() => scrollTo('home')}>
              BELVEDERE
              <span className="block text-[10px] tracking-[0.4em] font-sans font-semibold mt-1 opacity-80 uppercase">Restaurant</span>
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className={`hidden lg:flex gap-8 text-sm uppercase tracking-[0.2em] font-medium ${scrolled ? 'text-ink' : 'text-white'}`}>
              <button onClick={() => scrollTo('contact')} className="hover:text-gold transition-colors">Contact</button>
            </div>
            <button 
              onClick={() => scrollTo('contact')}
              className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${
                scrolled ? 'bg-ink text-white hover:bg-gold' : 'border border-white hover:bg-white hover:text-ink'
              }`}
            >
              Reserve
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[60] bg-paper flex flex-col p-8 lg:hidden"
          >
            <button onClick={() => setIsNavOpen(false)} className="self-end p-2 mb-12">
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col gap-8 text-4xl font-serif">
              <button onClick={() => scrollTo('about')} className="text-left py-2 border-b border-ink/10">About</button>
              <button onClick={() => scrollTo('menu')} className="text-left py-2 border-b border-ink/10">Menu</button>
              <button onClick={() => scrollTo('gallery')} className="text-left py-2 border-b border-ink/10">Gallery</button>
              <button onClick={() => scrollTo('contact')} className="text-left py-2 border-b border-ink/10">Contact</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/belvedere-interior-luxury/1920/1080" 
            alt="Belvedere Dining" 
            className="w-full h-full object-cover brightness-[0.45]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-xs lg:text-sm uppercase tracking-[0.5em] mb-6 block font-medium text-gold/90">Best of Best | Kazanchis</span>
            <h2 className="text-6xl lg:text-[10rem] font-serif leading-[0.8] tracking-tighter mb-8">
              A Taste of <br/> 
              <span className="serif-italic ml-8 lg:ml-24">Authentic Italy</span>
            </h2>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mt-12">
              <button 
                onClick={() => scrollTo('menu')}
                className="group relative px-12 py-4 border border-white/30 text-sm uppercase tracking-widest overflow-hidden transition-all"
              >
                <span className="relative z-10">Discover Menu</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="absolute inset-0 z-20 flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300">Discover Menu</span>
              </button>
              <div className="flex items-center gap-4 text-sm font-medium tracking-wide">
                <div className="w-12 h-[1px] bg-gold/50"></div>
                <span>Premium Dining in Addis Ababa</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/50 text-[10px] uppercase tracking-[0.3em]"
        >
          Scroll
          <div className="w-[1px] h-12 bg-white/20"></div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-48 px-6 bg-paper">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold mb-6 block text-center lg:text-left">Our Philosophy</span>
              <h3 className="text-5xl lg:text-7xl font-serif leading-[1.1] tracking-tight mb-8 text-center lg:text-left">
                Where Italian Heritage Meets <span className="serif-italic">Ethiopian Warmth</span>
              </h3>
              <p className="text-lg text-ink/70 leading-relaxed mb-8 max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                Nestled in the heart of Kazanchis, Belvedere Restaurant has been a cornerstone of Addis Ababa's dining scene for years. We combine centuries of Italian culinary tradition with the vibrant, welcoming spirit of Ethiopia.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-8 mt-12 bg-white/50 p-8 rounded-3xl backdrop-blur-sm border border-link/5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl mb-1 text-ink group-hover:text-gold">Signature Lasagna</h4>
                    <p className="text-sm text-ink/60">Renowned as the city's finest, prepared with authentic Bolognese heritage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl mb-1 text-ink">Artisan Bakery</h4>
                    <p className="text-sm text-ink/60">Our in-house masters craft delicate Bigne and cakes fresh every morning.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl group">
                <img 
                  src="https://picsum.photos/seed/belvedere-chef/800/1000" 
                  alt="Chef preparing lasagna" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 hidden lg:block w-72 p-8 bg-ink text-white rounded-2xl shadow-2xl">
                <Quote className="w-10 h-10 text-gold mb-4 opacity-50" />
                <p className="text-sm font-serif italic mb-4 leading-relaxed">"True Italian cuisine is an act of love. We share that love with Kazanchis every day."</p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-gold opacity-50"></div>
                  <p className="text-[10px] uppercase tracking-widest text-gold">Master Patissier</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="bg-ink text-white py-24 lg:py-48 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold mb-6 block">The Menu Selection</span>
            <h3 className="text-5xl lg:text-7xl font-serif tracking-tight mb-8">Crafted for <span className="serif-italic">The Senses</span></h3>
            
            <div className="flex flex-wrap justify-center gap-10 mt-12 border-b border-white/10 pb-8">
              {MENU_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-sm uppercase tracking-[0.2em] transition-all relative pb-2 ${
                    activeCategory === cat.id ? 'text-gold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {cat.name}
                  {activeCategory === cat.id && (
                    <motion.div layoutId="categoryUnderline" className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gold" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid gap-12"
            >
              {MENU_CATEGORIES.find(c => c.id === activeCategory)?.items.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 border-b border-white/5 hover:bg-white/5 transition-colors rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="text-2xl font-serif group-hover:text-gold transition-colors">{item.name}</h4>
                      {item.popular && (
                        <span className="px-2 py-0.5 bg-gold/20 text-gold text-[10px] uppercase tracking-widest rounded-full">Popular Choice</span>
                      )}
                      {item.special && (
                        <span className="px-2 py-0.5 bg-gold/40 text-white text-[10px] uppercase tracking-widest rounded-full font-bold">House Special</span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 max-w-lg leading-relaxed font-light">{item.description}</p>
                  </div>
                  <div className="text-2xl font-serif text-gold tracking-tight">{item.price}</div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          <div className="mt-20 text-center">
            <button className="text-xs uppercase tracking-[0.3em] border border-white/20 text-white/60 px-12 py-4 rounded-full hover:text-gold hover:border-gold transition-all">
              View Seasonal Wine List
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 lg:py-48 px-6 bg-paper overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Visual Diary</span>
              <h3 className="text-4xl lg:text-6xl font-serif">The Belvedere <span className="serif-italic">Experience</span></h3>
            </div>
            <p className="text-ink/50 text-sm max-w-xs italic uppercase tracking-widest text-right">Capturing moments of culinary joy and Italian elegance.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl shadow-xl ${
                  i === 1 || i === 4 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <img 
                  src={`https://picsum.photos/seed/restaurant-${i+10}/800/1000`} 
                  alt={`Belvedere Gallery ${i}`} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Instagram className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Testimonials</span>
            <h3 className="text-3xl lg:text-5xl font-serif tracking-tight">Our Guests' <span className="serif-italic">Kind Words</span></h3>
          </div>
          <div className="flex flex-col lg:flex-row gap-12">
            {REVIEWS.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex-1 p-12 bg-white/5 border border-white/10 rounded-3xl relative"
              >
                <Quote className="absolute top-8 left-8 w-12 h-12 text-gold/10" />
                <div className="flex gap-1 mb-8 relative z-10">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-gold text-gold' : 'text-white/20'}`} />
                  ))}
                </div>
                <p className="text-xl font-serif italic mb-10 leading-relaxed relative z-10">"{review.text}"</p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-8 mt-auto">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-xs uppercase tracking-widest text-gold font-bold">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 lg:py-48 px-6 bg-paper">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold mb-6 block">Reservation</span>
              <h3 className="text-5xl lg:text-7xl font-serif mb-12">Secure Your <span className="serif-italic">Table</span></h3>
              
              <div className="space-y-12">
                <div className="flex gap-8 group">
                  <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold transition-all duration-500">
                    <MapPin className="w-6 h-6 text-gold group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h5 className="font-serif text-2xl mb-2">Location</h5>
                    <p className="text-ink/60 text-lg">Kazanchis, Kirkos area, Kebele 75<br/>Addis Ababa, Ethiopia</p>
                  </div>
                </div>
                <div className="flex gap-8 group">
                   <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold transition-all duration-500">
                    <Phone className="w-6 h-6 text-gold group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h5 className="font-serif text-2xl mb-2">Reservations</h5>
                    <p className="text-ink text-2xl font-medium tracking-tight hover:text-gold transition-colors cursor-pointer">+251 911 316533</p>
                    <p className="text-sm text-ink/40 mt-1 italic">Dinner reservations highly recommended.</p>
                  </div>
                </div>
                <div className="flex gap-8 group">
                   <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold transition-all duration-500">
                    <Clock className="w-6 h-6 text-gold group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h5 className="font-serif text-2xl mb-2">Service Hours</h5>
                    <div className="text-ink/60 space-y-1 text-lg">
                      <p>Open Daily: 11:30 AM — Midnight</p>
                      <p className="text-xs uppercase tracking-widest text-ink/30 italic">Kitchen closes 45 mins before midnight</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white p-12 lg:p-16 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] border border-ink/5"
            >
              <h4 className="text-4xl font-serif mb-12 text-center">Dining Inquiry</h4>
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40 ml-2">Name</label>
                    <input type="text" placeholder="Your Full Name" className="w-full p-5 bg-paper rounded-2xl border border-transparent focus:border-gold outline-none transition-all placeholder:text-ink/20" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40 ml-2">Guests</label>
                    <select className="w-full p-5 bg-paper rounded-2xl border border-transparent focus:border-gold outline-none transition-all appearance-none cursor-pointer">
                      <option>2 Persons</option>
                      <option>4 Persons</option>
                      <option>6+ Persons (Group)</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40 ml-2">Date</label>
                    <input type="date" className="w-full p-5 bg-paper rounded-2xl border border-transparent focus:border-gold outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40 ml-2">Time</label>
                    <input type="time" className="w-full p-5 bg-paper rounded-2xl border border-transparent focus:border-gold outline-none transition-all" />
                  </div>
                </div>
                <button className="w-full py-6 bg-ink text-white rounded-2xl uppercase tracking-[0.3em] text-xs font-bold hover:bg-gold transition-all shadow-xl active:scale-95 transform hover:-translate-y-1 block mt-8">
                  Request Reservation
                </button>
                <p className="text-[10px] text-center text-ink/30 italic uppercase tracking-widest leading-relaxed mt-8">
                  Submitting this request does not guarantee a table. <br/> Our head waiter will contact you shortly to confirm.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start border-b border-white/10 pb-20 mb-16 gap-16">
            <div className="max-w-sm">
              <h1 className="text-5xl font-serif tracking-tighter mb-8 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">BELVEDERE</h1>
              <p className="text-white/40 leading-relaxed mb-10 text-lg italic serif-italic">
                "Preserving the soul of Italian tradition in the heart of Addis Ababa since 1998."
              </p>
              <div className="flex gap-6">
                <a href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all group">
                  <Instagram className="w-5 h-5 text-white/40 group-hover:text-white" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all group">
                  <Facebook className="w-5 h-5 text-white/40 group-hover:text-white" />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-32">
              <div>
                <h6 className="uppercase tracking-[0.3em] text-[10px] font-bold text-gold mb-12">Restaurant</h6>
                <ul className="space-y-6 text-sm text-white/40 uppercase tracking-widest font-medium">
                  <li><button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">Our History</button></li>
                  <li><button onClick={() => scrollTo('menu')} className="hover:text-white transition-colors">Menu Selection</button></li>
                  <li><button onClick={() => scrollTo('gallery')} className="hover:text-white transition-colors">Gallery</button></li>
                  <li><button onClick={() => scrollTo('home')} className="hover:text-white transition-colors">Back to Top</button></li>
                </ul>
              </div>
              <div>
                <h6 className="uppercase tracking-[0.3em] text-[10px] font-bold text-gold mb-12">Contact</h6>
                <ul className="space-y-6 text-sm text-white/40 uppercase tracking-widest font-medium">
                  <li className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer"><Mail className="w-4 h-4" /> Reach Out</li>
                  <li className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer"><Phone className="w-4 h-4" /> Call Concierge</li>
                  <li className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer"><MapPin className="w-4 h-4" /> Find Us</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
            <p>© 2026 Belvedere Restaurant Kazanchis. All Rights Reserved.</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Privacy Selection</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Dining</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chat Concierge */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-[380px] max-h-[600px] bg-white rounded-[2rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-ink/5 mb-6"
            >
              <div className="bg-ink p-8 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-gold" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-ink" />
                  </div>
                  <div>
                    <span className="font-serif text-xl tracking-wide block">Belvedere Concierge</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 block mt-0.5">Online & Helpful</span>
                  </div>
                </div>
                <button 
                   onClick={() => setIsChatOpen(false)}
                   className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white/40 hover:text-white" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-paper/30">
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-gold text-white rounded-tr-none shadow-lg shadow-gold/20' : 'bg-white text-ink shadow-sm border border-black/5 rounded-tl-none font-medium'
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white p-5 rounded-[1.25rem] rounded-tl-none shadow-sm border border-black/5 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      <span className="text-[10px] text-ink/30 tracking-[0.2em] font-bold uppercase italic">Curating flavors...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-black/5 flex gap-4">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask for recommendations..."
                  className="flex-1 bg-paper px-6 py-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-ink/20"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !chatInput.trim()}
                  className="w-14 h-14 bg-ink text-white rounded-2xl flex items-center justify-center hover:bg-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`relative w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
            isChatOpen ? 'bg-ink text-white' : 'bg-gold text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            {isChatOpen ? (
               <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                 <X className="w-10 h-10" />
               </motion.div>
            ) : (
               <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="flex flex-col items-center">
                 <Sparkles className="w-9 h-9 mb-0.5" />
                 <span className="text-[7px] uppercase tracking-[0.3em] font-black">Concierge</span>
               </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
