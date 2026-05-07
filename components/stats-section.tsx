const stats = [
  { value: '80%', label: 'Экономия времени', description: 'На проверке работ' },
  { value: '< 10с', label: 'Скорость анализа', description: 'Одной работы' },
  { value: '15+', label: 'Критериев', description: 'Проверки текста' },
  { value: '24/7', label: 'Доступность', description: 'Круглосуточно' },
]

export function StatsSection() {
  return (
    <section className="py-24 sm:py-32 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Цифры говорят сами за себя
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Эффективность нашей платформы подтверждена реальными результатами
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative rounded-2xl border border-border bg-card p-6 text-center"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="relative">
                  <p className="text-4xl font-bold text-primary lg:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
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
