import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookupCodeOnServer } from '../invitationLogic.js';

export function CodeEntryPage() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã mời.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await lookupCodeOnServer(code.trim());
      if (!result) {
        setError('Mã mời không chính xác. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }

      // Mã đúng → chuyển sang trang thiệp cá nhân (chỉ cần guestId)
      navigate(`/i/${encodeURIComponent(result.guestId)}`);
    } catch (e) {
      console.error(e);
      setError('Không tra cứu được mã mời. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header style={{ marginBottom: 20 }}>
        <h1 className="app-header-title">Nhận thiệp của bạn</h1>
        <p className="app-header-subtitle">
          Nhập <strong>số thứ tự trong danh sách lớp</strong> để nhận thiệp nhé.
        </p>
      </header>

      <div className="card">
        <h2>Số thứ tự của bạn</h2>
        <small>
          Ví dụ: <code>001</code>, <code>002</code>, <code>015</code>... giống như{" "}
          <strong>số thứ tự trong danh sách lớp</strong> mà giáo viên gửi cho bạn.
        </small>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="codeInput">Nhập số thứ tự</label>
            <input
              id="codeInput"
              type="text"
              placeholder="VD: 001, 002, 015..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          {error && (
            <p className="note" style={{ color: '#b91c1c', marginTop: 4 }}>
              {error}
            </p>
          )}
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Đang tra cứu...' : 'Xem thiệp của tôi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

