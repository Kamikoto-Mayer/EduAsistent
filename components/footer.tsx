import Link from 'next/link'
import { Brain, Heart } from 'lucide-react'

const footerLinks = {
  navigation: [
    { name: 'Главная', href: '/' },
    { name: 'Проверка заданий', href: '/check' },
    { name: 'О проекте', href: '/about' },
  ],
  sections: [
    { name: 'Возможности', href: '/#features' },
    { name: 'Как это работает', href: '/#how-it-works' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                Эду<span className="text-primary">Ассистент</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Интеллектуальная система проверки домашних заданий на базе нейросетей 
              для российских преподавателей.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Конкурс «Моя страна — моя Россия»
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Навигация</h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Sections */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Разделы</h3>
            <ul className="space-y-3">
              {footerLinks.sections.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            2026 ЭдуАссистент. Все права защищены.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Сделано с <Heart className="h-3 w-3 text-destructive fill-destructive" /> в России
          </p>
        </div>
      </div>
    </footer>
  )
}
