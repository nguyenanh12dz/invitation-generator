import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadInvitationFromServer, lookupCodeOnServer } from '../invitationLogic.js';
import { InvitationPreview } from './InvitationPreview.jsx';
import { TEMPLATES } from '../templates.js';

export function GuestPage() {
  const { guestId } = useParams();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchConfig() {
      try {
        setError('');
        // Tra cứu mã khách để lấy invitationId
        const lookupResult = await lookupCodeOnServer(guestId);
        if (!lookupResult) {
          if (!cancelled) {
            setError('Mã mời không hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ người gửi thiệp.');
          }
          return;
        }

        // Load thiệp từ invitationId
        const data = await loadInvitationFromServer(lookupResult.invitationId);
        if (!cancelled) {
          if (!data) {
            setError('Không tìm thấy thiệp tương ứng. Có thể thiệp đã bị xoá hoặc chưa được lưu.');
          }
          setConfig(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError('Không tải được thiệp từ server. Vui lòng thử lại sau.');
        }
      }
    }
    fetchConfig();
    return () => {
      cancelled = true;
    };
  }, [guestId]);

  const templateId =
    config?.t && TEMPLATES[config.t] ? config.t : 'classic';
  const event = config?.e || {
    eventTitle: 'Thiệp mời sự kiện',
    hostMessage:
      'Gia đình chúng tôi trân trọng kính mời bạn đến tham dự buổi tiệc nhỏ cùng chúng tôi.',
    dateTime: '',
    location: '',
    note: '',
  };

  const [pageIndex, setPageIndex] = useState(0);

  const matchedGuest = useMemo(
    () => {
      const list = Array.isArray(config?.g) ? config.g : [];
      const code = (guestId || '').trim().toLowerCase();
      if (!code) return null;
      return (
        list.find((g) => (g.id || '').toLowerCase() === code) || null
      );
    },
    [guestId, config]
  );

  const guestForPreview = useMemo(() => {
    if (matchedGuest) {
      return {
        display: `${matchedGuest.name} (${matchedGuest.id})`,
        imageUrl: matchedGuest.imageUrl || '',
      };
    }
    return { display: '' };
  }, [matchedGuest]);

  const template = TEMPLATES[templateId] || TEMPLATES.classic;

  const goPrevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const goNextPage = () => {
    setPageIndex((prev) =>
      Math.min(prev + 1, template.pageCount - 1)
    );
  };

  return (
    <div className="invitation-page">
      {config && matchedGuest && (
        <div className="invitation-wrapper">
          <InvitationPreview
            templateId={templateId}
            pageIndex={pageIndex}
            eventData={event}
            guest={guestForPreview}
            showFooter={false}
          />
          {template.pageCount > 1 && (
            <div
              className="btn-row"
              style={{ justifyContent: 'space-between', marginTop: 12 }}
            >
              <div>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={goPrevPage}
                  disabled={pageIndex === 0}
                >
                  ◀ Trang trước
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={goNextPage}
                  disabled={pageIndex === template.pageCount - 1}
                  style={{ marginLeft: 8 }}
                >
                  Trang sau ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!config && !error && (
        <p className="note" style={{ textAlign: 'center' }}>
          Đang tải dữ liệu thiệp...
        </p>
      )}
      {error && (
        <p className="note" style={{ color: '#b91c1c', textAlign: 'center' }}>
          {error}
        </p>
      )}
      {config && !matchedGuest && !error && (
        <p className="note" style={{ color: '#b91c1c', textAlign: 'center' }}>
          Mã mời trong link không hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ
          người gửi thiệp.
        </p>
      )}
    </div>
  );
}

