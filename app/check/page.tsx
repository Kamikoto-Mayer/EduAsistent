import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeworkChecker } from '@/components/homework-checker'
import { Brain, Shield, Zap } from 'lucide-react'

export const metadata = {
  title: 'Проверка заданий | ЭдуАссистент',
  description: 'AI-помощник для проверки домашних заданий. Загрузите работу ученика и получите детальный анализ.',
}

const features = [
  { icon: Zap, text: 'Анализ за секунды' },
  { icon: Brain, text: 'Точная проверка' },
  { icon: Shield, text: 'Конфиденциально' },
]

export default function CheckPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          {/* Page header */}
          <div className="mx-auto max-w-3xl text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <Brain className="h-4 w-4" />
              AI-помощник для преподавателей
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
              Проверка домашних заданий
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Вставьте текст работы ученика и получите детальный анализ с оценкой, 
              комментариями по ошибкам и рекомендациями по улучшению
            </p>
            
            {/* Quick features */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="h-4 w-4 text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <HomeworkChecker />
          
          {/* Tips section */}
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Советы для лучших результатов
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Укажите тему задания для более точного анализа соответствия
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Вставляйте текст полностью, включая все абзацы работы
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Используйте результат как основу для итоговой оценки
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
