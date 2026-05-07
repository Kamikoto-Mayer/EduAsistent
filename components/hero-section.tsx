import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, BookOpen, CheckCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative isolate pt-24 lg:pt-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Конкурс «Моя страна — моя Россия»
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            Интеллектуальный{' '}
            <span className="gradient-text">AI-помощник</span>{' '}
            для преподавателей
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto text-pretty">
            Революционная платформа на базе нейросетей для автоматизированной проверки домашних заданий. 
            Экономьте время, повышайте качество обратной связи и сосредоточьтесь на главном — обучении.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/check">
              <Button size="lg" className="gap-2 text-base px-8 py-6 glow-primary">
                Начать проверку
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6">
                Узнать больше
              </Button>
            </Link>
          </div>

          {/* Features preview */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Анализ за секунды</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Детальная обратная связь</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Поддержка всех предметов</span>
            </div>
          </div>
        </div>

        {/* Demo preview */}
        <div className="mt-16 sm:mt-24 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl rounded-3xl" />
            
            {/* Card */}
            <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 lg:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 h-8 rounded-lg bg-muted/50 flex items-center px-4">
                  <span className="text-xs text-muted-foreground">eduassist.ru/check</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left side - input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Текст работы ученика
                  </div>
                  <div className="h-48 rounded-xl bg-muted/30 border border-border/50 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Сочинение на тему «Весна в моём городе»
                    </p>
                    <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
                      Весна пришла в наш город незаметно. Сначала стал таять снег, потом на деревьях появились первые почки...
                    </p>
                  </div>
                </div>

                {/* Right side - AI response */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Анализ нейросети
                  </div>
                  <div className="h-48 rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-foreground">Грамматика: отлично</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-foreground">Структура: хорошо</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-sm text-foreground">Рекомендации: 2</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Рекомендуем добавить больше описательных прилагательных...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
