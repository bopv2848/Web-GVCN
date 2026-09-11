import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../components/common/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lỗi ứng dụng chưa xử lý (ErrorBoundary):', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 font-sans">
          <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi giao diện</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Hệ thống ghi nhận sự cố bất ngờ. Dữ liệu của Thầy vẫn an toàn. Vui lòng bấm thử lại hoặc tải lại trang.
            </p>
            {this.state.error && (
              <div className="text-left bg-rose-50 border border-rose-200 rounded-xl p-3 mb-6 overflow-auto max-h-48 text-xs font-mono text-rose-800 whitespace-pre-wrap break-all">
                <p className="font-bold mb-1">Chi tiết lỗi: {this.state.error.name}: {this.state.error.message}</p>
                <p className="text-[11px] text-rose-600">{this.state.error.stack}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline" size="md">
                Thử lại
              </Button>
              <Button onClick={this.handleReload} variant="primary" size="md">
                Tải lại trang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
