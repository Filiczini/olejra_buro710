import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-4">
              Щось пішло не так
            </h1>
            <p className="text-zinc-600 mb-6">
              Виникла помилка при завантаженні сторінки
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Перезавантажити сторінку
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
