import { motion } from 'framer-motion';

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

const mathBlock = {
  background: 'var(--t-surface-alt)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.5rem',
  padding: '0.75rem 1.25rem',
  fontFamily: 'monospace',
  fontSize: '1rem',
  color: 'var(--t-primary)',
  fontWeight: 700,
  margin: '0.25rem 0',
  overflowX: 'auto',
};

const sectionTitle = {
  fontSize: '1.125rem',
  fontWeight: 700,
  color: 'var(--t-text)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const badge = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  background: color,
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 900,
  flexShrink: 0,
});

const p = {
  fontSize: '0.875rem',
  color: 'var(--t-text)',
  lineHeight: '1.6',
  margin: 0,
};

const muted = {
  fontSize: '0.8125rem',
  color: 'var(--t-text-muted)',
  lineHeight: '1.5',
  margin: 0,
};

export default function Theory() {
  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const textMuted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';
  const primaryBg = 'var(--t-primary-bg)';
  const accent = 'var(--t-accent)';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginBottom: '0.5rem', marginTop: 0 }}>
          Теория алгоритма RSA
        </h2>
        <p style={{ ...muted, maxWidth: '52rem' }}>
          RSA — асимметричный криптографический алгоритм с открытым ключом, разработанный в 1977 году
          Роном Ривестом, Ади Шамиром и Леонардом Адлеманом. Безопасность RSA основана на вычислительной
          сложности задачи факторизации больших чисел.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Overview */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span className="material-symbols-outlined" style={{ color: primary }}>info</span>
            Что такое RSA?
          </h3>
          <p style={p}>
            RSA является <strong>асимметричным</strong> алгоритмом: он использует два разных ключа — открытый
            (публичный) и закрытый (приватный). Открытый ключ можно публиковать и передавать кому угодно —
            с его помощью шифруются сообщения. Расшифровать их может только владелец закрытого ключа.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: primaryBg, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Открытый ключ</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: textColor, fontSize: '0.875rem' }}>(e, n)</div>
              <div style={muted}>Распространяется свободно. Используется для шифрования.</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Закрытый ключ</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#14532d', fontSize: '0.875rem' }}>(d, n)</div>
              <div style={muted}>Хранится в тайне. Используется для расшифрования.</div>
            </div>
          </div>
        </div>

        {/* Step 1: Key Generation */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span style={badge(primary)}>1</span>
            Генерация ключей
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Шаг 1 — Выбрать два простых числа p и q</div>
              <p style={muted}>
                Выбираем два различных простых числа. Чем больше числа, тем надёжнее шифрование.
                Например, p = 3, q = 7.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Шаг 2 — Вычислить модуль n</div>
              <div style={mathBlock}>n = p × q</div>
              <p style={muted}>n публикуется как часть открытого ключа. Для p=3, q=7: n = 21.</p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Шаг 3 — Вычислить функцию Эйлера φ(n)</div>
              <div style={mathBlock}>φ(n) = (p − 1) × (q − 1)</div>
              <p style={muted}>Для p=3, q=7: φ(21) = 2 × 6 = 12. Это число хранится в секрете.</p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Шаг 4 — Выбрать открытую экспоненту e</div>
              <p style={muted}>Выбираем e такое, что:</p>
              <ul style={{ ...muted, paddingLeft: '1.25rem', margin: '0.25rem 0' }}>
                <li>1 &lt; e &lt; φ(n)</li>
                <li>НОД(e, φ(n)) = 1 (e взаимно просто с φ(n))</li>
              </ul>
              <p style={muted}>Стандартный выбор — e = 65537. Пример: e = 5.</p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Шаг 5 — Найти закрытую экспоненту d</div>
              <div style={mathBlock}>d ≡ e⁻¹ (mod φ(n))  ↔  (d × e) mod φ(n) = 1</div>
              <p style={muted}>
                d вычисляется расширенным алгоритмом Евклида. Пример: e=5, φ=12 → d=5, так как 5×5=25, 25 mod 12=1.
                Выбирают d≠e: d=17 (17×5=85, 85 mod 12=1).
              </p>
            </div>

            <div style={{ background: primaryBg, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Итог генерации</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.875rem', color: textColor }}>
                <div>Открытый ключ: <strong>(e, n) = (5, 21)</strong></div>
                <div>Закрытый ключ: <strong>(d, n) = (17, 21)</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Encryption */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span style={badge('#2563eb')}>2</span>
            Шифрование
          </h3>
          <p style={p}>
            Пусть M — исходное сообщение (число). Условие: M &lt; n. Шифртекст C вычисляется по формуле:
          </p>
          <div style={mathBlock}>C = M<sup>e</sup> mod n</div>
          <p style={muted}>
            Пример: M = 19, открытый ключ (e=5, n=21).
            19⁵ = 2&thinsp;476&thinsp;099. 2&thinsp;476&thinsp;099 mod 21 = 10. Шифртекст: C = 10.
          </p>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#1e40af' }}>
            <span style={{ fontWeight: 700 }}>Оптимизация:</span> не нужно вычислять M<sup>e</sup> целиком.
            Метод «квадрат и умножение» (Square-and-Multiply) применяет операцию mod на каждом шаге,
            не допуская роста числа.
          </div>
        </div>

        {/* Step 3: Decryption */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span style={badge('#16a34a')}>3</span>
            Расшифрование
          </h3>
          <p style={p}>
            Получатель использует закрытый ключ (d, n) для восстановления исходного M:
          </p>
          <div style={mathBlock}>M = C<sup>d</sup> mod n</div>
          <p style={muted}>
            Пример: C = 10, закрытый ключ (d=17, n=21).
            10¹⁷ mod 21 = 19 = M. Сообщение восстановлено.
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#14532d' }}>
            <span style={{ fontWeight: 700 }}>Почему работает:</span> по теореме Эйлера M<sup>φ(n)</sup> ≡ 1 (mod n).
            Поскольку e·d ≡ 1 (mod φ(n)), то M<sup>e·d</sup> = M<sup>1+k·φ(n)</sup> = M · (M<sup>φ(n)</sup>)<sup>k</sup> ≡ M (mod n).
          </div>
        </div>

        {/* Security */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>shield</span>
            Безопасность RSA
          </h3>
          <p style={p}>
            Стойкость RSA держится на задаче факторизации: зная n = p·q, вычислить p и q отдельно
            вычислительно непосильно при больших числах. Даже мощнейшие компьютеры потратили бы тысячи лет
            на факторизацию 2048-битного n.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Минимальная длина ключа сегодня', value: '2048 бит', color: '#16a34a' },
              { label: 'Рекомендуемая длина ключа', value: '4096 бит', color: '#2563eb' },
              { label: 'Устаревшие ключи (небезопасно)', value: '< 1024 бит', color: '#dc2626' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--t-surface-alt)', borderRadius: '0.375rem', border: `1px solid ${border}` }}>
                <span style={{ fontSize: '0.8125rem', color: textColor }}>{item.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
          <p style={muted}>
            Учебные примеры используют малые числа для наглядности. В реальных системах (HTTPS, SSH, PGP)
            используются числа размером сотни и тысячи бит.
          </p>
        </div>

        {/* Timeline */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span className="material-symbols-outlined" style={{ color: textMuted }}>history</span>
            История и применение
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { year: '1977', text: 'RSA опубликован Ривестом, Шамиром и Адлеманом в MIT.' },
              { year: '1983', text: 'MIT получил патент на RSA в США (действовал до 2000 г.).' },
              { year: '2000', text: 'Патент истёк — RSA стал полностью свободным для использования.' },
              { year: 'Сегодня', text: 'RSA применяется в TLS/HTTPS, SSH, PGP, цифровых подписях и PKI.' },
            ].map(item => (
              <div key={item.year} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '3.5rem', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: primary, paddingTop: '0.1rem' }}>{item.year}</div>
                <div style={{ ...muted, flex: 1 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
