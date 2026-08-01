import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AlertCircle,
  Archive,
  Building2,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Home,
  Image as ImageIcon,
  LogOut,
  Menu,
  PackageCheck,
  PackagePlus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X
} from 'lucide-preact';
import type {
  DashboardStats,
  IntakeDraft,
  PackageStatus,
  PackageEvidence,
  PackageSummary,
  ResidentResult,
  SessionContext,
  UnitOption
} from '../types/domain';
import { clearDraft, loadDraft, saveDraft } from '../lib/draft';
import { formatDateTime, maskPhone, phoneLast4, statusLabels } from '../lib/format';
import { prepareImage, type PreparedImage } from '../lib/image';
import { recognizeLabel } from '../lib/ocr';
import {
  completePickup,
  confirmNotification,
  createIntake,
  findDuplicates,
  listPackages,
  loadDashboard,
  loadPackageEvidence,
  loadSessionContext,
  searchResidents,
  searchUnits
} from '../lib/repository';
import { friendlyError, getSupabase, runtimeReady } from '../lib/runtime';
import { defaultWhatsAppTemplate, renderWhatsAppMessage, whatsappUrl } from '../lib/whatsapp';

type Screen = 'dashboard' | 'intake' | 'packages' | 'admin';
type Notice = { kind: 'success' | 'error' | 'info'; text: string } | null;

const zeroStats: DashboardStats = {
  received_today: 0,
  awaiting_identification: 0,
  awaiting_notification: 0,
  awaiting_pickup: 0,
  picked_up_today: 0,
  old_packages: 0,
  problems: 0
};

function Loading() {
  return (
    <main class="auth-shell" aria-live="polite">
      <div class="auth-card">
        <span class="spinner" /> <p>Conferindo sessão e permissões…</p>
      </div>
    </main>
  );
}

function Login({ client }: { client: SupabaseClient }) {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: Event) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setNotice({ kind: 'success', text: 'Se o acesso existir, as instruções foram enviadas.' });
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setNotice({
        kind: 'error',
        text: /invalid login/i.test(String(error))
          ? 'E-mail ou senha não conferem.'
          : friendlyError(error)
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main class="auth-shell">
      <section class="auth-card">
        <a class="brand brand-large" href="/" aria-label="CondoLogPro">
          <span>condolog</span>
          <strong>pro</strong>
        </a>
        <p class="eyebrow">Operação de portaria</p>
        <h1>{mode === 'login' ? 'Entre para continuar.' : 'Recupere seu acesso.'}</h1>
        <p class="muted">
          Dados de moradores e imagens ficam disponíveis somente a usuários ativos do condomínio.
        </p>
        {notice && (
          <div class={`notice ${notice.kind}`} role="status">
            {notice.text}
          </div>
        )}
        <form class="form-stack" onSubmit={submit}>
          <label>
            E-mail
            <input
              type="email"
              autoComplete="email"
              value={email}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </label>
          {mode === 'login' && (
            <label>
              Senha
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onInput={(e) => setPassword(e.currentTarget.value)}
                minLength={10}
                required
              />
            </label>
          )}
          <button class="button primary full" disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Enviar recuperação'}
          </button>
        </form>
        <button
          class="link-button"
          onClick={() => {
            setMode(mode === 'login' ? 'reset' : 'login');
            setNotice(null);
          }}
        >
          {mode === 'login' ? 'Esqueci minha senha' : 'Voltar ao login'}
        </button>
      </section>
    </main>
  );
}

