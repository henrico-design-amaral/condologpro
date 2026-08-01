import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const condominiumId = '11111111-1111-4111-8111-111111111111';
const packageId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function jwt(): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: userId, email: 'portaria@example.invalid', role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;
}

async function mockSupabase(page: Page, role = 'front_desk'): Promise<void> {
  await page.route('**/mock-supabase/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/mock-supabase', '');
    const headers = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 200, headers });
    if (path === '/auth/v1/token') {
      return route.fulfill({
        status: 200,
        headers,
        json: {
          access_token: jwt(),
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: userId,
            aud: 'authenticated',
            role: 'authenticated',
            email: 'portaria@example.invalid',
            email_confirmed_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: { full_name: 'Portaria Teste' },
            created_at: new Date().toISOString()
          }
        }
      });
    }
    if (path === '/auth/v1/user')
      return route.fulfill({
        status: 200,
        headers,
        json: {
          id: userId,
          aud: 'authenticated',
          role: 'authenticated',
          email: 'portaria@example.invalid',
          app_metadata: {},
          user_metadata: { full_name: 'Portaria Teste' },
          created_at: new Date().toISOString()
        }
      });
    if (path === '/rest/v1/profiles')
      return route.fulfill({
        status: 200,
        headers,
        json: { full_name: 'Portaria Teste', is_active: true }
      });
    if (path === '/rest/v1/user_condominiums')
      return route.fulfill({
        status: 200,
        headers,
        json: {
          id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          condominium_id: condominiumId,
          condominiums: {
            id: condominiumId,
            name: 'Condomínio Piloto',
            slug: 'condominio-piloto',
            whatsapp_phone: '5511999990000',
            retention_days: 365
          },
          user_roles: [{ roles: { code: role } }]
        }
      });
    if (path === '/rest/v1/rpc/get_dashboard_stats')
      return route.fulfill({
        status: 200,
        headers,
        json: {
          received_today: 1,
          awaiting_identification: 0,
          awaiting_notification: 1,
          awaiting_pickup: 0,
          picked_up_today: 0,
          old_packages: 0,
          problems: 0
        }
      });
    if (path === '/rest/v1/rpc/find_package_duplicates')
      return route.fulfill({ status: 200, headers, json: [] });
    if (path === '/rest/v1/rpc/create_package_intake')
      return route.fulfill({ status: 200, headers, json: packageId });
    if (path === '/rest/v1/units')
      return route.fulfill({
        status: 200,
        headers,
        json: [
          {
            id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            number: '104',
            label: 'Apto 104',
            block_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            blocks: { code: '01', label: 'Bloco 01' }
          }
        ]
      });
    if (path === '/rest/v1/rpc/search_packages')
      return route.fulfill({
        status: 200,
        headers,
        json: [
          {
            id: packageId,
            recipient_name: 'Destinatário Manual',
            tracking_code: 'E2E123',
            carrier_name: 'Correios',
            status: 'awaiting_notification',
            received_at: new Date().toISOString(),
            notified_at: null,
            picked_up_at: null,
            version: 1,
            notes: 'Entrada manual após falha do OCR',
            unit_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            resident_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            unit_number: '104',
            unit_label: 'Apto 104',
            block_code: '01',
            block_label: 'Bloco 01',
            resident_full_name: 'Destinatário Manual',
            resident_phone: '5511999990000',
            total_count: 1
          }
        ]
      });
    if (
      [
        '/rest/v1/package_images',
        '/rest/v1/package_recognition_results',
        '/rest/v1/package_notifications',
        '/rest/v1/package_pickups',
        '/rest/v1/package_status_history'
      ].includes(path)
    )
      return route.fulfill({ status: 200, headers, json: [] });
    return route.fulfill({ status: 200, headers, json: [] });
  });
}

async function login(page: Page, role = 'front_desk'): Promise<void> {
  await mockSupabase(page, role);
  await page.goto('/');
  await page.getByLabel('E-mail').fill('portaria@example.invalid');
  await page.getByLabel('Senha').fill('senha-segura-123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: /Bom trabalho/ })).toBeVisible();
}

test('fallback manual preserva o fluxo quando OCR ou câmera não são usados', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Receber encomenda' }).click();
  await page.getByLabel('Destinatário').fill('Destinatário Manual');
  await page.getByLabel('Código de rastreio').fill('E2E123');
  await page.getByLabel('Transportadora').fill('Correios');
  await page.getByLabel('Bloco ou unidade').fill('01 104');
  await page.getByRole('button', { name: 'Buscar unidade' }).click();
  await page.getByRole('button', { name: /Bloco 01.*Apto 104/ }).click();
  await page.getByLabel('Observações').fill('Entrada manual após falha do OCR');
  await page.getByRole('button', { name: 'Registrar encomenda' }).click();
  await expect(page.getByRole('heading', { name: 'Encomendas' })).toBeVisible();
  await expect(page.getByText('Destinatário Manual').first()).toBeVisible();
});

