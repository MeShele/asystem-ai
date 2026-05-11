"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Zap,
  Award,
  TrendingUp,
  Trophy,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Repeat,
  Star,
  Network,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LevelIcon } from "@/components/shared/level-icon";

interface Level {
  level: number;
  title: string;
  icon: string;
  base_pct: number;
  requirement: string;
}

interface Stats {
  totalDeals: number;
  dealsLast60Days: number;
  dealsLast90Days: number;
  dealsLast6Months: number;
  totalRevenue: number;
  hasT2Project: boolean;
}

interface Props {
  levels: Level[];
  currentLevel: number;
  isFounding: boolean;
  stats: Stats;
}

export function ProgramGuide({ levels, currentLevel, isFounding, stats }: Props) {
  const [expanded, setExpanded] = useState<"levels" | "multipliers" | "penalty" | "rewards" | "network" | null>(null);
  const retentionQualified = stats.dealsLast60Days >= 3;

  return (
    <motion.div
      className="rounded-2xl border border-border-faint bg-surface overflow-hidden mb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Header */}
      <div className="p-5 lg:p-6 border-b border-border-faint bg-gradient-to-r from-brand-500/[0.06] to-purple-500/[0.04]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Как работает партнёрская программа</h2>
            <p className="text-xs text-text-muted">Чем выше уровень и сильнее результат — тем больше зарабатываете</p>
          </div>
        </div>

        {isFounding && (
          <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08]">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
              <div>
                <div className="text-sm font-bold text-amber-600">Вы — Founding Partner</div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Вы вошли в программу одним из первых 5 партнёров. Получаете <strong>+5%</strong> к комиссии
                  на все будущие проекты пожизненно, case-study rights (ваш кейс публикуем первым) и 6-месячную
                  гарантию возврата prepaid fees.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="divide-y divide-border-faint">
        {/* ─── 1. Levels ─── */}
        <Section
          icon={Award}
          tone="brand"
          title="Лестница уровней L1 → L5"
          subtitle="Базовая ставка комиссии — от 10% до 30%. Поднимается автоматически по результатам"
          isOpen={expanded === "levels"}
          onToggle={() => setExpanded(expanded === "levels" ? null : "levels")}
        >
          <div className="space-y-3">
            {levels.map((lvl) => {
              const isCurrent = lvl.level === currentLevel;
              const isPassed = lvl.level < currentLevel;
              return (
                <div
                  key={lvl.level}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-brand-500 bg-brand-500/[0.04]"
                      : isPassed
                      ? "border-green-500/25 bg-green-500/[0.03]"
                      : "border-border-faint bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <LevelIcon level={lvl.level} size="md" active={isCurrent} passed={isPassed} />
                      <div className="min-w-0">
                        <div className="font-semibold flex items-center gap-2 flex-wrap">
                          <span>L{lvl.level} «{lvl.title}»</span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-brand-500 font-medium">
                              <span className="w-1 h-1 rounded-full bg-brand-500 live-pulse" />
                              ваш уровень
                            </span>
                          )}
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">{lvl.requirement}</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold flex-shrink-0 font-mono tabular-nums ${
                      isCurrent ? "text-brand-500" : isPassed ? "text-green-500" : "text-text-muted"
                    }`}>
                      {lvl.base_pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-blue-500/[0.04] border border-blue-500/20">
            <p className="text-xs text-blue-600 leading-relaxed">
              <strong>Что считается сделкой:</strong> подписан договор по проекту (поле «Дата подписания договора»
              в админке). Уровень пересчитывается автоматически — каждый раз когда у вас появляется новая
              подписанная сделка или вы достигаете порога по выручке.
            </p>
          </div>
        </Section>

        {/* ─── 2. Multipliers ─── */}
        <Section
          icon={Zap}
          tone="green"
          title="Множители комиссии"
          subtitle="Дополнительные проценты сверху базовой ставки. Складываются друг с другом"
          isOpen={expanded === "multipliers"}
          onToggle={() => setExpanded(expanded === "multipliers" ? null : "multipliers")}
        >
          <div className="space-y-2">
            <MultiplierCard
              icon={Zap}
              tone="brand"
              pct="+10%"
              title="Быстрая сделка"
              when="Когда срабатывает: договор подписан за <30 дней с момента вашего первого контакта по проекту."
              effect="Применяется к этому проекту разово. Включается админом вручную при создании проекта."
            />
            <MultiplierCard
              icon={Repeat}
              tone="green"
              pct="+5%"
              title="Retention 12 мес"
              when={`Когда срабатывает: 3 сделки за 60 дней (скользящее окно). Сейчас у вас: ${stats.dealsLast60Days}/3.`}
              effect="Применяется автоматически ко всем НОВЫМ проектам пока условие выполнено + продлевает ваш эксклюзив по нише на 12 месяцев."
              activeBadge={retentionQualified ? "выполнено" : undefined}
            />
            <MultiplierCard
              icon={Star}
              tone="amber"
              pct="+5%"
              title="Founding partner"
              when="Когда срабатывает: вы автоматически становитесь Founding partner если в момент регистрации в системе меньше 5 партнёров."
              effect="Применяется к ВСЕМ вашим проектам пожизненно (включая будущие, даже после того как наберётся больше 5 партнёров)."
              activeBadge={isFounding ? "у вас навсегда" : undefined}
            />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-green-500/[0.04] border border-green-500/20">
            <p className="text-xs text-green-700 leading-relaxed">
              <strong>Пример:</strong> L3 (19%) + Founding (+5%) + Retention (+5%) + Быстрая сделка (+10%) ={" "}
              <strong>39%</strong> до tier-decay. На проекте $5K — это 39%, на проекте $20K — ×0.8 = <strong>31.2%</strong>, на $50K — ×0.65 = <strong>25.3%</strong>.
            </p>
          </div>
        </Section>

        {/* ─── 3. Penalty (separate, important) ─── */}
        <Section
          icon={AlertTriangle}
          tone="red"
          title="Штраф за неактивность −1 уровень"
          subtitle="Что произойдёт, если 60+ дней без новых сделок"
          isOpen={expanded === "penalty"}
          onToggle={() => setExpanded(expanded === "penalty" ? null : "penalty")}
        >
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/[0.03]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2.4} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold mb-1">60+ дней без сделок → уровень падает на 1 ступень</div>
                <ul className="text-xs text-text-secondary space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>L3 (19%) → L2 (14%) — потеря 5% к будущим проектам</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>L1 не понижается — это минимальный уровень</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>Старые проекты остаются на своих процентах</strong> — заморозка применяется только к новым</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Понижение применяется один раз за 60-дневное окно неактивности</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Закрыли новую сделку → запускается новый отсчёт. Уровень снова растёт по обычным правилам</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 4. Mini-rewards ─── */}
        <Section
          icon={Trophy}
          tone="amber"
          title="Мини-награды по сумме заработка"
          subtitle="Дополнительные бонусы кэшем поверх обычной комиссии"
          isOpen={expanded === "rewards"}
          onToggle={() => setExpanded(expanded === "rewards" ? null : "rewards")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <RewardCard threshold={5000} reward={500} title="Первая пятёрка" />
            <RewardCard threshold={10000} reward={1000} title="Десятка" />
            <RewardCard threshold={20000} reward={2000} title="Двадцатка" />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/20">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Как получить:</strong> когда ваш суммарный заработок (фактически выплаченные комиссии)
              перейдёт порог — на странице «Достижения» появится кнопка «Забрать $X». Запрос летит к админу,
              он одобряет — деньги перечисляются. Каждая награда — разовая.
            </p>
          </div>
        </Section>

        {/* ─── 5. Sub-partners — менторская комиссия ─── */}
        <Section
          icon={Network}
          tone="purple"
          title="Приведи партнёра — получай override"
          subtitle="Доп. деньги от студии за каждого приглашённого. Никто ничего не теряет."
          isOpen={expanded === "network"}
          onToggle={() => setExpanded(expanded === "network" ? null : "network")}
        >
          <div className="space-y-3">
            {/* Главное в одной строке — конкретные деньги */}
            <div className="p-5 rounded-xl border-2 border-purple-500/30 bg-purple-500/[0.06]">
              <div className="text-[10px] font-semibold text-purple-500 uppercase tracking-[0.12em] mb-2">
                Главное в одном примере
              </div>
              <p className="text-sm text-text-primary leading-relaxed mb-3">
                Ты позвал Васю по реф-ссылке. Вася на L1 закрыл проект на <strong>$40 000</strong>. Что происходит:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-surface border border-border-faint">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">Вася получает</div>
                  <div className="text-lg font-bold font-mono text-green-600">$2 600</div>
                  <div className="text-[11px] text-text-muted mt-0.5">10% × $40K × 0.65 (tier-decay) — обычная L1-комиссия</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="text-[10px] uppercase tracking-wider text-purple-500">Ты получаешь</div>
                  <div className="text-lg font-bold font-mono text-purple-600">+$78</div>
                  <div className="text-[11px] text-text-muted mt-0.5">3% × $2.6K — override от студии</div>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border-faint">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">Студия платит</div>
                  <div className="text-lg font-bold font-mono">$2 678</div>
                  <div className="text-[11px] text-text-muted mt-0.5">$2 600 Васе + $78 тебе</div>
                </div>
              </div>
            </div>

            {/* Ключевые правила одной строкой */}
            <div className="p-4 rounded-xl border border-border-faint bg-bg-secondary/30 space-y-2.5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Вася не теряет ни цента.</strong> Его комиссия (10% / 14% / 19% и т.д. — после tier-decay) идёт ему полностью. Override приходит <strong>дополнительно от студии</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">У Васи такие же 10-30% что и у тебя.</strong> Sub-partner — не «партнёр второго сорта». Он проходит ту же лестницу L1-L5 и получает те же множители (Founding, Retention, Быстрая сделка) и tier-decay по чеку. Никаких «тебе 10%, ему 8%».
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Глубина 1 уровень.</strong> Если Вася позвал Колю — Вася получает override с Колиных сделок, но <strong>ты с Коли не получаешь ничего</strong>. Это не пирамида — это менторская комиссия за конкретного человека которому ты помог войти.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Условие активности.</strong> Чтобы получать override — ты должен сам закрывать хотя бы 1 сделку за 90 дней. Иначе ты «спишь» и override не платится (защита от 100 фейк-рефералов).
                </p>
              </div>
            </div>

            {/* Таблица override по уровням Васи */}
            <div>
              <div className="text-xs font-semibold text-text-secondary mb-2">Сколько ты получаешь когда Вася растёт:</div>
              <div className="rounded-xl border border-border-faint overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-3 py-2.5 bg-bg-secondary/40 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                  <div>Уровень Васи</div>
                  <div className="text-right">Его %</div>
                  <div className="text-right">Override %</div>
                  <div className="text-right">Тебе с $40K</div>
                </div>
                {[
                  // Расчёт на проект $40K (tier-decay × 0.65). База после decay × overridePct/100
                  { lvl: 1, title: "L1 Введённый", subPct: 10, overridePct: 3, you: 78 },
                  { lvl: 2, title: "L2 Активный", subPct: 14, overridePct: 4, you: 146 },
                  { lvl: 3, title: "L3 Эксклюзив", subPct: 19, overridePct: 5, you: 247 },
                  { lvl: 4, title: "L4 Лидер ниши", subPct: 24, overridePct: 6, you: 374 },
                  { lvl: 5, title: "L5 Стратегический", subPct: 30, overridePct: 8, you: 624 },
                ].map((r) => (
                  <div key={r.lvl} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-3 py-2 text-xs border-t border-border-faint">
                    <div className="text-text-secondary truncate">{r.title}</div>
                    <div className="text-right font-mono text-text-muted">{r.subPct}%</div>
                    <div className="text-right font-mono font-semibold text-purple-500">+{r.overridePct}%</div>
                    <div className="text-right font-mono font-bold text-green-600">${r.you}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed mt-2">
                <strong className="text-purple-600">Тебе выгодно чтобы Вася рос</strong> — твой override растёт вместе с его уровнем. Помоги ему дойти до L3 — и с каждой его сделки на $40K тебе будет капать $247 вместо $78.
              </p>
            </div>

            {/* Множители у Васи — отдельный важный блок */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/[0.04]">
              <div className="text-sm font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" /> А если у Васи срабатывают множители?
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                Это лучший сценарий — <strong>выигрываете оба</strong>. Множители Васи (Founding +5%, Retention +5%, Быстрая сдача +10%)
                увеличивают его комиссию → твой override считается от этой <strong>увеличенной</strong> суммы.
                Сам процент override (3-8% зависит от уровня Васи) не меняется, но база растёт.
              </p>

              <div className="text-[11px] font-semibold text-text-secondary mb-2">
                Один и тот же проект $20K · Вася на L3 (override = 5%) · tier-decay ×0.8:
              </div>
              <div className="rounded-lg border border-border-faint overflow-hidden bg-surface">
                <div className="grid grid-cols-[1.6fr_1fr_1fr] px-3 py-2 bg-bg-secondary/40 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                  <div>Сценарий</div>
                  <div className="text-right">Вася получает</div>
                  <div className="text-right">Тебе</div>
                </div>
                {[
                  // pre-decay → effective%×0.8 → Васе × $20K → override 5% от Васи
                  { label: "Базовая L3 (19%)", subPct: 15.2, vasya: 3040, you: 152 },
                  { label: "+ Founding (24%)", subPct: 19.2, vasya: 3840, you: 192 },
                  { label: "+ Retention (29%)", subPct: 23.2, vasya: 4640, you: 232 },
                  { label: "+ Быстрая сдача (39%)", subPct: 31.2, vasya: 6240, you: 312, highlight: true },
                ].map((r, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1.6fr_1fr_1fr] px-3 py-2 text-xs border-t border-border-faint ${
                      r.highlight ? "bg-purple-500/[0.06]" : ""
                    }`}
                  >
                    <div className="text-text-secondary">
                      {r.label} <span className="text-text-muted font-mono">→ {r.subPct.toFixed(1)}%</span>
                    </div>
                    <div className="text-right font-mono text-text-muted">${r.vasya.toLocaleString("ru-RU")}</div>
                    <div className={`text-right font-mono font-bold ${r.highlight ? "text-purple-600" : "text-purple-500"}`}>
                      +${r.you.toLocaleString("ru-RU")}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-text-secondary leading-relaxed mt-3">
                <strong className="text-purple-600">Что это значит для тебя:</strong> override превращается из «пассивной приплаты»
                в реальный стимул быть ментором. Каждый совет, каждый шаблон договора который ты передал,
                каждая консультация которая ускорила сделку Васи — конвертируется в твои деньги.
                Помог ему получить Retention-бонус (3 сделки за 60 дней) — твой override автоматически вырос на 20%.
              </p>
            </div>

            {/* Где увидеть */}
            <div className="p-3 rounded-lg bg-blue-500/[0.04] border border-blue-500/20">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Где смотреть свой override:</strong> на странице <strong>«Мои партнёры»</strong> в боковом меню. Там реф-ссылка для приглашений, список приглашённых партнёров, KPI «Override доход» и история начислений по каждой их сделке. Это отдельный поток дохода — не путается с твоей основной комиссией по своим проектам.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* Footer summary */}
      <div className="p-5 bg-gradient-to-r from-brand-500/[0.04] to-green-500/[0.04] border-t border-border-faint">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold mb-1">Два пути к максимуму</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong>1) Сам.</strong> Растёшь по уровням → база с 10% до 30%. Закрываешь быстро (&lt;30 дней) → +10%.
              Держишь ритм 3 сделки за 60 дней → +5% retention. На L5 с активными множителями реальная комиссия —
              до <strong>50%</strong> на мелких сделках (до $5K) и <strong>25–32%</strong> на крупных
              (за счёт tier-decay по чеку).
              <br />
              <br />
              <strong>2) Через сеть.</strong> Приглашаешь партнёров через реф-ссылку → получаешь override 3-8% от их комиссии.
              5 активных sub-partners на L3 со средней сделкой $40K = ещё <strong>~$1 200/мес</strong> сверху без твоего участия.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ───────────────────────── helpers ─────────────────────────

function Section({
  icon: Icon,
  tone,
  title,
  subtitle,
  children,
  isOpen,
  onToggle,
}: {
  icon: LucideIcon;
  tone: "brand" | "green" | "amber" | "purple" | "red";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const toneText: Record<string, string> = {
    brand: "text-brand-500",
    green: "text-green-500",
    amber: "text-amber-500",
    purple: "text-purple-500",
    red: "text-red-500",
  };
  const toneBg: Record<string, string> = {
    brand: "bg-brand-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
    purple: "bg-purple-500/10",
    red: "bg-red-500/10",
  };

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-5 hover:bg-bg-secondary/30 transition-colors text-left"
      >
        <div className={`w-10 h-10 rounded-xl ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${toneText[tone]}`} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiplierCard({
  icon: Icon,
  tone,
  pct,
  title,
  when,
  effect,
  activeBadge,
}: {
  icon: LucideIcon;
  tone: "brand" | "green" | "amber";
  pct: string;
  title: string;
  when: string;
  effect: string;
  activeBadge?: string;
}) {
  const toneText: Record<string, string> = {
    brand: "text-brand-500",
    green: "text-green-500",
    amber: "text-amber-500",
  };
  const toneBg: Record<string, string> = {
    brand: "bg-brand-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
  };
  const toneBorder: Record<string, string> = {
    brand: "border-brand-500/25 bg-brand-500/[0.03]",
    green: "border-green-500/25 bg-green-500/[0.03]",
    amber: "border-amber-500/25 bg-amber-500/[0.03]",
  };

  return (
    <div className={`p-4 rounded-xl border ${toneBorder[tone]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${toneText[tone]}`} strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`font-mono font-bold text-sm ${toneText[tone]}`}>{pct}</span>
            <span className="text-sm font-semibold">{title}</span>
            {activeBadge && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/12 text-green-600 font-medium uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-green-500 live-pulse" />
                {activeBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-1.5">{when}</p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            <span className="font-medium text-text-secondary">Эффект:</span> {effect}
          </p>
        </div>
      </div>
    </div>
  );
}

function RewardCard({
  threshold,
  reward,
  title,
}: {
  threshold: number;
  reward: number;
  title: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-border-faint bg-surface text-center">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
        <Trophy className="w-5 h-5 text-amber-500" strokeWidth={2.2} />
      </div>
      <div className="text-sm font-bold mb-0.5">{title}</div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted">При заработке</div>
      <div className="text-base font-bold font-mono tabular-nums">${threshold.toLocaleString("ru-RU")}</div>
      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold font-mono tabular-nums">
        +${reward}
      </div>
    </div>
  );
}
