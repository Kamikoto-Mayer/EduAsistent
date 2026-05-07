import { Upload, Brain, FileText, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Загрузите задание',
    description: 'Вставьте текст работы ученика и укажите тему или критерии оценивания.',
  },
  {
    icon: Brain,
    step: '02',
    title: 'AI анализирует работу',
    description: 'Нейросеть проверяет грамматику, стилистику, логику изложения и соответствие теме.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Получите отчёт',
    description: 'Детальный разбор работы с указанием сильных сторон и областей для улучшения.',
  },
  {
    icon: CheckCircle,
    step: '04',
    title: 'Выставите оценку',
    description: 'Используйте рекомендации AI как основу для итоговой оценки работы ученика.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden scroll-mt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Как это работает
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Простой и понятный процесс проверки работ в четыре шага
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[2px] bg-gradient-to-r from-primary/50 to-primary/10" />
                )}
                
                <div className="flex flex-col items-center text-center">
                  {/* Icon with step number */}
                  <div className="relative">
                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-border shadow-lg">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
