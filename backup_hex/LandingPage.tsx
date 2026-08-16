import React, { useState, useEffect } from "react";
import { 
  Cake, Cookie, Coffee, Heart, Star, MapPin, Phone, 
  Instagram, MessageCircle, ChevronRight, Menu, X, 
  Clock, Award, Truck, Sparkles, ArrowRight
} from "lucide-react";

const MENU_HIGHLIGHTS = [
  { name: "Tortas Personalizadas", description: "Diseños únicos para tus momentos especiales", icon: Cake, priceDesde: "S/. 85" },
  { name: "Galletas Artesanales", description: "Deliciosas galletas con sabores irresistibles", icon: Cookie, priceDesde: "S/. 3" },
  { name: "Pasteles Creativos", description: "Obras de arte comestibles que sorprenden", icon: Sparkles, priceDesde: "S/. 120" },
  { name: "Café & Bebidas", description: "Acompaña tus dulces con nuestra selección", icon: Coffee, priceDesde: "S/. 8" },
];

const TESTIMONIALS = [
  { name: "María García", text: "¡Las mejores tortas de Cusco! El diseño fue increíble y el sabor espectacular.", rating: 5 },
  { name: "Carlos Quispe", text: "Pedí galletas para una fiesta y todos quedaron encantados. ¡Volveré a pedir!", rating: 5 },
  { name: "Ana Torres", text: "La atención es excelente y los productos son de primera calidad. 100% recomendado.", rating: 5 },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-art-bg">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 md:left-72 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-art-border">
                <img src="/src/assets/images/Emblema%20Flikicookie.png" alt="Flikicookie" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-art-accent">FlikiCookie</h1>
                <p className="text-[10px] text-art-muted tracking-wider">ARTISAN BAKERY</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Inicio", id: "hero" },
                { label: "Nosotros", id: "about" },
                { label: "Menú", id: "menu" },
                { label: "Opiniones", id: "testimonials" },
                { label: "Contacto", id: "contact" },
              ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-[15px] font-semibold text-art-muted hover:text-art-accent transition-colors cursor-pointer"
                  >
                  {item.label}
                </button>
              ))}
              <a
                href="https://wa.me/51970442173"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-art-accent hover:bg-art-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" /> Pedir Ahora
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-art-border-10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-art-muted" /> : <Menu className="w-6 h-6 text-art-muted" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
          {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-art-border shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {["Inicio", "Nosotros", "Menú", "Opiniones", "Contacto"].map((label) => (
                <button
                  key={label}
                  onClick={() => scrollToSection(label.toLowerCase() === "inicio" ? "hero" : label.toLowerCase() === "nosotros" ? "about" : label.toLowerCase() === "opiniones" ? "testimonials" : label.toLowerCase())}
                  className="block w-full text-left px-4 py-3 rounded-lg text-art-muted hover:bg-art-border-10 transition-colors font-medium"
                >
                  {label}
                </button>
              ))}
              <a
                href="https://wa.me/51970442173"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-art-accent text-white text-center px-4 py-3 rounded-full font-bold"
              >
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E5A84B' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-art-border-10 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-art-border" />
                <span className="text-sm font-medium text-art-muted">Cusco, Perú</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-art-muted">Momentos</span>
                <br />
                <span className="text-art-accent">Dulces</span>
                <br />
                <span className="text-art-muted">Inolvidables</span>
              </h1>
              
              <p className="text-lg text-art-muted max-w-lg leading-relaxed">
                En FlikiCookie creamos tortas, galletas y pasteles artesanales que convierten cada celebración en un recuerdo especial. 
                <span className="font-bold text-art-text"> Hechos con amor en Cusco.</span>
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://wa.me/51970442173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-art-accent hover:bg-art-accent-hover text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-art-accent/30"
                >
                  <MessageCircle className="w-5 h-5" /> Pedir Ahora
                </a>
                <button
                  onClick={() => scrollToSection("menu")}
                  className="border-2 border-art-border text-art-muted px-8 py-4 rounded-full font-bold text-lg hover:bg-art-border hover:text-art-bg transition-all"
                >
                  Ver Menú
                </button>
              </div>
              
                <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-art-accent">500+</p>
                  <p className="text-sm font-semibold text-art-muted">Clientes Felices</p>
                </div>
                <div className="w-px h-12 bg-art-border-10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-art-accent">4.9</p>
                  <p className="text-sm font-semibold text-art-muted">Rating Promedio</p>
                </div>
                <div className="w-px h-12 bg-art-border-10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-art-accent">5+</p>
                  <p className="text-sm font-semibold text-art-muted">Años de Experiencia</p>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Logo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Decorative circles */}
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-art-border-10 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-art-accent-10 rounded-full blur-3xl" />
                
                <div className="relative bg-gradient-to-br from-art-bg to-art-panel p-8 rounded-[40px] shadow-2xl border-4 border-art-border/20">
                  <img 
                    src="/src/assets/images/Emblema%20Flikicookie.png"
                    alt="Flikicookie Artisan Bakery" 
                    className="w-80 h-80 lg:w-96 lg:h-96 object-cover rounded-[30px]"
                  />
                  
                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-art-border fill-art-border" />
                    <span className="text-sm font-bold text-art-muted">4.9 Rating</span>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-art-accent rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                    <Phone className="w-4 h-4 text-art-bg" />
                    <span className="text-sm font-bold text-art-bg">WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-art-border flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-art-border rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-art-accent-10 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-art-accent" />
                <span className="text-sm font-medium text-art-accent">Nuestra Historia</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-art-muted leading-tight">
                Tradición y Pasión
                <br />
                <span className="text-art-accent">en Cada Bocado</span>
              </h2>
              
              <p className="text-art-muted leading-relaxed text-[16px]">
                FlikiCookie nació del amor por la repostería artesanal en el corazón de Cusco.
                Combinamos técnicas tradicionales con toques modernos para crear piezas únicas 
                que cuentan historias a través de sus sabores.
              </p>
              
              <p className="text-[#3D2B1F] leading-relaxed text-[16px]">
                Cada torta, cada galleta, cada pieza es elaborada con ingredientes de primera calidad 
                y mucho amor. Nuestro objetivo es endulzar tus momentos más especiales.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-art-border-10 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-art-border" />
                  </div>
                  <div>
                    <h4 className="font-bold text-art-muted">Calidad Premium</h4>
                    <p className="text-sm text-art-muted">Ingredientes seleccionados</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-art-accent-10 rounded-xl flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-art-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-art-muted">Entrega Segura</h4>
                    <p className="text-sm text-art-muted">A todo Cusco y alrededores</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="gradient-art p-8 rounded-3xl text-white shadow-xl">
                <p className="text-5xl font-bold">500+</p>
                <p className="text-white/80 mt-2">Tortas Entregadas</p>
              </div>
              <div className="gradient-art p-8 rounded-3xl text-white shadow-xl mt-8">
                <p className="text-5xl font-bold">5000+</p>
                <p className="text-white/80 mt-2">Galletas Horneadas</p>
              </div>
              <div className="bg-gradient-to-br from-art-border to-art-border p-8 rounded-3xl text-white shadow-xl">
                <p className="text-5xl font-bold">100%</p>
                <p className="text-white/80 mt-2">Clientes Satisfechos</p>
              </div>
              <div className="bg-gradient-to-br from-art-accent to-art-accent-hover p-8 rounded-3xl text-white shadow-xl mt-8">
                <p className="text-5xl font-bold">24h</p>
                <p className="text-white/80 mt-2">Pedido Mínimo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-gradient-to-b from-art-bg to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-art-border-10 px-4 py-2 rounded-full mb-4">
              <Cookie className="w-4 h-4 text-art-border" />
              <span className="text-sm font-semibold text-art-muted">Nuestros Productos</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-art-muted">
              Delicias <span className="text-art-accent">Artesanales</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MENU_HIGHLIGHTS.map((item, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-[#E5A84B]/10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#E91E8C] to-[#D1177D] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2D1F15] mb-2">{item.name}</h3>
                <p className="text-[#4A3728] text-[15px] mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#E91E8C] font-bold text-[16px]">Desde {item.priceDesde}</span>
                  <ChevronRight className="w-5 h-5 text-[#E5A84B] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a
              href="https://wa.me/51970442173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E91E8C] hover:bg-[#D1177D] text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
            >
              Ver Catálogo Completo <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#E91E8C]/10 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-[#E91E8C]" />
              <span className="text-sm font-semibold text-[#E91E8C]">Testimonios</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D1F15]">
              Lo Que Dicen <span className="text-[#E91E8C]">Nuestros Clientes</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-[#FDF8F3] to-white p-8 rounded-3xl shadow-lg border border-[#E5A84B]/10 relative"
              >
                <div className="absolute -top-4 left-8">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#E5A84B] fill-[#E5A84B]" />
                    ))}
                  </div>
                </div>
                <p className="text-[#2D1F15] mt-4 mb-6 italic text-[15px]">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E91E8C] to-[#D1177D] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#2D1F15]">{testimonial.name}</p>
                    <p className="text-sm text-[#4A3728]">Cliente Verificada</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-b from-[#FDF8F3] to-[#F5E6C8]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#25D366]/10 px-4 py-2 rounded-full">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className="text-sm font-medium text-[#25D366]">Contáctanos</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-[#2D1F15] leading-tight">
                Hablemos de Tu
                <br />
                <span className="text-[#E91E8C]">Próximo Pedido</span>
              </h2>
              
              <p className="text-[#3D2B1F] leading-relaxed text-[16px]">
                ¿Tienes una celebración especial? Escríbenos y con gusto te atenderemos. 
                Estamos aquí para hacer realidad tus ideas más dulces.
              </p>
              
              <div className="space-y-6">
                <a 
                  href="https://wa.me/51970442173" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-[#25D366] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2D1F15] text-[16px]">WhatsApp</p>
                    <p className="text-[#4A3728]">+51 970 442 173</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#25D366] ml-auto group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="https://instagram.com/flikicookie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E91E8C] to-[#C13584] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Instagram className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2D1F15] text-[16px]">Instagram</p>
                    <p className="text-[#4A3728]">@flikicookie</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#E91E8C] ml-auto group-hover:translate-x-1 transition-transform" />
                </a>
                
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
                  <div className="w-14 h-14 bg-[#E5A84B] rounded-xl flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2D1F15] text-[16px]">Ubicación</p>
                    <p className="text-[#4A3728]">Cusco, Perú</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
                  <div className="w-14 h-14 bg-[#2D1F15] rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2D1F15] text-[16px]">Horario</p>
                    <p className="text-[#4A3728]">Lun - Sáb: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map/Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#E91E8C] to-[#D1177D] p-1 rounded-3xl shadow-2xl">
                <img 
                  src="/src/assets/images/Emblema%20Flikicookie.png"
                  alt="Flikicookie" 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center animate-pulse">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8B7355]">¿Listo para ordenar?</p>
                    <p className="font-bold text-[#5D4E37]">Llámanos ahora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#E91E8C] to-[#D1177D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para Endulzar tu Día?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Escríbenos por WhatsApp y hagamos realidad tu pedido. ¡Te esperamos!
          </p>
          <a
            href="https://wa.me/51970442173?text=Hola!%20Me%20gustaría%20hacer%20un%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-[#E91E8C] px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl"
          >
            <MessageCircle className="w-6 h-6" /> Pedir por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-art-panel text-art-text py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E5A84B]">
                  <img src="/src/assets/images/Emblema%20Flikicookie.png" alt="Flikicookie" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#E91E8C]">FlikiCookie</h3>
                  <p className="text-[11px] text-art-muted tracking-wider font-semibold">ARTISAN BAKERY</p>
                </div>
              </div>
              <p className="text-art-muted text-[14px]">
                Creando momentos dulces e inolvidables en Cusco desde 2019.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-art-border mb-4 text-[15px]">Menú</h4>
              <ul className="space-y-2 text-art-muted text-[14px]">
                <li><a href="#menu" className="hover:text-[#E91E8C] transition-colors">Tortas Personalizadas</a></li>
                <li><a href="#menu" className="hover:text-[#E91E8C] transition-colors">Galletas Artesanales</a></li>
                <li><a href="#menu" className="hover:text-[#E91E8C] transition-colors">Pasteles Creativos</a></li>
                <li><a href="#menu" className="hover:text-[#E91E8C] transition-colors">Café & Bebidas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-art-border mb-4 text-[15px]">Contacto</h4>
              <ul className="space-y-2 text-art-muted text-[14px]">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> +51 970 442 173
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> @flikicookie
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Cusco, Perú
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-art-border mb-4 text-[15px]">Horario</h4>
              <ul className="space-y-2 text-art-muted text-[14px]">
                <li>Lunes - Viernes: 9:00 AM - 7:00 PM</li>
                <li>Sábado: 9:00 AM - 5:00 PM</li>
                <li>Domingo: Cerrado</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-art-border mt-12 pt-8 text-center">
            <p className="text-art-muted text-[13px]">
              © {new Date().getFullYear()} FlikiCookie Artisan Bakery. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/51970442173?text=Hola!%20Vengo%20de%20la%20página%20web"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BA5C] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50"
      >
        <MessageCircle className="w-8 h-8" />
      </a>
    </div>
  );
}
