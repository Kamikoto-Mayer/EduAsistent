import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight, 
  Brain, 
  Target, 
  Users, 
  Lightbulb,
  GraduationCap,
  Heart,
  Rocket,
  Shield,
  Award
} from 'lucide-react'

export const metadata = {
  title: 'О проекте | ЭдуАссистент',
  description: 'ЭдуАссистент - проект конкурса "Моя страна — моя Россия". AI-платформа для помощи преподавателям в проверке домашних заданий.',
}

const values = [
  {
    icon: Target,
    title: 'Миссия',
    description: 'Помочь российским преподавателям сэкономить время на рутинной проверке работ и сосредоточиться на индивидуальном подходе к каждому ученику.',
  },
  {
    icon: Lightbulb,
    title: 'Инновации',
    description: 'Используем передовые технологии искусственного интеллекта и машинного обучения для анализа текстов на русском языке.',
  },
  {
    icon: Heart,
    title: 'Забота',
    description: 'Создаём инструменты, которые делают образование качественнее и доступнее для всех участников учебного процесса.',
  },
]

const features = [
  {
    icon: Brain,
    title: 'Нейросетевой анализ',
    description: 'Современные языковые модели, обученные на русскоязычных текстах, обеспечивают точный и глубокий анализ работ.',
  },
  {
    icon: Shield,
    title: 'Безопасность данных',
    description: 'Все работы обрабатываются конфиденциально. Мы не сохраняем персональные данные учеников.',
  },
  {
    icon: Rocket,
    title: 'Постоянное развитие',
    description: 'Платформа регулярно обновляется: добавляются новые предметы, улучшаются алгоритмы анализа.',
  },
]

const benefits = [
  {
    title: 'Для преподавателей',
    items: [
      'Экономия до 80% времени на проверке',
      'Объективная оценка работ',
      'Готовые комментарии для учеников',
      'Анализ типичных ошибок класса',
    ],
  },
  {
    title: 'Для учеников',
    items: [
      'Быстрая обратная связь',
      'Понятные рекомендации по улучшению',
      'Возможность самопроверки',
      'Мотивация к развитию',
    ],
  },
  {
    title: 'Для системы образования',
    items: [
      'Повышение качества обучения',
      'Стандартизация оценивания',
      'Цифровизация образовательного процесса',
      'Инновационные технологии в школах',
    ],
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8">
                <Award className="h-4 w-4" />
                Конкурс «Моя страна — моя Россия»
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                О проекте{' '}
                <span className="gradient-text">ЭдуАссистент</span>
              </h1>
              
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                ЭдуАссистент — это инновационная платформа на базе искусственного интеллекта, 
                созданная для помощи российским преподавателям в проверке домашних заданий 
                и обеспечения качественной обратной связи ученикам.
              </p>
            </div>
          </div>
        </section>

        {/* Values section */}
        <section className="py-16 lg:py-24 bg-card/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Наши ценности
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Принципы, которыми мы руководствуемся при создании продукта
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="relative rounded-2xl border border-border bg-card p-8 text-center"
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center justify-center rounded-xl bg-primary p-3 text-primary-foreground shadow-lg">
                      <value.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                  Технологии будущего для образования сегодня
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Мы используем последние достижения в области искусственного интеллекта 
                  и обработки естественного языка, чтобы создать инструмент, который 
                  действительно помогает преподавателям.
                </p>
                
                <div className="mt-8 space-y-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                          <feature.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl rounded-3xl" />
                <div className="relative rounded-2xl border border-border bg-card p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">AI Engine</p>
                      <p className="text-xs text-muted-foreground">Powered by GPT</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[85%] rounded-full bg-primary" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Точность анализа</span>
                      <span className="font-semibold text-primary">85%+</span>
                    </div>
                    
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[95%] rounded-full bg-green-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Грамматика</span>
                      <span className="font-semibold text-green-500">95%+</span>
                    </div>
                    
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[90%] rounded-full bg-yellow-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Стилистика</span>
                      <span className="font-semibold text-yellow-500">90%+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits section */}
        <section className="py-16 lg:py-24 bg-card/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Преимущества для всех
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ЭдуАссистент приносит пользу каждому участнику образовательного процесса
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    {benefit.title === 'Для преподавателей' && <GraduationCap className="h-5 w-5 text-primary" />}
                    {benefit.title === 'Для учеников' && <Users className="h-5 w-5 text-primary" />}
                    {benefit.title === 'Для системы образования' && <Award className="h-5 w-5 text-primary" />}
                    {benefit.title}
                  </h3>
                  <ul className="space-y-3">
                    {benefit.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Попробуйте прямо сейчас
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Убедитесь в возможностях ЭдуАссистента на практике — проверьте первую работу бесплатно
              </p>

              <div className="mt-10">
                <Link href="/check">
                  <Button size="lg" className="gap-2 text-base px-8 py-6 glow-primary">
                    Начать проверку
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
