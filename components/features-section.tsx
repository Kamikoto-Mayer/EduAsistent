import { 
  Zap, 
  Shield, 
  BarChart3, 
  MessageSquareText, 
  Languages, 
  Clock 
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Мгновенный анализ',
    description: 'Проверка работы занимает считанные секунды благодаря современным алгоритмам машинного обучения.',
  },
  {
    icon: MessageSquareText,
    title: 'Детальная обратная связь',
    description: 'AI предоставляет развёрнутые комментарии по каждому аспекту работы: грамматика, стиль, логика.',
  },
  {
    icon: BarChart3,
    title: 'Оценка по критериям',
    description: 'Автоматическое выставление баллов по настраиваемым критериям оценивания.',
  },
  {
    icon: Languages,
    title: 'Все предметы',
    description: 'Поддержка русского языка, литературы, истории, обществознания и других гуманитарных дисциплин.',
  },
  {
    icon: Shield,
    title: 'Конфиденциальность',
    description: 'Все данные обрабатываются безопасно. Работы учеников не сохраняются после проверки.',
  },
  {
    icon: Clock,
    title: 'Экономия времени',
    description: 'Сокращение времени на проверку до 80%, больше времени на индивидуальную работу с учениками.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-card/50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Возможности платформы
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Современные технологии искусственного интеллекта на службе российского образования
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