test('permissão de câmera negada oferece escolha de imagem e entrada manual', async ({
  page,
  context
}) => {
  await context.clearPermissions();
  await login(page);
  await page.getByRole('button', { name: 'Receber encomenda' }).click();
  await page.getByRole('button', { name: 'Abrir câmera' }).click();
  await expect(
    page.getByText(/Permissão de câmera negada|Não foi possível iniciar a câmera/)
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Escolher imagem' })).toBeEnabled();
  await expect(page.getByLabel('Destinatário')).toBeEditable();
});

test('captura por câmera mantém preview antes de qualquer upload', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1024');
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const drawing = canvas.getContext('2d');
      if (drawing) {
        drawing.fillStyle = '#f3f0ea';
        drawing.fillRect(0, 0, 640, 480);
        drawing.fillStyle = '#151313';
        drawing.font = '32px sans-serif';
        drawing.fillText('DESTINATÁRIO: ANA', 50, 100);
      }
      return canvas.captureStream(5);
    };
  });
  await login(page);
  await page.getByRole('button', { name: 'Receber encomenda' }).click();
  await page.getByRole('button', { name: 'Abrir câmera' }).click();
  await expect(page.getByLabel('Prévia ao vivo da câmera')).toBeVisible();
  await page.getByRole('button', { name: 'Fotografar etiqueta' }).click();
  await expect(page.getByAltText('Prévia da etiqueta selecionada')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ler etiqueta' })).toBeEnabled();
});

test('OCR assistivo mantém correção manual disponível', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1024');
  const fixturePage = await context.newPage();
  await fixturePage.setViewportSize({ width: 900, height: 460 });
  await fixturePage.setContent(
    '<style>body{margin:0;background:white;color:black;font:700 34px Arial;padding:45px;line-height:1.5}</style>DESTINATÁRIO: ANA BEATRIZ<br>BLOCO: 01<br>APTO: 104<br>CORREIOS<br>AB123456789BR'
  );
  const label = await fixturePage.screenshot({ type: 'png' });
  await fixturePage.close();
  await login(page);
  await page.getByRole('button', { name: 'Receber encomenda' }).click();
  await page
    .locator('input[type=file]')
    .first()
    .setInputFiles({ name: 'etiqueta-nitida.png', mimeType: 'image/png', buffer: label });
  await expect(page.getByAltText('Prévia da etiqueta selecionada')).toBeVisible();
  await page.getByRole('button', { name: 'Ler etiqueta' }).click();
  await expect(page.getByText(/Etiqueta lida|Leitura parcial/)).toBeVisible({ timeout: 90_000 });
  await expect(page.getByLabel('Destinatário')).toBeEditable();
  await expect(page.getByLabel('Destinatário')).not.toHaveValue('');
  await page.getByLabel('Destinatário').fill('Ana Beatriz corrigida');
  await expect(page.getByLabel('Destinatário')).toHaveValue('Ana Beatriz corrigida');
});

test('WhatsApp e retirada exigem confirmações separadas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1024');
  await login(page);
  await page.getByRole('button', { name: 'Encomendas' }).first().click();
  await page.getByRole('button', { name: /Destinatário Manual/ }).click();
  await page.getByRole('button', { name: 'WhatsApp' }).click();
  await page.evaluate(() => {
    window.open = () => null;
  });
  await page.getByRole('button', { name: 'Abrir WhatsApp' }).click();
  await expect(page.getByRole('button', { name: 'Confirmar que enviei' })).toBeEnabled();
  await page.getByRole('button', { name: 'Confirmar que enviei' }).click();
  await page.getByRole('button', { name: /Destinatário Manual/ }).click();
  await page.getByRole('button', { name: 'Retirada' }).click();
  await page.getByLabel('Quem está retirando').fill('Ana Beatriz');
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Confirmar retirada' }).click();
  await expect(page.getByRole('heading', { name: 'Encomendas' })).toBeVisible();
});

test('portaria recebe negativa explícita na administração', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1024');
  await login(page);
  await page.getByRole('button', { name: 'Administração' }).click();
  await expect(
    page.getByRole('heading', { name: 'Somente a administração configura o condomínio.' })
  ).toBeVisible();
});

test('administração acessa configurações sem ampliar o portal do morador', async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1024');
  await login(page, 'admin');
  await page.getByRole('button', { name: 'Administração' }).click();
  await expect(page.getByRole('heading', { name: 'Configurações operacionais' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Moradores' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Usuários' })).toBeVisible();
});

test('registra evidência visual mobile e desktop do dashboard', async ({ page }, testInfo) => {
  test.skip(!['mobile-390', 'desktop-1440'].includes(testInfo.project.name));
  await login(page);
  mkdirSync('output/visual', { recursive: true });
  await page.screenshot({
    path: `output/visual/dashboard-${testInfo.project.name}.png`,
    fullPage: true
  });
  await expect(page.getByText('Atividade recente')).toBeVisible();
});