function PasswordRecovery({ client, done }: { client: SupabaseClient; done: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: Event) {
    event.preventDefault();
    if (password !== confirmation) {
      setNotice({ kind: 'error', text: 'As senhas não conferem.' });
      return;
    }
    setBusy(true);
    const result = await client.auth.updateUser({ password });
    setBusy(false);
    if (result.error) setNotice({ kind: 'error', text: friendlyError(result.error) });
    else {
      setNotice({ kind: 'success', text: 'Senha atualizada.' });
      done();
    }
  }

  return (
    <main class="auth-shell">
      <section class="auth-card">
        <p class="eyebrow">Recuperação de acesso</p>
        <h1>Crie uma nova senha.</h1>
        {notice && <div class={`notice ${notice.kind}`}>{notice.text}</div>}
        <form class="form-stack" onSubmit={submit}>
          <label>
            Nova senha
            <input
              type="password"
              minLength={10}
              autoComplete="new-password"
              value={password}
              onInput={(event) => setPassword(event.currentTarget.value)}
              required
            />
          </label>
          <label>
            Confirmar senha
            <input
              type="password"
              minLength={10}
              autoComplete="new-password"
              value={confirmation}
              onInput={(event) => setConfirmation(event.currentTarget.value)}
              required
            />
          </label>
          <button class="button primary full" disabled={busy}>
            {busy ? 'Atualizando…' : 'Atualizar senha'}
          </button>
        </form>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: PackageStatus }) {
  return (
    <span class={`status status-${status}`}>
      <span aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

function Dashboard({
  client,
  context,
  go
}: {
  client: SupabaseClient;
  context: SessionContext;
  go: (screen: Screen) => void;
}) {
  const [stats, setStats] = useState(zeroStats);
  const [recent, setRecent] = useState<PackageSummary[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  async function refresh() {
    setBusy(true);
    try {
      const [dashboard, packages] = await Promise.all([
        loadDashboard(client, context.condominium.id),
        listPackages(client, context.condominium.id, { pageSize: 8 })
      ]);
      setStats(dashboard);
      setRecent(packages.rows);
      setError('');
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [context.condominium.id]);

  const cards = [
    ['Recebidas hoje', stats.received_today, 'neutral'],
    ['Identificar', stats.awaiting_identification, 'attention'],
    ['Notificar', stats.awaiting_notification, 'attention'],
    ['Aguardando retirada', stats.awaiting_pickup, 'signal'],
    ['Retiradas hoje', stats.picked_up_today, 'success'],
    ['Antigas', stats.old_packages, 'attention'],
    ['Com problema', stats.problems, 'danger']
  ] as const;

  return (
    <div class="page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Visão operacional</p>
          <h1>Bom trabalho, {context.fullName.split(' ')[0]}.</h1>
          <p class="muted">{context.condominium.name} · dados atualizados do Supabase</p>
        </div>
        <button
          class="icon-button"
          aria-label="Atualizar dashboard"
          onClick={() => void refresh()}
          disabled={busy}
        >
          <RefreshCw size={20} />
        </button>
      </div>
      {error && (
        <div class="notice error" role="alert">
          {error}
        </div>
      )}
      <section class="quick-actions" aria-label="Ações rápidas">
        <button class="quick-action primary" onClick={() => go('intake')}>
          <PackagePlus />
          <span>
            <strong>Receber encomenda</strong>
            <small>Câmera, OCR e associação</small>
          </span>
          <ChevronRight />
        </button>
        <button class="quick-action" onClick={() => go('packages')}>
          <Search />
          <span>
            <strong>Localizar encomenda</strong>
            <small>Busca, filtros e retirada</small>
          </span>
          <ChevronRight />
        </button>
      </section>
      <section class="metric-grid" aria-label="Indicadores de hoje">
        {cards.map(([label, value, tone]) => (
          <article class={`metric ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{busy ? '–' : value}</strong>
          </article>
        ))}
      </section>
      <section class="section-card">
        <div class="section-title">
          <div>
            <p class="eyebrow">Atividade recente</p>
            <h2>Últimas encomendas</h2>
          </div>
          <button class="link-button" onClick={() => go('packages')}>
            Ver todas
          </button>
        </div>
        <PackageRows
          packages={recent}
          empty="Nenhuma encomenda registrada ainda."
          onOpen={() => go('packages')}
        />
      </section>
    </div>
  );
}

function PackageRows({
  packages,
  onOpen,
  empty
}: {
  packages: PackageSummary[];
  onOpen?: (item: PackageSummary) => void;
  empty: string;
}) {
  if (!packages.length)
    return (
      <div class="empty">
        <Archive />
        <p>{empty}</p>
      </div>
    );
  return (
    <div class="package-list">
      {packages.map((item) => {
        const unit = item.units
          ? `${item.units.blocks?.label ?? item.units.blocks?.code ?? 'Bloco'} · ${item.units.label ?? item.units.number}`
          : 'Unidade não associada';
        return (
          <button
            class="package-row"
            key={item.id}
            onClick={() => onOpen?.(item)}
            disabled={!onOpen}
          >
            <span class="package-mark">
              <PackageCheck size={20} />
            </span>
            <span class="package-main">
              <strong>{item.recipient_name}</strong>
              <small>
                {unit} · {item.tracking_code || 'Sem código'}
              </small>
            </span>
            <span class="package-meta">
              <StatusBadge status={item.status} />
              <small>{formatDateTime(item.received_at)}</small>
            </span>
            {onOpen && <ChevronRight size={18} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

function Intake({
  client,
  context,
  onDone
}: {
  client: SupabaseClient;
  context: SessionContext;
  onDone: (packageId: string) => void;
}) {
  const [draft, setDraft] = useState<IntakeDraft>(() => loadDraft());
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [residentQuery, setResidentQuery] = useState('');
  const [unitQuery, setUnitQuery] = useState('');
  const [residents, setResidents] = useState<ResidentResult[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [duplicates, setDuplicates] = useState<
    {
      id: string;
      recipient_name: string;
      tracking_code: string | null;
      duplicate_score: number;
      duplicate_reasons: string[];
    }[]
  >([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'closed' | 'opening' | 'open'>('closed');

  useEffect(() => saveDraft(draft), [draft]);
  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image.previewUrl);
    },
    [image]
  );
  useEffect(() => {
    if (cameraState === 'open' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [cameraState]);
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    []
  );

  function change(patch: Partial<IntakeDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    setNotice(null);
    try {
      const prepared = await prepareImage(file);
      if (image) URL.revokeObjectURL(image.previewUrl);
      setImage(prepared);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      setNotice({
        kind: 'error',
        text:
          code === 'IMAGE_TOO_LARGE'
            ? 'A imagem excede 10 MB.'
            : 'Use uma imagem JPG, PNG ou WebP válida.'
      });
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraState('closed');
  }

  async function openCamera() {
    setNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice({
        kind: 'error',
        text: 'Câmera indisponível neste navegador. Escolha uma imagem ou continue manualmente.'
      });
      return;
    }
    setCameraState('opening');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } }
      });
      setCameraState('open');
    } catch (error) {
      setCameraState('closed');
      const denied = error instanceof DOMException && error.name === 'NotAllowedError';
      setNotice({
        kind: 'error',
        text: denied
          ? 'Permissão de câmera negada. Libere-a no navegador, escolha uma imagem ou continue manualmente.'
          : 'Não foi possível iniciar a câmera. Escolha uma imagem ou continue manualmente.'
      });
    }
  }

  async function captureCameraFrame() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error('CAMERA_CAPTURE_FAILED'))),
        'image/jpeg',
        0.9
      )
    );
    closeCamera();
    await chooseFile(new File([blob], `etiqueta-${Date.now()}.jpg`, { type: 'image/jpeg' }));
  }

  async function runOcr() {
    if (!image) return;
    setOcrProgress(0);
    setNotice({ kind: 'info', text: 'Reconhecendo a etiqueta no próprio navegador…' });
    try {
      const recognition = await recognizeLabel(image.file, setOcrProgress);
      change({
        recognition,
        recipientName: recognition.fields.recipientName || draft.recipientName,
        trackingCode: recognition.fields.trackingCode || draft.trackingCode,
        carrierName: recognition.fields.carrier || draft.carrierName
      });
      setUnitQuery([recognition.fields.block, recognition.fields.unit].filter(Boolean).join(' '));
      setNotice({
        kind: recognition.lowConfidence ? 'info' : 'success',
        text: recognition.lowConfidence
          ? 'Leitura parcial. Confira os campos destacados antes de salvar.'
          : 'Etiqueta lida. Confirme ou corrija os dados sugeridos.'
      });
    } catch {
      setNotice({
        kind: 'error',
        text: 'Não foi possível ler a etiqueta. Continue pelo preenchimento manual; a imagem foi mantida.'
      });
    } finally {
      setOcrProgress(null);
    }
  }

  async function queryResidents() {
    if (residentQuery.trim().length < 2) return setResidents([]);
    try {
      setResidents(await searchResidents(client, context.condominium.id, residentQuery));
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    }
  }

  async function queryUnits() {
    try {
      setUnits(await searchUnits(client, context.condominium.id, unitQuery));
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    }
  }

  async function submit(event: Event) {
    event.preventDefault();
    setNotice(null);
    if (draft.recipientName.trim().length < 2)
      return setNotice({ kind: 'error', text: 'Informe o nome que aparece na encomenda.' });
    if (!draft.unitId && draft.notes.trim().length < 5)
      return setNotice({
        kind: 'error',
        text: 'Sem unidade associada, registre uma observação para orientar a identificação.'
      });
    setBusy(true);
    try {
      const candidates = await findDuplicates(client, context.condominium.id, draft);
      if (candidates.length && !draft.duplicateOverrideReason.trim()) {
        setDuplicates(candidates);
        setNotice({
          kind: 'info',
          text: 'Há sinais de duplicidade. Confira e registre por que esta é uma nova entrada.'
        });
        return;
      }
      const packageId = await createIntake(client, context.condominium.id, draft, image);
      clearDraft();
      setNotice({
        kind: 'success',
        text: 'Encomenda registrada com histórico e imagem protegida.'
      });
      onDone(packageId);
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    } finally {
      setBusy(false);
    }
  }

  const selectedUnit = units.find((unit) => unit.id === draft.unitId);
  const selectedResident = residents.find((resident) => resident.resident_id === draft.residentId);

  return (
    <div class="page narrow">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Novo recebimento</p>
          <h1>Fotografe. Confira. Associe.</h1>
          <p class="muted">O OCR sugere; você sempre decide o que será salvo.</p>
        </div>
      </div>
      {notice && (
        <div class={`notice ${notice.kind}`} role="status">
          {notice.text}
        </div>
      )}
      <form onSubmit={submit} class="intake-flow">
        <section class="section-card intake-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h2>Etiqueta da encomenda</h2>
            <p class="muted">A imagem original será guardada em bucket privado.</p>
            <input
              ref={fileRef}
              class="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void chooseFile(event.currentTarget.files?.[0])}
            />
            {cameraState === 'open' ? (
              <div class="camera-preview">
                <video ref={videoRef} playsInline muted aria-label="Prévia ao vivo da câmera" />
                <div class="image-actions">
                  <button type="button" class="button secondary" onClick={closeCamera}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="button primary"
                    onClick={() => void captureCameraFrame()}
                  >
                    <Camera size={18} /> Fotografar etiqueta
                  </button>
                </div>
              </div>
            ) : !image ? (
              <div class="capture-options">
                <button
                  type="button"
                  class="capture"
                  onClick={() => void openCamera()}
                  disabled={cameraState === 'opening'}
                >
                  <Camera size={32} />
                  <strong>{cameraState === 'opening' ? 'Abrindo câmera…' : 'Abrir câmera'}</strong>
                  <small>Enquadre a etiqueta e confirme a foto</small>
                </button>
                <button
                  type="button"
                  class="button secondary full"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageIcon size={18} /> Escolher imagem
                </button>
              </div>
            ) : (
              <div class="image-preview">
                <img src={image.previewUrl} alt="Prévia da etiqueta selecionada" />
                <div class="image-actions">
                  <button
                    type="button"
                    class="button secondary"
                    onClick={() => fileRef.current?.click()}
                  >
                    <RefreshCw size={18} /> Refazer
                  </button>
                  <button
                    type="button"
                    class="button primary"
                    onClick={() => void runOcr()}
                    disabled={ocrProgress !== null}
                  >
                    <ImageIcon size={18} />{' '}
                    {ocrProgress === null
                      ? 'Ler etiqueta'
                      : `Lendo ${Math.round(ocrProgress * 100)}%`}
                  </button>
                </div>
              </div>
            )}
            {!image && cameraState !== 'open' && (
              <p class="field-help">
                Câmera indisponível ou permissão negada? Use o seletor de arquivo ou continue
                manualmente.
              </p>
            )}
          </div>
        </section>
        <section class="section-card intake-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h2>Dados reconhecidos</h2>
            <p class="muted">Campos com sugestão de baixa confiança devem ser conferidos.</p>
            <div class="form-grid">
              <label class={draft.recognition?.lowConfidence ? 'needs-review' : ''}>
                Destinatário
                <input
                  value={draft.recipientName}
                  onInput={(e) => change({ recipientName: e.currentTarget.value })}
                  placeholder="Nome na etiqueta"
                  required
                />
              </label>
              <label>
                Código de rastreio
                <input
                  value={draft.trackingCode}
                  onInput={(e) => change({ trackingCode: e.currentTarget.value.toUpperCase() })}
                  placeholder="Opcional"
                />
              </label>
              <label>
                Transportadora
                <input
                  value={draft.carrierName}
                  onInput={(e) => change({ carrierName: e.currentTarget.value })}
                  placeholder="Ex.: Correios"
                />
              </label>
              <label>
                Tipo
                <select
                  value={draft.volumeType}
                  onChange={(e) =>
                    change({ volumeType: e.currentTarget.value as IntakeDraft['volumeType'] })
                  }
                >
                  <option value="envelope">Envelope</option>
                  <option value="package">Pacote</option>
                  <option value="box">Caixa</option>
                  <option value="large_volume">Volume grande</option>
                  <option value="other">Outro</option>
                </select>
              </label>
              <label>
                Quantidade
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={draft.quantity}
                  onInput={(e) => change({ quantity: Number(e.currentTarget.value) })}
                />
              </label>
            </div>
          </div>
        </section>
        <section class="section-card intake-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h2>Unidade e morador</h2>
            <p class="muted">
              Busque por bloco/apartamento ou por nome/telefone. O telefone aparece mascarado.
            </p>
            <div class="lookup-grid">
              <div>
                <label>
                  Bloco ou unidade
                  <div class="input-action">
                    <input
                      value={unitQuery}
                      onInput={(e) => setUnitQuery(e.currentTarget.value)}
                      placeholder="Ex.: Bloco A 104"
                    />
                    <button
                      type="button"
                      aria-label="Buscar unidade"
                      onClick={() => void queryUnits()}
                    >
                      <Search />
                    </button>
                  </div>
                </label>
                {selectedUnit && (
                  <div class="selection">
                    <Building2 />
                    <span>
                      <strong>{selectedUnit.blocks?.label ?? selectedUnit.blocks?.code}</strong>
                      <small>{selectedUnit.label ?? selectedUnit.number}</small>
                    </span>
                    <button
                      type="button"
                      aria-label="Remover unidade"
                      onClick={() => change({ unitId: '', residentId: '' })}
                    >
                      <X />
                    </button>
                  </div>
                )}
                {!selectedUnit && units.length > 0 && (
                  <div class="result-list">
                    {units.map((unit) => (
                      <button
                        type="button"
                        key={unit.id}
                        onClick={() => {
                          change({ unitId: unit.id, residentId: '' });
                          setUnits([]);
                        }}
                      >
                        <span>{unit.blocks?.label ?? unit.blocks?.code}</span>
                        <strong>{unit.label ?? unit.number}</strong>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label>
                  Morador
                  <div class="input-action">
                    <input
                      value={residentQuery}
                      onInput={(e) => setResidentQuery(e.currentTarget.value)}
                      placeholder="Nome, unidade ou telefone"
                    />
                    <button
                      type="button"
                      aria-label="Buscar morador"
                      onClick={() => void queryResidents()}
                    >
                      <Search />
                    </button>
                  </div>
                </label>
                {selectedResident && (
                  <div class="selection">
                    <Users />
                    <span>
                      <strong>{selectedResident.full_name}</strong>
                      <small>
                        {selectedResident.block_label} · {selectedResident.unit_number} ·{' '}
                        {maskPhone(selectedResident.phone_last4)}
                      </small>
                    </span>
                    <button
                      type="button"
                      aria-label="Remover morador"
                      onClick={() => change({ residentId: '' })}
                    >
                      <X />
                    </button>
                  </div>
                )}
                {!selectedResident && residents.length > 0 && (
                  <div class="result-list">
                    {residents.map((resident) => (
                      <button
                        type="button"
                        key={`${resident.resident_id}-${resident.unit_id}`}
                        onClick={() => {
                          change({
                            residentId: resident.resident_id,
                            unitId: resident.unit_id,
                            recipientName: draft.recipientName || resident.full_name
                          });
                          setResidents([]);
                        }}
                      >
                        <span>
                          <strong>{resident.full_name}</strong>
                          <small>
                            {resident.block_label} · {resident.unit_number}
                          </small>
                        </span>
                        <small>
                          {resident.phone_last4 ? `•••• ${resident.phone_last4}` : 'Sem telefone'}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <label>
              Observações
              <textarea
                value={draft.notes}
                onInput={(e) => change({ notes: e.currentTarget.value })}
                placeholder="Destinatário não encontrado, terceiro, etiqueta parcial ou orientação à portaria"
                rows={3}
              />
            </label>
          </div>
        </section>
        {duplicates.length > 0 && (
          <section class="section-card duplicate-warning">
            <AlertCircle />
            <div>
              <h2>Possível duplicidade</h2>
              {duplicates.map((item) => (
                <p key={item.id}>
                  {item.recipient_name} · {item.tracking_code || 'sem código'} · sinais:{' '}
                  {item.duplicate_reasons.join(', ')}
                </p>
              ))}
              <label>
                Motivo para registrar mesmo assim
                <textarea
                  value={draft.duplicateOverrideReason}
                  onInput={(e) => change({ duplicateOverrideReason: e.currentTarget.value })}
                  required
                  rows={2}
                />
              </label>
            </div>
          </section>
        )}
        <div class="sticky-submit">
          <span>
            <strong>{draft.recipientName || 'Destinatário pendente'}</strong>
            <small>
              {selectedUnit
                ? `${selectedUnit.blocks?.code} · ${selectedUnit.number}`
                : 'Sem unidade associada'}
            </small>
          </span>
          <button class="button primary" disabled={busy}>
            {busy ? 'Salvando…' : 'Registrar encomenda'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Packages({
  client,
  context,
  focusPackageId
}: {
  client: SupabaseClient;
  context: SessionContext;
  focusPackageId?: string | null;
}) {
  const [items, setItems] = useState<PackageSummary[]>([]);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PackageStatus | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [oldOnly, setOldOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PackageSummary | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setBusy(true);
    try {
      const result = await listPackages(client, context.condominium.id, {
        query,
        status,
        from,
        to,
        oldOnly,
        page,
        pageSize: 25
      });
      setItems(result.rows);
      setCount(result.count);
      if (focusPackageId)
        setSelected(result.rows.find((item) => item.id === focusPackageId) ?? null);
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, [page, status, focusPackageId]);

  return (
    <div class="page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Consulta operacional</p>
          <h1>Encomendas</h1>
          <p class="muted">{count} registros no filtro atual</p>
        </div>
      </div>
      {notice && <div class={`notice ${notice.kind}`}>{notice.text}</div>}
      <form
        class="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          void refresh();
        }}
      >
        <label class="search-field">
          <Search />
          <span class="visually-hidden">Buscar</span>
          <input
            value={query}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder="Nome, bloco, unidade, código, operador ou transportadora"
          />
        </label>
        <label>
          <span class="visually-hidden">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.currentTarget.value as PackageStatus | '');
              setPage(0);
            }}
          >
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label class="compact-field">
          <span>De</span>
          <input type="date" value={from} onInput={(event) => setFrom(event.currentTarget.value)} />
        </label>
        <label class="compact-field">
          <span>Até</span>
          <input type="date" value={to} onInput={(event) => setTo(event.currentTarget.value)} />
        </label>
        <label class="checkbox-field">
          <input
            type="checkbox"
            checked={oldOnly}
            onChange={(event) => setOldOnly(event.currentTarget.checked)}
          />
          Somente antigas
        </label>
        <button class="button secondary" disabled={busy}>
          Buscar
        </button>
      </form>
      <section class="section-card">
        <PackageRows
          packages={items}
          empty="Nenhum registro corresponde à busca."
          onOpen={setSelected}
        />
        {count > 25 && (
          <div class="pagination">
            <button disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
              Anterior
            </button>
            <span>
              Página {page + 1} de {Math.ceil(count / 25)}
            </span>
            <button
              disabled={(page + 1) * 25 >= count}
              onClick={() => setPage((value) => value + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </section>
      {selected && (
        <PackageDetail
          client={client}
          context={context}
          item={selected}
          close={() => setSelected(null)}
          changed={() => {
            setSelected(null);
            void refresh();
          }}
        />
      )}
    </div>
  );
}

function PackageDetail({
  client,
  context,
  item,
  close,
  changed
}: {
  client: SupabaseClient;
  context: SessionContext;
  item: PackageSummary;
  close: () => void;
  changed: () => void;
}) {
  const [tab, setTab] = useState<'summary' | 'notify' | 'pickup'>('summary');
  const [notice, setNotice] = useState<Notice>(null);
  const [message, setMessage] = useState(() =>
    renderWhatsAppMessage(defaultWhatsAppTemplate, {
      condominium: context.condominium.name,
      recipient: item.residents?.full_name ?? item.recipient_name,
      unit: item.units
        ? `${item.units.blocks?.label ?? item.units.blocks?.code} ${item.units.label ?? item.units.number}`
        : 'unidade a confirmar',
      trackingCode: item.tracking_code
    })
  );
  const [whatsAppOpened, setWhatsAppOpened] = useState(false);
  const [pickup, setPickup] = useState({
    name: '',
    relation: 'resident',
    documentLast4: '',
    notes: ''
  });
  const [busy, setBusy] = useState(false);
  const [evidence, setEvidence] = useState<PackageEvidence | null>(null);
  const [pickupProof, setPickupProof] = useState<PreparedImage | null>(null);
  const pickupProofRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void loadPackageEvidence(client, item.id)
      .then((value) => {
        if (active) setEvidence(value);
      })
      .catch((error: unknown) => {
        if (active) setNotice({ kind: 'error', text: friendlyError(error) });
      });
    return () => {
      active = false;
    };
  }, [client, item.id]);

  function openWhatsApp() {
    try {
      const phone = item.residents?.phone;
      if (!phone) throw new Error('INVALID_WHATSAPP_PHONE');
      window.open(whatsappUrl(phone, message), '_blank', 'noopener,noreferrer');
      setWhatsAppOpened(true);
      setNotice({
        kind: 'info',
        text: 'O WhatsApp foi aberto. Só confirme abaixo depois de efetivamente enviar.'
      });
    } catch {
      setNotice({
        kind: 'error',
        text: 'Morador sem telefone válido. Copie a mensagem e use outro canal operacional.'
      });
    }
  }

  async function registerNotification() {
    setBusy(true);
    try {
      await confirmNotification(client, item.id, message, phoneLast4(item.residents?.phone));
      changed();
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function registerPickup(event: Event) {
    event.preventDefault();
    if (
      !window.confirm(`Confirmar retirada por ${pickup.name}? Esta ação altera a fila operacional.`)
    )
      return;
    setBusy(true);
    try {
      await completePickup(
        client,
        context.condominium.id,
        item.id,
        item.version,
        pickup,
        pickupProof
      );
      changed();
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function reopenPickup() {
    const reason = window.prompt('Informe o motivo da correção (mínimo de 8 caracteres).');
    if (!reason || reason.trim().length < 8) {
      setNotice({ kind: 'error', text: 'A correção exige um motivo com pelo menos 8 caracteres.' });
      return;
    }
    setBusy(true);
    const result = await client.rpc('reopen_package', {
      p_package_id: item.id,
      p_reason: reason.trim()
    });
    setBusy(false);
    if (result.error) setNotice({ kind: 'error', text: friendlyError(result.error) });
    else changed();
  }

  const canNotify = item.status === 'awaiting_notification' || item.status === 'awaiting_pickup';
  const canPickup = item.status === 'awaiting_notification' || item.status === 'awaiting_pickup';
  return (
    <div class="drawer-backdrop">
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="package-title">
        <div class="drawer-head">
          <div>
            <p class="eyebrow">Detalhe da encomenda</p>
            <h2 id="package-title">{item.recipient_name}</h2>
          </div>
          <button class="icon-button" aria-label="Fechar" onClick={close}>
            <X />
          </button>
        </div>
        <StatusBadge status={item.status} />
        {notice && <div class={`notice ${notice.kind}`}>{notice.text}</div>}
        <div class="tabs" role="tablist">
          <button class={tab === 'summary' ? 'active' : ''} onClick={() => setTab('summary')}>
            Resumo
          </button>
          <button
            disabled={!canNotify}
            class={tab === 'notify' ? 'active' : ''}
            onClick={() => setTab('notify')}
          >
            WhatsApp
          </button>
          <button
            disabled={!canPickup}
            class={tab === 'pickup' ? 'active' : ''}
            onClick={() => setTab('pickup')}
          >
            Retirada
          </button>
        </div>
        {tab === 'summary' && (
          <div class="summary-stack">
            {evidence?.images[0]?.signed_url && (
              <figure class="evidence-image">
                <img src={evidence.images[0].signed_url} alt="Etiqueta protegida da encomenda" />
                <figcaption>URL temporária · expira em cinco minutos</figcaption>
              </figure>
            )}
            <dl class="detail-list">
              <div>
                <dt>Recebida</dt>
                <dd>{formatDateTime(item.received_at)}</dd>
              </div>
              <div>
                <dt>Unidade</dt>
                <dd>
                  {item.units
                    ? `${item.units.blocks?.label ?? item.units.blocks?.code} · ${item.units.label ?? item.units.number}`
                    : 'Não associada'}
                </dd>
              </div>
              <div>
                <dt>Morador</dt>
                <dd>{item.residents?.full_name ?? 'Não associado'}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{maskPhone(item.residents?.phone)}</dd>
              </div>
              <div>
                <dt>Rastreio</dt>
                <dd>{item.tracking_code || 'Não informado'}</dd>
              </div>
              <div>
                <dt>Transportadora</dt>
                <dd>{item.carrier_name || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Observações</dt>
                <dd>{item.notes || 'Sem observações'}</dd>
              </div>
            </dl>
            <section class="timeline-section">
              <p class="eyebrow">Linha do tempo</p>
              {!evidence ? (
                <p class="muted">Carregando histórico…</p>
              ) : evidence.history.length === 0 ? (
                <p class="muted">Sem eventos registrados.</p>
              ) : (
                <ol class="timeline">
                  {evidence.history.map((event) => (
                    <li key={event.id}>
                      <span aria-hidden="true" />
                      <div>
                        <StatusBadge status={event.to_status} />
                        <p>{event.reason ?? 'Mudança operacional'}</p>
                        <small>{formatDateTime(event.created_at)}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            {evidence && evidence.notifications.length > 0 && (
              <section class="timeline-section">
                <p class="eyebrow">Comunicações</p>
                {evidence.notifications.map((notification) => (
                  <article class="evidence-note" key={notification.id}>
                    <strong>
                      WhatsApp ·{' '}
                      {notification.status === 'sent_confirmed'
                        ? 'envio confirmado'
                        : notification.status}
                    </strong>
                    <p>{notification.rendered_message}</p>
                    <small>
                      {formatDateTime(notification.confirmed_at ?? notification.created_at)} ·
                      telefone •••• {notification.phone_last4 ?? 'não informado'}
                    </small>
                  </article>
                ))}
              </section>
            )}
            {evidence && evidence.pickups.length > 0 && (
              <section class="timeline-section">
                <p class="eyebrow">Retiradas</p>
                {evidence.pickups.map((pickupEvent) => (
                  <article class="evidence-note" key={pickupEvent.id}>
                    <strong>
                      {pickupEvent.voided_at ? 'Retirada anulada' : 'Retirada concluída'} ·{' '}
                      {pickupEvent.picked_up_by_name}
                    </strong>
                    <p>
                      Relação: {pickupEvent.relation}
                      {pickupEvent.notes ? ` · ${pickupEvent.notes}` : ''}
                    </p>
                    {pickupEvent.proof_signed_url && (
                      <a
                        class="proof-link"
                        href={pickupEvent.proof_signed_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir comprovante temporário
                      </a>
                    )}
                    <small>{formatDateTime(pickupEvent.picked_up_at)}</small>
                  </article>
                ))}
              </section>
            )}
            {item.status === 'picked_up' && context.roles.includes('admin') && (
              <button
                class="button secondary full"
                disabled={busy}
                onClick={() => void reopenPickup()}
              >
                Reabrir retirada com motivo
              </button>
            )}
          </div>
        )}
        {tab === 'notify' && (
          <div class="drawer-form">
            <label>
              Mensagem editável
              <textarea
                rows={8}
                value={message}
                onInput={(e) => setMessage(e.currentTarget.value)}
              />
            </label>
            <p class="field-help">
              Abrir o WhatsApp não registra envio. A confirmação é uma ação separada do operador.
            </p>
            <button class="button secondary full" onClick={openWhatsApp}>
              Abrir WhatsApp
            </button>
            <button
              class="button primary full"
              disabled={!whatsAppOpened || busy}
              onClick={() => void registerNotification()}
            >
              <Check /> Confirmar que enviei
            </button>
          </div>
        )}
        {tab === 'pickup' && (
          <form class="drawer-form" onSubmit={registerPickup}>
            <label>
              Quem está retirando
              <input
                value={pickup.name}
                onInput={(e) => setPickup({ ...pickup, name: e.currentTarget.value })}
                minLength={2}
                required
              />
            </label>
            <label>
              Relação com a unidade
              <select
                value={pickup.relation}
                onChange={(e) => setPickup({ ...pickup, relation: e.currentTarget.value })}
              >
                <option value="resident">Morador</option>
                <option value="family">Familiar</option>
                <option value="employee">Funcionário</option>
                <option value="authorized_person">Pessoa autorizada</option>
                <option value="other">Outro</option>
              </select>
            </label>
            <label>
              Últimos dígitos do documento
              <input
                value={pickup.documentLast4}
                onInput={(e) =>
                  setPickup({
                    ...pickup,
                    documentLast4: e.currentTarget.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8)
                  })
                }
                placeholder="Opcional"
              />
            </label>
            <label>
              Observações
              <textarea
                rows={3}
                value={pickup.notes}
                onInput={(e) => setPickup({ ...pickup, notes: e.currentTarget.value })}
              />
            </label>
            <input
              ref={pickupProofRef}
              class="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) return;
                void prepareImage(file)
                  .then(setPickupProof)
                  .catch((error: unknown) =>
                    setNotice({ kind: 'error', text: friendlyError(error) })
                  );
              }}
            />
            <button
              type="button"
              class="button secondary full"
              onClick={() => pickupProofRef.current?.click()}
            >
              <Camera size={18} />{' '}
              {pickupProof ? 'Comprovante selecionado' : 'Adicionar comprovante fotográfico'}
            </button>
            <button class="button primary full" disabled={busy}>
              <ClipboardCheck /> Confirmar retirada
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}

function Admin({ client, context }: { client: SupabaseClient; context: SessionContext }) {
  const isAdmin = context.roles.includes('admin');
  const [section, setSection] = useState<
    'residents' | 'structure' | 'users' | 'templates' | 'condominium'
  >('residents');
  const [notice, setNotice] = useState<Notice>(null);
  const [blocks, setBlocks] = useState<{ id: string; code: string; label: string }[]>([]);
  const [adminUnits, setAdminUnits] = useState<UnitOption[]>([]);
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    blockCode: '',
    blockLabel: '',
    blockId: '',
    unitNumber: '',
    residentUnitQuery: '',
    residentUnitId: '',
    templateName: '',
    templateBody: defaultWhatsAppTemplate,
    inviteEmail: '',
    inviteName: '',
    inviteRole: 'front_desk',
    condominiumName: context.condominium.name,
    condominiumPhone: context.condominium.whatsapp_phone ?? '',
    retentionDays: context.condominium.retention_days
  });

  async function refreshBlocks() {
    const result = await client
      .from('blocks')
      .select('id,code,label')
      .eq('condominium_id', context.condominium.id)
      .eq('is_active', true)
      .order('sort_order');
    if (result.error) setNotice({ kind: 'error', text: friendlyError(result.error) });
    else setBlocks(result.data);
  }

  useEffect(() => {
    if (isAdmin && section === 'structure') void refreshBlocks();
  }, [isAdmin, section]);
  if (!isAdmin)
    return (
      <div class="page narrow">
        <div class="access-denied">
          <ShieldCheck />
          <p class="eyebrow">Acesso restrito</p>
          <h1>Somente a administração configura o condomínio.</h1>
          <p>
            Seu papel operacional continua autorizado para recebimento, comunicação, consulta e
            retirada.
          </p>
        </div>
      </div>
    );

  async function insert(table: string, payload: Record<string, unknown>, success: string) {
    setNotice(null);
    const result = await client.from(table).insert(payload);
    if (result.error) setNotice({ kind: 'error', text: friendlyError(result.error) });
    else setNotice({ kind: 'success', text: success });
  }

  async function invite(event: Event) {
    event.preventDefault();
    const result = await client.functions.invoke('admin-invite-user', {
      body: {
        email: values.inviteEmail,
        fullName: values.inviteName,
        roleCode: values.inviteRole,
        condominiumId: context.condominium.id,
        redirectTo: window.location.origin
      }
    });
    if (result.error) setNotice({ kind: 'error', text: friendlyError(result.error) });
    else setNotice({ kind: 'success', text: 'Convite criado e papel associado.' });
  }

  async function createResident(event: Event) {
    event.preventDefault();
    setNotice(null);
    const resident = await client
      .from('residents')
      .insert({
        condominium_id: context.condominium.id,
        full_name: values.name,
        phone: values.phone || null,
        email: values.email || null
      })
      .select('id')
      .single();
    if (resident.error) return setNotice({ kind: 'error', text: friendlyError(resident.error) });
    if (values.residentUnitId) {
      const link = await client.from('resident_units').insert({
        condominium_id: context.condominium.id,
        resident_id: resident.data.id,
        unit_id: values.residentUnitId,
        is_primary: true
      });
      if (link.error)
        return setNotice({
          kind: 'error',
          text: 'Morador criado, mas o vínculo com a unidade falhou. Revise o cadastro antes de repetir.'
        });
    }
    setNotice({ kind: 'success', text: 'Morador cadastrado e vinculado à unidade.' });
  }

  async function findAdminUnits() {
    try {
      setAdminUnits(await searchUnits(client, context.condominium.id, values.residentUnitQuery));
    } catch (error) {
      setNotice({ kind: 'error', text: friendlyError(error) });
    }
  }

  return (
    <div class="page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Administração</p>
          <h1>Configurações operacionais</h1>
          <p class="muted">Alterações estruturais são isoladas por condomínio e auditáveis.</p>
        </div>
      </div>
      {notice && <div class={`notice ${notice.kind}`}>{notice.text}</div>}
      <div class="admin-layout">
        <nav class="admin-nav" aria-label="Configurações">
          <button
            class={section === 'residents' ? 'active' : ''}
            onClick={() => setSection('residents')}
          >
            <Users />
            Moradores
          </button>
          <button
            class={section === 'structure' ? 'active' : ''}
            onClick={() => setSection('structure')}
          >
            <Building2 />
            Estrutura
          </button>
          <button class={section === 'users' ? 'active' : ''} onClick={() => setSection('users')}>
            <ShieldCheck />
            Usuários
          </button>
          <button
            class={section === 'templates' ? 'active' : ''}
            onClick={() => setSection('templates')}
          >
            <Settings />
            Mensagens
          </button>
          <button
            class={section === 'condominium' ? 'active' : ''}
            onClick={() => setSection('condominium')}
          >
            <Home />
            Condomínio
          </button>
        </nav>
        <section class="section-card admin-panel">
          {section === 'residents' && (
            <form onSubmit={createResident}>
              <h2>Novo morador</h2>
              <p class="muted">O cadastro não cria acesso ao sistema.</p>
              <div class="form-grid">
                <label>
                  Nome completo
                  <input
                    value={values.name}
                    onInput={(e) => setValues({ ...values, name: e.currentTarget.value })}
                    required
                  />
                </label>
                <label>
                  Telefone
                  <input
                    value={values.phone}
                    onInput={(e) => setValues({ ...values, phone: e.currentTarget.value })}
                  />
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={values.email}
                    onInput={(e) => setValues({ ...values, email: e.currentTarget.value })}
                  />
                </label>
                <label>
                  Unidade
                  <div class="input-action">
                    <input
                      value={values.residentUnitQuery}
                      onInput={(e) =>
                        setValues({ ...values, residentUnitQuery: e.currentTarget.value })
                      }
                      placeholder="Bloco ou apartamento"
                    />
                    <button
                      type="button"
                      aria-label="Buscar unidade"
                      onClick={() => void findAdminUnits()}
                    >
                      <Search />
                    </button>
                  </div>
                </label>
              </div>
              {adminUnits.length > 0 && (
                <div class="result-list">
                  {adminUnits.map((unit) => (
                    <button
                      type="button"
                      key={unit.id}
                      onClick={() => {
                        setValues({
                          ...values,
                          residentUnitId: unit.id,
                          residentUnitQuery: `${unit.blocks?.label ?? unit.blocks?.code} · ${unit.label ?? unit.number}`
                        });
                        setAdminUnits([]);
                      }}
                    >
                      <span>{unit.blocks?.label ?? unit.blocks?.code}</span>
                      <strong>{unit.label ?? unit.number}</strong>
                    </button>
                  ))}
                </div>
              )}
              <button class="button primary">Cadastrar morador</button>
            </form>
          )}
          {section === 'structure' && (
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void insert(
                    'blocks',
                    {
                      condominium_id: context.condominium.id,
                      code: values.blockCode,
                      label: values.blockLabel
                    },
                    'Bloco criado.'
                  );
                }}
              >
                <h2>Novo bloco</h2>
                <div class="form-grid">
                  <label>
                    Código
                    <input
                      value={values.blockCode}
                      onInput={(e) => setValues({ ...values, blockCode: e.currentTarget.value })}
                      required
                    />
                  </label>
                  <label>
                    Nome para exibição
                    <input
                      value={values.blockLabel}
                      onInput={(e) => setValues({ ...values, blockLabel: e.currentTarget.value })}
                      required
                    />
                  </label>
                </div>
                <button class="button primary">Criar bloco</button>
              </form>
              <form
                class="admin-subform"
                onSubmit={(event) => {
                  event.preventDefault();
                  void insert(
                    'units',
                    {
                      condominium_id: context.condominium.id,
                      block_id: values.blockId,
                      number: values.unitNumber,
                      label: `Apto ${values.unitNumber}`
                    },
                    'Unidade criada.'
                  );
                }}
              >
                <h2>Nova unidade</h2>
                <div class="form-grid">
                  <label>
                    Bloco
                    <select
                      value={values.blockId}
                      onChange={(e) => setValues({ ...values, blockId: e.currentTarget.value })}
                      required
                    >
                      <option value="">Selecione</option>
                      {blocks.map((block) => (
                        <option value={block.id} key={block.id}>
                          {block.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Número
                    <input
                      value={values.unitNumber}
                      onInput={(e) => setValues({ ...values, unitNumber: e.currentTarget.value })}
                      required
                    />
                  </label>
                </div>
                <button class="button primary">Criar unidade</button>
              </form>
            </div>
          )}
          {section === 'users' && (
            <form onSubmit={invite}>
              <h2>Convidar usuário</h2>
              <p class="muted">
                O convite passa por função protegida e só aceita administração autenticada.
              </p>
              <div class="form-grid">
                <label>
                  Nome
                  <input
                    value={values.inviteName}
                    onInput={(e) => setValues({ ...values, inviteName: e.currentTarget.value })}
                    required
                  />
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={values.inviteEmail}
                    onInput={(e) => setValues({ ...values, inviteEmail: e.currentTarget.value })}
                    required
                  />
                </label>
                <label>
                  Papel
                  <select
                    value={values.inviteRole}
                    onChange={(e) => setValues({ ...values, inviteRole: e.currentTarget.value })}
                  >
                    <option value="front_desk">Portaria</option>
                    <option value="manager">Gestão</option>
                    <option value="admin">Administração</option>
                  </select>
                </label>
              </div>
              <button class="button primary">Enviar convite</button>
            </form>
          )}
          {section === 'templates' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void insert(
                  'message_templates',
                  {
                    condominium_id: context.condominium.id,
                    name: values.templateName,
                    body: values.templateBody,
                    is_default: false
                  },
                  'Template criado.'
                );
              }}
            >
              <h2>Novo template</h2>
              <label>
                Nome
                <input
                  value={values.templateName}
                  onInput={(e) => setValues({ ...values, templateName: e.currentTarget.value })}
                  required
                />
              </label>
              <label>
                Mensagem
                <textarea
                  rows={7}
                  value={values.templateBody}
                  onInput={(e) => setValues({ ...values, templateBody: e.currentTarget.value })}
                  required
                />
              </label>
              <p class="field-help">
                Variáveis: {'{{morador}}'}, {'{{condominio}}'}, {'{{unidade}}'} e {'{{codigo}}'}.
              </p>
              <button class="button primary">Salvar template</button>
            </form>
          )}
          {section === 'condominium' && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void client
                  .from('condominiums')
                  .update({
                    name: values.condominiumName,
                    whatsapp_phone: values.condominiumPhone || null,
                    retention_days: values.retentionDays
                  })
                  .eq('id', context.condominium.id)
                  .then(({ error }) =>
                    setNotice(
                      error
                        ? { kind: 'error', text: friendlyError(error) }
                        : { kind: 'success', text: 'Configuração do condomínio atualizada.' }
                    )
                  );
              }}
            >
              <h2>Dados e retenção</h2>
              <p class="muted">
                A retenção define o prazo operacional; a exclusão física de imagens exige rotina
                administrativa documentada.
              </p>
              <div class="form-grid">
                <label>
                  Nome
                  <input
                    value={values.condominiumName}
                    onInput={(e) =>
                      setValues({ ...values, condominiumName: e.currentTarget.value })
                    }
                    required
                  />
                </label>
                <label>
                  WhatsApp institucional
                  <input
                    value={values.condominiumPhone}
                    onInput={(e) =>
                      setValues({ ...values, condominiumPhone: e.currentTarget.value })
                    }
                  />
                </label>
                <label>
                  Retenção em dias
                  <input
                    type="number"
                    min="30"
                    max="3650"
                    value={values.retentionDays}
                    onInput={(e) =>
                      setValues({ ...values, retentionDays: Number(e.currentTarget.value) })
                    }
                    required
                  />
                </label>
              </div>
              <button class="button primary">Salvar configuração</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default function CondoLogProApp() {
  const client = useMemo(() => (runtimeReady ? getSupabase() : null), []);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<SessionContext | null>(null);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authError, setAuthError] = useState('');
  const [focusPackageId, setFocusPackageId] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }
    let current = true;
    async function applyUser() {
      const { data } = await client!.auth.getUser();
      if (!current) return;
      if (!data.user) {
        setContext(null);
        setLoading(false);
        return;
      }
      try {
        setContext(await loadSessionContext(client!, data.user));
        setAuthError('');
      } catch (error) {
        setContext(null);
        setAuthError(
          error instanceof Error && error.message === 'INACTIVE_USER'
            ? 'Seu usuário existe, mas está inativo. Fale com a administração.'
            : friendlyError(error)
        );
      } finally {
        setLoading(false);
      }
    }
    void applyUser();
    const listener = client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setLoading(true);
      void applyUser();
    });
    return () => {
      current = false;
      listener.data.subscription.unsubscribe();
    };
  }, [client]);

  if (!runtimeReady || !client)
    return (
      <main class="auth-shell">
        <section class="auth-card">
          <a class="brand brand-large" href="/">
            <span>condolog</span>
            <strong>pro</strong>
          </a>
          <div class="notice error">
            <AlertCircle /> Ambiente sem Supabase configurado.
          </div>
          <p>
            Defina <code>PUBLIC_SUPABASE_URL</code> e <code>PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
            Nenhuma chave privilegiada deve entrar no navegador.
          </p>
        </section>
      </main>
    );
  if (loading) return <Loading />;
  if (passwordRecovery)
    return <PasswordRecovery client={client} done={() => setPasswordRecovery(false)} />;
  if (!context)
    return (
      <>
        <Login client={client} />
        {authError && <div class="auth-toast notice error">{authError}</div>}
      </>
    );

  const navigation: { id: Screen; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'intake', label: 'Receber', icon: PackagePlus },
    { id: 'packages', label: 'Encomendas', icon: Search },
    { id: 'admin', label: 'Administração', icon: Settings }
  ];
  function go(next: Screen) {
    setScreen(next);
    setMobileMenu(false);
    if (next !== 'packages') setFocusPackageId(null);
  }

  return (
    <div class="app-shell">
      <header class="topbar">
        <button
          class="icon-button mobile-only"
          aria-label="Abrir menu"
          onClick={() => setMobileMenu(true)}
        >
          <Menu />
        </button>
        <button class="brand brand-button" onClick={() => go('dashboard')}>
          <span>condolog</span>
          <strong>pro</strong>
        </button>
        <div class="topbar-context">
          <span>{context.condominium.name}</span>
          <small>
            {context.roles
              .map((role) =>
                role === 'front_desk' ? 'Portaria' : role === 'admin' ? 'Administração' : 'Gestão'
              )
              .join(' · ')}
          </small>
        </div>
        <button class="icon-button" aria-label="Sair" onClick={() => void client.auth.signOut()}>
          <LogOut />
        </button>
      </header>
      <aside class={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div class="sidebar-head mobile-only">
          <strong>Menu</strong>
          <button class="icon-button" aria-label="Fechar menu" onClick={() => setMobileMenu(false)}>
            <X />
          </button>
        </div>
        <nav aria-label="Navegação principal">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} class={screen === id ? 'active' : ''} onClick={() => go(id)}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div class="operator">
          <span>{context.fullName.slice(0, 1)}</span>
          <div>
            <strong>{context.fullName}</strong>
            <small>{context.email}</small>
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          class="menu-backdrop mobile-only"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <main class="app-main">
        {screen === 'dashboard' && <Dashboard client={client} context={context} go={go} />}
        {screen === 'intake' && (
          <Intake
            client={client}
            context={context}
            onDone={(id) => {
              setFocusPackageId(id);
              go('packages');
            }}
          />
        )}
        {screen === 'packages' && (
          <Packages client={client} context={context} focusPackageId={focusPackageId} />
        )}
        {screen === 'admin' && <Admin client={client} context={context} />}
      </main>
      <nav class="bottom-nav mobile-only" aria-label="Navegação rápida">
        {navigation.slice(0, 3).map(({ id, label, icon: Icon }) => (
          <button key={id} class={screen === id ? 'active' : ''} onClick={() => go(id)}>
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
