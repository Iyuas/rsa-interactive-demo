import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PresetPicker from './components/PresetPicker';
import PrimeCheckViz from './components/PrimeCheckViz';
import EuclidTable from './components/EuclidTable';
import BackSubList from './components/BackSubList';
import MathCard from './components/MathCard';
import { isPrime, gcdTrace, extGcdTrace, pickECandidates, modInverse } from './utils/rsaMath';

const SECTIONS = [
  { id: 'primes',   label: '1. Простые числа' },
  { id: 'modulus',  label: '2. Модуль n' },
  { id: 'phi',      label: '3. Функция Эйлера φ(n)' },
  { id: 'e',        label: '4. Открытая экспонента e' },
  { id: 'd',        label: '5. Секретная экспонента d' },
  { id: 'verify',   label: '6. Проверка' },
];

const PRIME_VIZ_THRESHOLD = 10000n;

const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export default function KeyGeneration({ state, setState, nextStep }) {
  const [section, setSection] = useState(0);

  const pCheck = useMemo(
    () => (state.p !== null && state.p <= PRIME_VIZ_THRESHOLD) ? isPrime(state.p) : null,
    [state.p],
  );
  const qCheck = useMemo(
    () => (state.q !== null && state.q <= PRIME_VIZ_THRESHOLD) ? isPrime(state.q) : null,
    [state.q],
  );

  const eCandidates = useMemo(
    () => state.phi !== null ? pickECandidates(state.phi) : [],
    [state.phi],
  );

  const eForwardTrace = useMemo(
    () => (state.e !== null && state.phi !== null) ? gcdTrace(state.phi, state.e) : null,
    [state.e, state.phi],
  );
  const eExtTrace = useMemo(
    () => (state.e !== null && state.phi !== null) ? extGcdTrace(state.e, state.phi) : null,
    [state.e, state.phi],
  );

  const applyPrimes = ({ presetId, p, q }) => {
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    setState(s => ({ ...s, presetId, p, q, n, phi, e: null, d: null, blocks: [] }));
  };

  const pickE = (e) => {
    const d = modInverse(e, state.phi);
    setState(s => ({ ...s, e, d }));
    setSection(4);
  };

  const ready = state.p && state.q && state.n && state.phi && state.e && state.d;
  const bigPrimes = state.p !== null && state.p > PRIME_VIZ_THRESHOLD;

  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const muted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';
  const primaryBg = 'var(--t-primary-bg)';
  const surfaceAlt = 'var(--t-surface-alt)';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginBottom: '0.5rem', marginTop: 0 }}>Генерация ключей RSA</h2>
        <p style={{ color: muted, maxWidth: '42rem', margin: 0 }}>
          Шаг 1 из 3. Смотрим, как из двух простых чисел выводятся все части публичного и секретного ключа.
        </p>
      </div>

      {/* Section pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {SECTIONS.map((s, i) => {
          const done = i < section;
          const active = i === section;
          return (
            <button key={s.id} onClick={() => setSection(i)} style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: `1px solid ${active ? primary : done ? '#22c55e' : border}`,
              background: active ? primary : done ? '#f0fdf4' : surfaceAlt,
              color: active ? '#fff' : done ? '#15803d' : muted,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>{s.label}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {section === 0 && (
          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Выберите простые p и q</h3>
            <p style={{ fontSize: '0.875rem', color: muted, margin: 0 }}>
              RSA полагается на то, что перемножить два простых легко, а разложить n обратно — нет.
            </p>
            <PresetPicker presetId={state.presetId} onApply={applyPrimes} />
            {state.p !== null && state.q !== null && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {bigPrimes ? (
                  <>
                    <MathCard tone="green" title="p — большое простое" expression={`p = ${state.p}`} note="Простота проверена заранее." />
                    <MathCard tone="green" title="q — большое простое" expression={`q = ${state.q}`} note="Для Real-пресета демонстрируем, что RSA работает и на числах уровня 2³¹." />
                  </>
                ) : (
                  <>
                    {pCheck && <PrimeCheckViz n={state.p} trace={pCheck} label="Проверка p" />}
                    {qCheck && <PrimeCheckViz n={state.q} trace={qCheck} label="Проверка q" />}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {section === 1 && state.p && state.q && (
          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Вычисляем модуль n = p · q</h3>
            <MathCard title="Подстановка" expression={`n = ${state.p} · ${state.q}`} value={String(state.n)}
              note="n публикуется как часть открытого ключа. Безопасность RSA держится на том, что обратное — факторизация n — вычислительно непосильна для больших простых." />
            {state.n < 128n && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: '#fffbeb',
                border: '1px solid #fcd34d',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
              }}>
                <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '1.25rem', flexShrink: 0 }}>warning</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>
                    n = {String(state.n)} — слишком маленькое значение
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', lineHeight: '1.5' }}>
                    При n &lt; 128 каждый ASCII-символ (коды 32–127) может оказаться больше n, 
                    что делает корректное шифрование невозможным. Для работы с текстом нужно n ≥ 128. 
                    Выберите бо́льшие простые числа.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {section === 2 && state.phi !== null && (
          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Функция Эйлера φ(n) = (p−1)(q−1)</h3>
            <MathCard title="Подстановка"
              expression={`φ(n) = (${state.p} − 1) · (${state.q} − 1) = ${state.p - 1n} · ${state.q - 1n}`}
              value={String(state.phi)}
              note="φ(n) — количество чисел меньше n, взаимно простых с n. Это и есть длина «цикла» по Эйлеру, она должна оставаться секретной." />
          </div>
        )}

        {section === 3 && eCandidates.length > 0 && (
          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Выбор открытой экспоненты e</h3>
            <p style={{ fontSize: '0.875rem', color: muted, margin: 0 }}>
              Условие: gcd(e, φ) = 1. Проверяем кандидатов алгоритмом Евклида.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {eCandidates.map(({ e, valid, trace }) => (
                <div key={String(e)} style={{
                  border: `1px solid ${state.e === e ? primary : valid ? '#22c55e' : border}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  background: state.e === e ? primaryBg : valid ? '#f0fdf4' : surfaceAlt,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 700, color: textColor }}>e = {String(e)}</span>
                      <span style={{
                        marginLeft: '0.75rem', padding: '0.1rem 0.5rem',
                        fontSize: '0.625rem', borderRadius: '0.25rem', fontWeight: 700, textTransform: 'uppercase',
                        background: valid ? '#16a34a' : '#fef2f2', color: valid ? '#fff' : '#dc2626',
                      }}>
                        {trace === null ? `e ≥ φ — не годится` : `gcd = ${String(trace.gcd)} ${valid ? '✓' : '✗'}`}
                      </span>
                    </div>
                    <button onClick={() => pickE(e)} disabled={!valid} style={{
                      padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700,
                      background: valid ? primary : '#9ca3af', color: '#fff',
                      borderRadius: '0.375rem', border: 'none', cursor: valid ? 'pointer' : 'not-allowed',
                    }}>Выбрать</button>
                  </div>
                  {trace !== null && <EuclidTable rows={trace.rows} showQuotient />}
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 4 && state.e && state.d && eForwardTrace && eExtTrace && (
          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Секретная экспонента d = e⁻¹ mod φ</h3>
            <p style={{ fontSize: '0.875rem', color: muted, margin: 0 }}>
              Используем расширенный алгоритм Евклида: решаем e·x + φ·y = 1, тогда d ≡ x (mod φ).
            </p>
            <div>
              <h4 style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: muted, marginBottom: '0.5rem' }}>Прямой ход — деления</h4>
              <EuclidTable rows={eForwardTrace.rows} />
              <p style={{ fontSize: '0.6875rem', color: muted, marginTop: '0.25rem' }}>Каждая строка: dividend = quotient · divisor + remainder.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: muted, marginBottom: '0.5rem' }}>Обратная подстановка</h4>
              <BackSubList steps={eExtTrace.backSub} />
            </div>
            <MathCard tone="green" title="Результат"
              expression={`x = ${eExtTrace.x}, d ≡ x (mod φ)`}
              value={`d = ${state.d}`}
              note={`Проверка: e · d mod φ = ${state.e} · ${state.d} mod ${state.phi} = ${(state.e * state.d) % state.phi}.`} />
          </div>
        )}

        {section === 5 && ready && (
          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Сводка по ключам</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <MathCard tone="blue" title="Публичный ключ" expression={`(e, n) = (${state.e}, ${state.n})`} note="Можно давать кому угодно." />
              <MathCard tone="green" title="Приватный ключ" expression={`(d, n) = (${state.d}, ${state.n})`} note="Храните в секрете вместе с p, q и φ(n)." />
            </div>
            <button onClick={nextStep} style={{ width: '100%', padding: '0.75rem', background: primary, color: '#fff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
              К шифрованию →
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
          <button disabled={section === 0} onClick={() => setSection(s => s - 1)} style={{
            padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 700,
            color: section === 0 ? muted : textColor,
            background: 'none', border: 'none', cursor: section === 0 ? 'not-allowed' : 'pointer',
            opacity: section === 0 ? 0.4 : 1,
          }}>‹ Назад</button>
          <button
            disabled={section >= SECTIONS.length - 1 || (section === 0 && !state.p) || (section === 3 && !state.e)}
            onClick={() => setSection(s => s + 1)}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 700,
              color: primary, background: 'none', border: 'none',
              cursor: 'pointer',
              opacity: (section >= SECTIONS.length - 1 || (section === 0 && !state.p) || (section === 3 && !state.e)) ? 0.4 : 1,
            }}>Далее ›</button>
        </div>
      </div>
    </motion.div>
  );
}
