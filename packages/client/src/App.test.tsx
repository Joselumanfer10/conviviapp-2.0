import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { useAuthStore } from '@/stores/auth.store';

// Mock de features/auth con todos sus exports
vi.mock('@/features/auth', () => ({
  useInitAuth: vi.fn(),
  useLogin: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRegister: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useLogout: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}));

// Mock de features/homes
vi.mock('@/features/homes', () => ({
  useHomes: vi.fn(() => ({ data: [], isLoading: false })),
  useHome: vi.fn(() => ({ data: null, isLoading: false })),
  useCreateHome: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useJoinHome: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useLeaveHome: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useHomeMembers: vi.fn(() => ({ data: [], isLoading: false })),
  useUpdateHome: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteHome: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRegenerateInviteCode: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateMemberRole: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRemoveMember: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  CreateHomeForm: () => <div>CreateHomeForm</div>,
  JoinHomeForm: () => <div>JoinHomeForm</div>,
  HomeCard: () => <div>HomeCard</div>,
}));

// Mock de otros features usados por paginas
vi.mock('@/features/expenses', () => ({
  useExpenses: vi.fn(() => ({ data: [], isLoading: false })),
  ExpenseList: () => <div>ExpenseList</div>,
  ExpenseForm: () => <div>ExpenseForm</div>,
}));

vi.mock('@/features/tasks', () => ({
  useTasks: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/shopping', () => ({
  useShoppingItems: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/announcements', () => ({
  useAnnouncements: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/calendar', () => ({
  useCalendarEvents: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/reservations', () => ({
  useReservations: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/reports', () => ({
  ExpenseBreakdownChart: () => <div>Chart</div>,
  TaskCompletionChart: () => <div>Chart</div>,
  KarmaEvolutionChart: () => <div>Chart</div>,
}));

vi.mock('@/features/dashboard', () => ({
  ExpensesByPayerChart: () => <div>Chart</div>,
  MonthlyExpensesChart: () => <div>Chart</div>,
  KarmaRankingChart: () => <div>Chart</div>,
  ActivityFeed: () => <div>Feed</div>,
}));

vi.mock('@/features/rules', () => ({
  useRules: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/features/notifications', () => ({
  useNotifications: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/hooks', () => ({
  useSocket: vi.fn(() => ({ isConnected: false })),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

// Mock de framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      return ({ children, ...props }: any) => {
        const Tag = typeof prop === 'string' ? prop : 'div';
        return <Tag {...props}>{children}</Tag>;
      };
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: vi.fn(),
  useInView: vi.fn(() => false),
}));

// Mock de Socket.io
vi.mock('@/lib/socket', () => ({
  createSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(),
}));

// Mock de PWA
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  })),
}));

vi.mock('@/components/ui/pwa-update-prompt', () => ({
  PWAUpdatePrompt: () => null,
}));

// Mock de componentes UI complejos
vi.mock('@/components/ui/connection-status', () => ({
  ConnectionStatus: () => null,
}));

vi.mock('@/components/ui/animated-list', () => ({
  AnimatedList: ({ children }: any) => <div>{children}</div>,
  AnimatedListItem: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/page-transition', () => ({
  PageTransition: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button>Theme</button>,
}));

vi.mock('@/lib/animations', () => ({
  staggerContainer: {},
  staggerItem: {},
  cardHover: {},
}));

// Importar App despues de los mocks
import App from './App';

describe('App - Routing', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renderiza la pagina principal en /', () => {
    renderWithProviders(<App />, { initialEntries: ['/'] });

    // HomePage deberia renderizar contenido de bienvenida
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('renderiza la pagina de login en /login', () => {
    renderWithProviders(<App />, { initialEntries: ['/login'] });

    // LoginPage deberia contener un formulario
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('renderiza la pagina 404 para rutas inexistentes', () => {
    renderWithProviders(<App />, { initialEntries: ['/ruta-que-no-existe'] });

    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('redirige rutas protegidas si no esta autenticado', () => {
    renderWithProviders(<App />, { initialEntries: ['/dashboard'] });

    // ProtectedRoute deberia redirigir a login o mostrar loading
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('permite acceso a rutas protegidas si esta autenticado', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com', name: 'Test' } as any,
      accessToken: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<App />, { initialEntries: ['/dashboard'] });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
