import { Link } from "wouter";
import { Coffee, MapPin, Phone, Mail, Clock } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";

export function Footer() {
  return (
    <footer className="border-t bg-card" data-testid="section-footer">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/inicio">
              <span className="flex items-center gap-2 font-serif text-2xl font-semibold">
                <Coffee className="h-6 w-6 text-primary" />
                Café Encanto
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Cafés especiais, doces artesanais e salgados fresquinhos. Um lugar feito para você se sentir em casa.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                data-testid="link-instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5547988140013"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Cardápio</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/produtos?categoria=cafes">
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    Cafés Especiais
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=doces">
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    Doces & Sobremesas
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=salgados">
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    Salgados & Lanches
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=bebidas">
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    Bebidas Frias
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/promocoes">
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    Ofertas do Dia
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Informações</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Política de Trocas
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Contato</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Itajaí<br />
                  Santa Catarina
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+5547988140013" className="text-muted-foreground hover:text-foreground">(47) 98814-0013</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:contato@cafeencanto.com" className="text-muted-foreground hover:text-foreground">contato@cafeencanto.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Seg–Sex: 7h às 19h<br />
                  Sáb–Dom: 8h às 17h
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground md:flex-row">
            <p>© 2025 Café Encanto. Todos os direitos reservados.</p>
            <p className="text-xs">Feito com ☕ e muito carinho em Itajaí, SC</p>
          </div>
          <div className="mt-4 flex justify-center">
            <Link href="/admin">
              <span className="text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground" data-testid="link-admin">
                Acesso Administrativo
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
